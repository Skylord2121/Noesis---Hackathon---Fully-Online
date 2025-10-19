/**
 * Whisper Client for Speech-to-Text
 * Integrates with local Whisper server (http://localhost:5000)
 * Falls back to browser Web Speech API if Whisper is unavailable
 */

class WhisperClient {
    constructor() {
        this.whisperUrl = 'http://localhost:5000';
        this.available = false;
        this.recording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.onTranscript = null;
        this.onInterim = null;
        this.silenceTimeout = null;
        this.silenceDelay = 1500; // Stop recording after 1.5s of silence
        this.checking = false;
    }

    /**
     * Check if Whisper server is available
     */
    async checkAvailability() {
        if (this.checking) return this.available;
        
        this.checking = true;
        console.log('[WHISPER] Checking server availability...');
        
        try {
            const response = await fetch(`${this.whisperUrl}/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(2000) // 2 second timeout
            });
            
            if (response.ok) {
                const data = await response.json();
                this.available = data.status === 'healthy' && data.model_loaded;
                
                if (this.available) {
                    console.log(`[WHISPER] ✓ Server available on ${data.device.toUpperCase()}`);
                    if (data.gpu_name) {
                        console.log(`[WHISPER] ✓ GPU: ${data.gpu_name}`);
                    }
                } else {
                    console.log('[WHISPER] ✗ Server not ready');
                }
            } else {
                this.available = false;
                console.log('[WHISPER] ✗ Server returned error');
            }
        } catch (error) {
            this.available = false;
            console.log('[WHISPER] ✗ Server not available, will use Web Speech API');
        }
        
        this.checking = false;
        return this.available;
    }

    /**
     * Start recording audio for transcription
     */
    async start(onTranscript, onInterim = null) {
        if (!this.available) {
            throw new Error('Whisper server not available');
        }

        this.onTranscript = onTranscript;
        this.onInterim = onInterim;

        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 16000
                } 
            });

            // Create MediaRecorder
            const options = { mimeType: 'audio/webm' };
            this.mediaRecorder = new MediaRecorder(stream, options);
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = async () => {
                if (this.audioChunks.length === 0) {
                    console.log('[WHISPER] No audio data captured');
                    return;
                }

                // Create audio blob
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                this.audioChunks = [];

                // Send to Whisper for transcription
                await this.transcribe(audioBlob);
            };

            // Start recording
            this.mediaRecorder.start();
            this.recording = true;
            console.log('[WHISPER] ✓ Recording started');

            // Auto-detect silence and stop recording
            this.detectSilence(stream);

        } catch (error) {
            console.error('[WHISPER] Failed to start recording:', error);
            throw error;
        }
    }

    /**
     * Detect silence in audio stream and auto-stop recording
     */
    detectSilence(stream) {
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        analyser.smoothingTimeConstant = 0.8;
        analyser.fftSize = 2048;
        microphone.connect(analyser);

        const checkSilence = () => {
            if (!this.recording) {
                audioContext.close();
                return;
            }

            analyser.getByteFrequencyData(dataArray);
            
            // Calculate RMS (volume)
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i] * dataArray[i];
            }
            const rms = Math.sqrt(sum / dataArray.length);
            const volume = Math.round(rms);

            // If volume is low (silence), start timeout
            if (volume < 15) {
                if (!this.silenceTimeout) {
                    this.silenceTimeout = setTimeout(() => {
                        console.log('[WHISPER] Silence detected, stopping recording...');
                        this.stop();
                    }, this.silenceDelay);
                }
            } else {
                // Clear timeout if sound detected
                if (this.silenceTimeout) {
                    clearTimeout(this.silenceTimeout);
                    this.silenceTimeout = null;
                }
            }

            requestAnimationFrame(checkSilence);
        };

        checkSilence();
    }

    /**
     * Stop recording
     */
    stop() {
        if (this.mediaRecorder && this.recording) {
            this.recording = false;
            this.mediaRecorder.stop();
            
            // Stop all tracks
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            
            console.log('[WHISPER] Recording stopped');
        }

        if (this.silenceTimeout) {
            clearTimeout(this.silenceTimeout);
            this.silenceTimeout = null;
        }
    }

    /**
     * Send audio to Whisper for transcription
     */
    async transcribe(audioBlob) {
        try {
            console.log('[WHISPER] Sending audio for transcription...');
            
            const formData = new FormData();
            formData.append('audio', audioBlob, 'audio.webm');

            const response = await fetch(`${this.whisperUrl}/transcribe`, {
                method: 'POST',
                body: formData,
                signal: AbortSignal.timeout(30000) // 30 second timeout
            });

            if (!response.ok) {
                throw new Error(`Whisper API error: ${response.status}`);
            }

            const result = await response.json();

            if (result.success && result.text) {
                const transcript = result.text.trim();
                console.log(`[WHISPER] ✓ Transcribed: "${transcript}"`);
                
                // Call callback with transcript
                if (this.onTranscript) {
                    this.onTranscript(transcript, result);
                }
            } else {
                console.error('[WHISPER] No transcript in response');
            }

        } catch (error) {
            console.error('[WHISPER] Transcription failed:', error);
        }
    }

    /**
     * Transcribe audio stream in real-time (chunked)
     */
    async transcribeStream(audioBlob) {
        try {
            console.log('[WHISPER] Transcribing stream chunk...');

            const response = await fetch(`${this.whisperUrl}/transcribe-stream`, {
                method: 'POST',
                headers: { 'Content-Type': 'audio/webm' },
                body: audioBlob,
                signal: AbortSignal.timeout(10000)
            });

            if (!response.ok) {
                throw new Error(`Whisper stream API error: ${response.status}`);
            }

            const result = await response.json();

            if (result.success && result.text) {
                const transcript = result.text.trim();
                console.log(`[WHISPER] ✓ Stream: "${transcript}"`);
                
                if (this.onInterim) {
                    this.onInterim(transcript);
                }
            }

        } catch (error) {
            console.error('[WHISPER] Stream transcription failed:', error);
        }
    }
}

// Export for use in other scripts
window.WhisperClient = WhisperClient;
