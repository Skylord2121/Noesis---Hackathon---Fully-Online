/**
 * Hybrid Speech Recognition
 * Prefers Whisper (local server) but falls back to Web Speech API
 * Provides unified interface for both methods
 */

class HybridSpeechRecognition {
    constructor() {
        this.whisperClient = new WhisperClient();
        this.webSpeechRecognition = null;
        this.usingWhisper = false;
        this.active = false;
        this.onResult = null;
        this.onInterim = null;
        this.onError = null;
        this.onStart = null;
        this.onEnd = null;
    }

    /**
     * Initialize - detect best available method
     */
    async initialize() {
        console.log('[HYBRID STT] Initializing speech recognition...');
        
        // Try Whisper first
        const whisperAvailable = await this.whisperClient.checkAvailability();
        
        if (whisperAvailable) {
            console.log('[HYBRID STT] ✓ Using Whisper (local server)');
            this.usingWhisper = true;
            return 'whisper';
        }
        
        // Fall back to Web Speech API
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            console.log('[HYBRID STT] ✓ Using Web Speech API (fallback)');
            this.usingWhisper = false;
            this.initializeWebSpeech();
            return 'webspeech';
        }
        
        // No STT available
        console.error('[HYBRID STT] ✗ No speech recognition available');
        throw new Error('No speech recognition method available');
    }

    /**
     * Initialize Web Speech API
     */
    initializeWebSpeech() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.webSpeechRecognition = new SpeechRecognition();
        this.webSpeechRecognition.continuous = true;
        this.webSpeechRecognition.interimResults = true;
        this.webSpeechRecognition.lang = 'en-US';

        this.webSpeechRecognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                const isFinal = event.results[i].isFinal;
                
                if (isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            // Call interim callback
            if (interimTranscript && this.onInterim) {
                this.onInterim(interimTranscript);
            }

            // Call result callback for final transcript
            if (finalTranscript && this.onResult) {
                this.onResult(finalTranscript, { 
                    source: 'webspeech',
                    confidence: event.results[event.resultIndex][0].confidence || 1.0
                });
            }
        };

        this.webSpeechRecognition.onstart = () => {
            console.log('[HYBRID STT] Web Speech started');
            if (this.onStart) this.onStart();
        };

        this.webSpeechRecognition.onerror = (event) => {
            console.error('[HYBRID STT] Web Speech error:', event.error);
            if (this.onError) this.onError(event.error);
        };

        this.webSpeechRecognition.onend = () => {
            console.log('[HYBRID STT] Web Speech ended');
            if (this.active) {
                // Auto-restart if still active
                try {
                    this.webSpeechRecognition.start();
                } catch (e) {
                    console.error('[HYBRID STT] Error restarting Web Speech:', e);
                }
            }
            if (this.onEnd) this.onEnd();
        };
    }

    /**
     * Start recognition
     */
    async start() {
        if (this.active) {
            console.warn('[HYBRID STT] Already active');
            return;
        }

        this.active = true;

        if (this.usingWhisper) {
            // Start Whisper recording
            await this.whisperClient.start(
                // onTranscript callback
                (transcript, details) => {
                    if (this.onResult) {
                        this.onResult(transcript, {
                            source: 'whisper',
                            language: details.language,
                            words: details.words,
                            confidence: 0.95 // Whisper is typically 95%+ accurate
                        });
                    }
                    
                    // Auto-restart for continuous recognition
                    if (this.active) {
                        setTimeout(() => this.start(), 500);
                    }
                },
                // onInterim callback
                (interimText) => {
                    if (this.onInterim) {
                        this.onInterim(interimText);
                    }
                }
            );

            if (this.onStart) this.onStart();
        } else {
            // Start Web Speech API
            try {
                this.webSpeechRecognition.start();
            } catch (e) {
                console.error('[HYBRID STT] Failed to start Web Speech:', e);
                if (this.onError) this.onError(e);
            }
        }
    }

    /**
     * Stop recognition
     */
    stop() {
        this.active = false;

        if (this.usingWhisper) {
            this.whisperClient.stop();
        } else if (this.webSpeechRecognition) {
            try {
                this.webSpeechRecognition.stop();
            } catch (e) {
                console.error('[HYBRID STT] Error stopping Web Speech:', e);
            }
        }
    }

    /**
     * Get current method being used
     */
    getCurrentMethod() {
        return this.usingWhisper ? 'whisper' : 'webspeech';
    }

    /**
     * Check if Whisper is being used
     */
    isUsingWhisper() {
        return this.usingWhisper;
    }
}

// Export for use in other scripts
window.HybridSpeechRecognition = HybridSpeechRecognition;
