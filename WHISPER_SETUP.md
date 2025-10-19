# 🎤 Whisper Speech-to-Text Setup Guide (Windows)

## Prerequisites
- ✅ Python 3.8+ installed
- ✅ NVIDIA GPU (GTX series or better)
- ✅ ~2GB free disk space

---

## Step 1: Install Dependencies

Open **Command Prompt** or **PowerShell** and run:

```bash
# Install PyTorch with CUDA support (for GPU acceleration)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Install Whisper and Flask
pip install openai-whisper flask flask-cors

# Install FFmpeg (required for audio processing)
# Download from: https://www.gyan.dev/ffmpeg/builds/
# Add to PATH or use pip:
pip install ffmpeg-python
```

**Alternative FFmpeg installation:**
1. Download FFmpeg from: https://www.gyan.dev/ffmpeg/builds/
2. Extract to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to System PATH

---

## Step 2: Verify GPU Support

```bash
python -c "import torch; print('GPU Available:', torch.cuda.is_available()); print('GPU Name:', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'None')"
```

**Expected output:**
```
GPU Available: True
GPU Name: NVIDIA GeForce GTX 1660
```

---

## Step 3: Test Whisper Installation

```bash
python -c "import whisper; print('Whisper version:', whisper.__version__)"
```

**Expected output:**
```
Whisper version: 20231117
```

---

## Step 4: Start Whisper Server

Navigate to your project directory and run:

```bash
cd C:\path\to\your\webapp
python whisper_server.py
```

**Expected output:**
```
============================================================
🎤 Whisper Speech-to-Text Server
============================================================
✓ CUDA GPU detected: NVIDIA GeForce GTX 1660
✓ CUDA version: 11.8
Loading Whisper 'base' model on cuda...
✓ Whisper model loaded successfully on cuda

✓ Server ready!
✓ Device: CUDA
✓ Listening on: http://localhost:5000

Endpoints:
  GET  /health          - Check server status
  POST /transcribe      - Transcribe audio file
  POST /transcribe-stream - Transcribe audio stream
  GET  /models          - List available models

============================================================
```

---

## Step 5: Test Server

Open a new terminal and test:

```bash
# Check health
curl http://localhost:5000/health

# Expected response:
# {"status":"healthy","model_loaded":true,"device":"cuda","gpu_available":true,"gpu_name":"NVIDIA GeForce GTX 1660"}
```

---

## Step 6: Configure Frontend

The frontend will automatically detect Whisper server at `http://localhost:5000`.

**No configuration needed!** The frontend will:
1. Try to connect to Whisper server
2. Fall back to browser Web Speech API if Whisper is unavailable

---

## Whisper Model Sizes

| Model | Size | VRAM | Speed | Accuracy | Recommendation |
|-------|------|------|-------|----------|----------------|
| tiny  | 39M  | ~1GB | 32x   | Low      | Testing only |
| **base** | **74M** | **~1GB** | **16x** | **Good** | **✅ RECOMMENDED** |
| small | 244M | ~2GB | 6x    | Better   | If you have VRAM |
| medium | 769M | ~5GB | 2x   | Great    | High-end GPU |
| large | 1550M | ~10GB | 1x  | Best     | RTX 3090/4090 |

**Default:** `base` model (good balance for real-time transcription)

**To change model:** Edit line 55 in `whisper_server.py`:
```python
model_size = "base"  # Change to: tiny, small, medium, large
```

---

## Troubleshooting

### Issue: `ModuleNotFoundError: No module named 'torch'`
**Solution:** Install PyTorch:
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

### Issue: `GPU not detected (using CPU)`
**Solution:** 
1. Update NVIDIA drivers: https://www.nvidia.com/Download/index.aspx
2. Reinstall PyTorch with CUDA:
```bash
pip uninstall torch torchvision torchaudio
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

### Issue: `ffmpeg not found`
**Solution:** 
1. Download FFmpeg: https://www.gyan.dev/ffmpeg/builds/
2. Extract to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to System PATH
4. Restart terminal

### Issue: Port 5000 already in use
**Solution:** Change port in `whisper_server.py` (line 185):
```python
app.run(host='0.0.0.0', port=5001, debug=False)  # Change to 5001
```

---

## Performance Expectations

### Base Model on GTX 1660:
- **Transcription speed**: ~2-3 seconds per 10-second audio clip
- **Real-time factor**: ~5-8x (can transcribe 1 minute of audio in 7-12 seconds)
- **Accuracy**: 95-98% for clear English speech
- **VRAM usage**: ~1GB

### Comparison to Web Speech API:
- **Accuracy**: 95-98% (vs 80-85% Web Speech)
- **Accent handling**: Excellent (vs Poor)
- **Background noise**: Robust (vs Struggles)
- **Latency**: ~2-3s delay (vs Real-time)

---

## Next Steps

Once Whisper server is running:

1. ✅ Keep the server running in a terminal
2. ✅ Start your webapp: `npm run dev` (in a new terminal)
3. ✅ Open webapp in browser
4. ✅ Start a call - transcription will automatically use Whisper!

**The frontend will detect Whisper automatically and prefer it over Web Speech API.**

---

## Optional: Run as Windows Service

To run Whisper server automatically on Windows startup:

### Option 1: Task Scheduler
1. Open Task Scheduler
2. Create Basic Task
3. Trigger: "When I log on"
4. Action: Start a program
5. Program: `python`
6. Arguments: `C:\path\to\webapp\whisper_server.py`

### Option 2: NSSM (Non-Sucking Service Manager)
```bash
# Download NSSM: https://nssm.cc/download
nssm install WhisperSTT python C:\path\to\webapp\whisper_server.py
nssm start WhisperSTT
```

---

## Stopping the Server

Press `Ctrl + C` in the terminal running `whisper_server.py`

---

## Logs

Logs are printed to console. To save logs to file:

```bash
python whisper_server.py > whisper.log 2>&1
```

---

## Questions?

- Server not starting? Check Python version: `python --version` (need 3.8+)
- GPU not detected? Update NVIDIA drivers
- Poor accuracy? Try `small` model (needs ~2GB VRAM)
- Too slow? Use `tiny` model (lower accuracy but faster)
