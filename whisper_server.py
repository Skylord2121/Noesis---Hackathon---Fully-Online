"""
Whisper Speech-to-Text API Server
Runs locally on localhost:5000 and provides real-time transcription using OpenAI Whisper
GPU-accelerated (CUDA) for faster processing
"""

import os
import io
import torch
import whisper
from flask import Flask, request, jsonify
from flask_cors import CORS
import tempfile
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for browser requests

# Global model variable
model = None
device = None

def initialize_model():
    """Initialize Whisper model with GPU support"""
    global model, device
    
    # Check for GPU
    if torch.cuda.is_available():
        device = "cuda"
        logger.info(f"✓ CUDA GPU detected: {torch.cuda.get_device_name(0)}")
        logger.info(f"✓ CUDA version: {torch.version.cuda}")
    else:
        device = "cpu"
        logger.warning("⚠ No GPU detected, using CPU (slower)")
    
    # Load Whisper model (base = 74M params, ~390MB disk, ~1GB VRAM)
    # Options: tiny, base, small, medium, large
    # Recommendation: base (good balance of speed/accuracy)
    model_size = "base"
    logger.info(f"Loading Whisper '{model_size}' model on {device}...")
    
    try:
        model = whisper.load_model(model_size, device=device)
        logger.info(f"✓ Whisper model loaded successfully on {device}")
        return True
    except Exception as e:
        logger.error(f"✗ Failed to load model: {e}")
        return False

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "device": device,
        "gpu_available": torch.cuda.is_available(),
        "gpu_name": torch.cuda.get_device_name(0) if torch.cuda.is_available() else None
    })

@app.route('/transcribe', methods=['POST'])
def transcribe():
    """
    Transcribe audio file
    Accepts: audio file (wav, mp3, webm, etc.)
    Returns: { text, segments, language }
    """
    try:
        # Check if model is loaded
        if model is None:
            return jsonify({"error": "Model not loaded"}), 500
        
        # Get audio file from request
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400
        
        audio_file = request.files['audio']
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as temp_audio:
            audio_file.save(temp_audio.name)
            temp_path = temp_audio.name
        
        logger.info(f"Processing audio file: {audio_file.filename}")
        
        # Transcribe with Whisper
        # Options:
        # - language: None (auto-detect) or 'en', 'es', 'fr', etc.
        # - task: 'transcribe' or 'translate' (translate to English)
        # - fp16: True (use float16 for GPU, faster)
        result = model.transcribe(
            temp_path,
            language=None,  # Auto-detect language
            task='transcribe',
            fp16=(device == 'cuda'),  # Use FP16 on GPU for speed
            verbose=False,
            word_timestamps=True  # Get word-level timestamps
        )
        
        # Clean up temp file
        os.unlink(temp_path)
        
        # Extract results
        text = result['text'].strip()
        segments = result.get('segments', [])
        language = result.get('language', 'en')
        
        # Process segments to extract word-level data
        words = []
        for segment in segments:
            if 'words' in segment:
                for word_info in segment['words']:
                    words.append({
                        'word': word_info.get('word', '').strip(),
                        'start': word_info.get('start', 0),
                        'end': word_info.get('end', 0),
                        'confidence': word_info.get('probability', 1.0)
                    })
        
        logger.info(f"✓ Transcribed: '{text}' (language: {language})")
        
        return jsonify({
            "success": True,
            "text": text,
            "language": language,
            "segments": segments,
            "words": words,
            "device": device
        })
        
    except Exception as e:
        logger.error(f"✗ Transcription error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/transcribe-stream', methods=['POST'])
def transcribe_stream():
    """
    Transcribe audio chunk (for streaming/real-time)
    Accepts: audio chunk as binary data
    Returns: { text }
    """
    try:
        if model is None:
            return jsonify({"error": "Model not loaded"}), 500
        
        # Get audio data
        audio_data = request.get_data()
        if not audio_data:
            return jsonify({"error": "No audio data provided"}), 400
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as temp_audio:
            temp_audio.write(audio_data)
            temp_path = temp_audio.name
        
        # Transcribe
        result = model.transcribe(
            temp_path,
            language='en',  # Assume English for streaming (faster)
            task='transcribe',
            fp16=(device == 'cuda'),
            verbose=False
        )
        
        # Clean up
        os.unlink(temp_path)
        
        text = result['text'].strip()
        logger.info(f"✓ Stream transcribed: '{text}'")
        
        return jsonify({
            "success": True,
            "text": text
        })
        
    except Exception as e:
        logger.error(f"✗ Stream transcription error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/models', methods=['GET'])
def list_models():
    """List available Whisper models"""
    models = {
        "tiny": {"params": "39M", "vram": "~1GB", "speed": "~32x", "accuracy": "Low"},
        "base": {"params": "74M", "vram": "~1GB", "speed": "~16x", "accuracy": "Good"},
        "small": {"params": "244M", "vram": "~2GB", "speed": "~6x", "accuracy": "Better"},
        "medium": {"params": "769M", "vram": "~5GB", "speed": "~2x", "accuracy": "Great"},
        "large": {"params": "1550M", "vram": "~10GB", "speed": "~1x", "accuracy": "Best"}
    }
    return jsonify({
        "current": "base",
        "available": models,
        "recommendation": "base (good balance of speed/accuracy for real-time use)"
    })

if __name__ == '__main__':
    print("=" * 60)
    print("🎤 Whisper Speech-to-Text Server")
    print("=" * 60)
    
    # Initialize model
    if initialize_model():
        print("\n✓ Server ready!")
        print(f"✓ Device: {device.upper()}")
        print(f"✓ Listening on: http://localhost:5000")
        print("\nEndpoints:")
        print("  GET  /health          - Check server status")
        print("  POST /transcribe      - Transcribe audio file")
        print("  POST /transcribe-stream - Transcribe audio stream")
        print("  GET  /models          - List available models")
        print("\n" + "=" * 60)
        
        # Start Flask server
        app.run(host='0.0.0.0', port=5000, debug=False)
    else:
        print("\n✗ Failed to initialize model. Exiting.")
        exit(1)
