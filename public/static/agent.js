// Agent Dashboard with Real-Time Customer Transcript
// Human Agent responds, AI provides coaching and tracking

// Session management
let currentSessionId = null;
let customerLink = null;
let pollInterval = null;
let voiceMetricsInterval = null;
let lastMessageTimestamp = 0;

// State management
let conversationHistory = [];
let customerIssueFixed = false;
let customerNameFixed = false;
let statusUpdateCount = 0;
let customerHasSpoken = false;

// Agent speech recognition
let agentRecognition = null;
let isAgentSpeaking = false;
let isAgentRecognitionActive = false;

// AI connection (now using Cloudflare AI - always available)
let ollamaConnected = true; // Always true since it's cloud-based

// Call timer
let callStartTime = null;

function updateCallTimer() {
    if (!callStartTime) return;
    const elapsed = Math.floor((Date.now() - callStartTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    const callTime = document.getElementById('call-time');
    if (callTime) {
        callTime.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
}

// Generate unique session ID (short 6-character code)
function generateSessionId() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}

// Initialize new session
function startNewSession() {
    currentSessionId = generateSessionId();
    const baseUrl = window.location.origin;
    customerLink = `${baseUrl}/static/customer.html?session=${currentSessionId}`;
    
    console.log('[AGENT] Starting new session');
    console.log('[AGENT] Session ID:', currentSessionId);
    console.log('[AGENT] Customer Link:', customerLink);
    
    // Show session info modal
    showSessionModal();
    
    // Start polling for customer messages
    console.log('[AGENT] Starting message polling...');
    startPolling();
    
    // Update UI
    updateModeIndicator('active');
    
    // Hide start button, show speak button
    const startBtn = document.getElementById('start-session-btn');
    const speakBtn = document.getElementById('agent-speak-btn');
    if (startBtn) startBtn.classList.add('hidden');
    if (speakBtn) speakBtn.classList.remove('hidden');
    
    // Start call timer
    callStartTime = Date.now();
    setInterval(updateCallTimer, 1000);
    
    console.log('[AGENT] Session initialized, polling every 1 second');
}

function showSessionModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="glass-panel p-6 max-w-2xl w-full rounded-xl">
            <div class="mb-4">
                <h2 class="text-xl font-bold text-gray-200 mb-2">
                    <i class="fas fa-link mr-2 text-blue-400"></i>
                    Customer Session Link
                </h2>
                <p class="text-sm text-gray-400">Share this link with your customer to start the call</p>
            </div>
            
            <div class="bg-slate-800/60 border border-slate-700/50 rounded-lg p-4 mb-4">
                <div class="flex items-center gap-3">
                    <input 
                        type="text" 
                        id="customer-link-input" 
                        value="${customerLink}" 
                        readonly
                        class="flex-1 px-3 py-2 bg-slate-900/60 border border-slate-600/50 rounded-lg text-sm text-gray-200 focus:outline-none"
                    />
                    <button 
                        onclick="copyCustomerLink()" 
                        class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition flex items-center gap-2"
                    >
                        <i class="fas fa-copy"></i>
                        Copy
                    </button>
                </div>
            </div>
            
            <div class="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4">
                <div class="flex items-start gap-2">
                    <i class="fas fa-info-circle text-green-400 mt-0.5"></i>
                    <div class="text-xs text-gray-300">
                        <strong>How it works:</strong><br/>
                        1. Copy and send this link to your customer<br/>
                        2. They click the microphone to speak<br/>
                        3. You see their transcript in real-time<br/>
                        4. You respond using your microphone<br/>
                        5. AI provides coaching and tracks metrics
                    </div>
                </div>
            </div>
            
            <div class="flex justify-between items-center">
                <div class="text-xs text-gray-500">
                    Session ID: ${currentSessionId}
                </div>
                <button 
                    onclick="closeSessionModal()" 
                    class="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition"
                >
                    <i class="fas fa-check mr-2"></i>Got It
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    window.sessionModalElement = modal;
}

function copyCustomerLink() {
    const input = document.getElementById('customer-link-input');
    input.select();
    document.execCommand('copy');
    
    showToast('Link copied to clipboard!', 'success');
}

function closeSessionModal() {
    if (window.sessionModalElement) {
        window.sessionModalElement.remove();
    }
}

// Poll for new customer messages
function startPolling() {
    if (pollInterval) {
        console.log('[AGENT] Clearing existing poll interval');
        clearInterval(pollInterval);
    }
    
    console.log('[AGENT] Setting up new poll interval (1 second for messages, continuous for voice)');
    pollInterval = setInterval(async () => {
        await fetchNewMessages();
        await fetchSessionStatus(); // Poll for call status and verification
    }, 1000); // Poll every second
    
    // SEPARATE interval for voice metrics - poll more frequently (500ms)
    voiceMetricsInterval = setInterval(async () => {
        await fetchVoiceMetrics(); // Poll for real-time voice metrics
    }, 500); // Poll every 500ms for smoother spectrum animation
    
    // Immediate first fetch
    console.log('[AGENT] Doing immediate first fetch');
    fetchNewMessages();
}

function stopPolling() {
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
    if (voiceMetricsInterval) {
        clearInterval(voiceMetricsInterval);
        voiceMetricsInterval = null;
    }
}

// Fetch new messages from server
async function fetchNewMessages() {
    if (!currentSessionId) {
        console.log('[AGENT] No session ID, skipping message fetch');
        return;
    }
    
    try {
        console.log(`[AGENT] Polling for messages - Session: ${currentSessionId}, Since: ${lastMessageTimestamp}`);
        const response = await fetch(`/api/session/messages?sessionId=${currentSessionId}&since=${lastMessageTimestamp}`);
        
        if (!response.ok) {
            console.error('[AGENT] Failed to fetch messages:', response.status, response.statusText);
            return;
        }
        
        const data = await response.json();
        console.log('[AGENT] Poll response:', data);
        
        if (data.messages && data.messages.length > 0) {
            console.log(`[AGENT] Received ${data.messages.length} new message(s)`);
            for (const message of data.messages) {
                console.log(`[AGENT] Processing message:`, message);
                if (message.role === 'customer') {
                    console.log('[AGENT] CUSTOMER MESSAGE:', message.content);
                    // Customer message received with voice metrics
                    await handleCustomerMessage(message.content, message.voiceMetrics);
                    lastMessageTimestamp = message.timestamp;
                    
                    if (!customerHasSpoken) {
                        customerHasSpoken = true;
                        console.log('[AGENT] First customer message received!');
                    }
                }
            }
        } else {
            // Only log occasionally to avoid spam
            if (Math.random() < 0.1) {
                console.log('[AGENT] No new messages');
            }
        }
    } catch (error) {
        console.error('[AGENT] Error fetching messages:', error);
    }
}

// Fetch session status and verification (real-time)
async function fetchSessionStatus() {
    if (!currentSessionId) return;
    
    try {
        const response = await fetch(`/api/session/status?sessionId=${currentSessionId}`);
        
        if (!response.ok) return;
        
        const data = await response.json();
        
        if (data.success && data.status) {
            // Update call status UI
            const statusElem = document.getElementById('call-status');
            if (statusElem && data.status.status) {
                const statusColors = {
                    'active': { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
                    'on-hold': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
                    'ended': { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' }
                };
                const colors = statusColors[data.status.status] || statusColors['active'];
                statusElem.innerHTML = `<span class="text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} border ${colors.border}">${data.status.status.replace('-', ' ').toUpperCase()}</span>`;
            }
            
            // Update verification UI
            const verifyElem = document.getElementById('customer-verification-status');
            if (verifyElem) {
                if (data.status.isVerified) {
                    verifyElem.innerHTML = '<span class="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">Verified</span>';
                } else {
                    verifyElem.innerHTML = '<span class="text-xs px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">Unverified</span>';
                }
            }
        }
    } catch (error) {
        // Silent fail - not critical
    }
}

// Fetch real-time voice metrics for spectrum visualization
async function fetchVoiceMetrics() {
    if (!currentSessionId) return;
    
    try {
        const response = await fetch(`/api/session/voice-metrics?sessionId=${currentSessionId}`);
        
        if (!response.ok) return;
        
        const data = await response.json();
        
        if (data.metrics && data.metrics.volume > 0) {
            // Update spectrum bars with real-time voice data
            animateCustomerSpectrumWithMetrics(data.metrics);
        }
    } catch (error) {
        // Silent fail - not critical
    }
}

// Handle incoming customer message with voice metrics
async function handleCustomerMessage(text, voiceMetrics = null) {
    console.log('[AGENT] handleCustomerMessage called');
    console.log('[AGENT] Customer said:', text);
    console.log('[AGENT] Voice metrics:', voiceMetrics);
    
    // Add to conversation history with voice data (before transcript for AI analysis)
    conversationHistory.push({
        role: 'customer',
        content: text,
        timestamp: Date.now(),
        voiceMetrics: voiceMetrics
    });
    console.log('[AGENT] Conversation history updated, total messages:', conversationHistory.length);
    
    // Animate spectrum bars when customer speaks with voice metrics
    console.log('[AGENT] Animating customer spectrum...');
    if (voiceMetrics && voiceMetrics.volume > 0) {
        animateCustomerSpectrumWithMetrics(voiceMetrics);
    } else {
        animateCustomerSpectrum();
    }
    
    // Get AI analysis first to obtain emotion score
    let emotionScore = null;
    try {
        const analysis = await getAIAnalysis(text, voiceMetrics);
        if (analysis && analysis.empathy !== undefined) {
            emotionScore = analysis.empathy;
            // Process all other metrics
            processAIAnalysis(analysis);
        }
    } catch (error) {
        console.error('[AGENT] Error getting AI analysis:', error);
    }
    
    // Add to transcript WITH emotion score
    console.log('[AGENT] Adding to transcript with emotion score:', emotionScore);
    addTranscriptMessage('customer', text, emotionScore);
}

// Animate customer voice spectrum with real voice metrics
function animateCustomerSpectrumWithMetrics(voiceMetrics) {
    const bars = document.querySelectorAll('.spectrum-bar');
    if (!bars || bars.length === 0) return;
    
    console.log('[AGENT] Animating spectrum with voice data:', voiceMetrics);
    
    // Calculate intensity based on volume and energy
    const intensity = Math.min((voiceMetrics.volume + voiceMetrics.energy) / 100, 1.5);
    const duration = voiceMetrics.speechRate > 3 ? 0.8 : 1.2; // Faster animation for faster speech
    
    // Animate bars based on actual voice metrics
    bars.forEach((bar, index) => {
        const scale = 0.2 + (intensity * (0.8 + Math.random() * 0.4));
        bar.style.animation = `wave ${duration}s ease-in-out infinite`;
        bar.style.animationDelay = `${index * 0.05}s`;
        bar.style.setProperty('--scale-height', scale.toString());
    });
    
    // Keep animating for 3 seconds then fade out
    setTimeout(() => {
        bars.forEach(bar => {
            bar.style.animation = 'none';
            bar.style.transform = 'scaleY(0.1)';
        });
    }, 3000);
}

// Animate customer voice spectrum (fallback without metrics)
function animateCustomerSpectrum() {
    const bars = document.querySelectorAll('.spectrum-bar');
    if (!bars || bars.length === 0) return;
    
    // Animate bars for 2 seconds
    bars.forEach((bar, index) => {
        bar.style.animation = 'wave 1.5s ease-in-out infinite';
        bar.style.animationDelay = `${index * 0.05}s`;
    });
    
    // Stop animation after 2 seconds
    setTimeout(() => {
        bars.forEach(bar => {
            bar.style.animation = 'none';
            bar.style.transform = 'scaleY(0.1)';
        });
    }, 2000);
}

// Send agent's response to customer
async function sendAgentMessage(text) {
    console.log('[AGENT] sendAgentMessage called with:', text);
    
    if (!currentSessionId) {
        console.error('[AGENT] No session ID, cannot send message');
        return;
    }
    
    try {
        console.log('[AGENT] Sending agent message to API...');
        const response = await fetch('/api/session/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sessionId: currentSessionId,
                role: 'agent',
                content: text,
                timestamp: Date.now()
            })
        });
        
        if (!response.ok) {
            console.error('[AGENT] API error:', response.status, response.statusText);
            throw new Error('Failed to send message');
        }
        
        console.log('[AGENT] Message sent successfully to API');
        
        // Add to local transcript
        console.log('[AGENT] Adding to transcript UI...');
        addTranscriptMessage('agent', text);
        
        // Add to conversation history
        conversationHistory.push({
            role: 'agent',
            content: text,
            timestamp: Date.now()
        });
        
        console.log('[AGENT] Agent message processed completely');
        
    } catch (error) {
        console.error('Error sending agent message:', error);
        showToast('Failed to send message', 'error');
    }
}

// Initialize agent speech recognition
function initializeAgentRecognition() {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        showToast('Speech recognition not supported', 'error');
        return false;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    agentRecognition = new SpeechRecognition();
    agentRecognition.continuous = true;
    agentRecognition.interimResults = true;
    agentRecognition.lang = 'en-US';
    
    let finalTranscript = '';
    
    agentRecognition.onresult = (event) => {
        console.log('[AGENT] Recognition result event received');
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            const isFinal = event.results[i].isFinal;
            
            console.log(`[AGENT] Transcript (${isFinal ? 'FINAL' : 'interim'}): "${transcript}"`);
            
            if (isFinal) {
                finalTranscript += transcript + ' ';
                
                // Send agent's message
                console.log('[AGENT] Sending final agent message:', transcript);
                sendAgentMessage(transcript);
            } else {
                interimTranscript += transcript;
                // Show interim results in real-time (optional)
                console.log('[AGENT] Interim text:', interimTranscript);
            }
        }
    };
    
    agentRecognition.onerror = (event) => {
        console.error('[AGENT] Speech recognition error:', event.error);
        
        // Don't stop for these benign errors
        if (event.error === 'no-speech') {
            console.log('[AGENT] No speech detected, continuing...');
            return;
        }
        
        if (event.error === 'aborted') {
            console.log('[AGENT] Recognition aborted, will auto-restart via onend');
            return;
        }
        
        // Only stop for serious errors
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            showToast('Microphone access denied', 'error');
            stopAgentSpeaking();
        } else {
            console.log('[AGENT] Non-critical error, continuing...');
        }
    };
    
    agentRecognition.onend = () => {
        console.log('[AGENT] Speech recognition ended, isAgentSpeaking:', isAgentSpeaking);
        isAgentRecognitionActive = false;
        
        // Auto-restart if agent is still supposed to be speaking
        if (isAgentSpeaking) {
            // Add small delay to prevent rapid restart issues
            setTimeout(() => {
                if (isAgentSpeaking) { // Check again after delay
                    try {
                        console.log('[AGENT] Auto-restarting speech recognition...');
                        agentRecognition.start();
                        isAgentRecognitionActive = true;
                        console.log('[AGENT] Speech recognition restarted successfully');
                    } catch (e) {
                        console.error('[AGENT] Error restarting agent recognition:', e);
                        // If already started, that's fine
                        if (e.message.includes('already started')) {
                            isAgentRecognitionActive = true;
                        } else {
                            // Try again after longer delay
                            setTimeout(() => {
                                if (isAgentSpeaking) {
                                    try {
                                        agentRecognition.start();
                                        isAgentRecognitionActive = true;
                                    } catch (err) {
                                        console.error('[AGENT] Failed to restart:', err);
                                    }
                                }
                            }, 500);
                        }
                    }
                }
            }, 100);
        }
    };
    
    return true;
}

// Toggle agent speaking
function toggleAgentSpeaking() {
    if (!agentRecognition && !initializeAgentRecognition()) {
        return;
    }
    
    if (!isAgentSpeaking) {
        startAgentSpeaking();
    } else {
        stopAgentSpeaking();
    }
}

function startAgentSpeaking() {
    try {
        console.log('[AGENT] Starting agent speaking mode');
        console.log('[AGENT] Current session ID:', currentSessionId);
        
        if (!isAgentRecognitionActive) {
            console.log('[AGENT] Starting speech recognition...');
            agentRecognition.start();
            isAgentRecognitionActive = true;
            console.log('[AGENT] Speech recognition started successfully');
            console.log('[AGENT] Recognition is now listening for agent speech...');
        } else {
            console.log('[AGENT] Recognition already active');
        }
        isAgentSpeaking = true;
        
        // Update UI
        const btn = document.getElementById('agent-speak-btn');
        if (btn) {
            btn.classList.remove('bg-blue-500', 'hover:bg-blue-600');
            btn.classList.add('bg-red-500', 'hover:bg-red-600');
            btn.innerHTML = '<i class="fas fa-stop"></i> Stop Speaking';
        }
        
        showToast('Agent microphone active', 'info');
    } catch (e) {
        console.error('Error starting agent speaking:', e);
        showToast('Failed to start microphone', 'error');
    }
}

function stopAgentSpeaking() {
    try {
        console.log('[AGENT] Stopping agent speaking mode');
        
        // Set flag first to prevent auto-restart
        isAgentSpeaking = false;
        
        if (isAgentRecognitionActive) {
            console.log('[AGENT] Stopping speech recognition...');
            agentRecognition.stop();
            isAgentRecognitionActive = false;
            console.log('[AGENT] Speech recognition stopped');
        }
        
        // Update UI
        const btn = document.getElementById('agent-speak-btn');
        if (btn) {
            btn.classList.remove('bg-red-500', 'hover:bg-red-600');
            btn.classList.add('bg-blue-500', 'hover:bg-blue-600');
            btn.innerHTML = '<i class="fas fa-microphone"></i> Speak';
        }
        
        console.log('[AGENT] Agent speaking stopped successfully');
    } catch (e) {
        console.error('[AGENT] Error stopping agent speaking:', e);
    }
}

// Add message to transcript
function addTranscriptMessage(role, text, emotionScore = null) {
    console.log('[AGENT] addTranscriptMessage called - Role:', role, 'Text:', text, 'Emotion:', emotionScore);
    
    const transcriptMessages = document.getElementById('transcript-messages');
    if (!transcriptMessages) {
        console.error('[AGENT] ERROR: transcript-messages element not found!');
        return;
    }
    
    console.log('[AGENT] Found transcript container, creating message...');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'transcript-line flex items-start gap-3 py-2';
    
    const isCustomer = role === 'customer';
    const avatar = isCustomer 
        ? '<div class="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">C</div>'
        : '<div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">A</div>';
    
    const label = isCustomer ? 'Customer' : 'Agent';
    const textColor = isCustomer ? 'text-yellow-300' : 'text-blue-300';
    
    // Emotion score badge for customer messages (tiny, top-right)
    const emotionBadge = (isCustomer && emotionScore !== null) 
        ? `<span class="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold tabular-nums">${emotionScore.toFixed(1)}</span>`
        : '';
    
    messageDiv.innerHTML = `
        ${avatar}
        <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2 mb-1">
                <div class="text-xs ${textColor} font-semibold">${label}</div>
                ${emotionBadge}
            </div>
            <div class="text-sm text-gray-300 leading-relaxed">${text}</div>
        </div>
    `;
    
    transcriptMessages.appendChild(messageDiv);
    console.log('[AGENT] Message appended to transcript, total messages:', transcriptMessages.children.length);
    
    // Auto-scroll to bottom
    const container = document.getElementById('transcript-container');
    if (container) {
        container.scrollTop = container.scrollHeight;
        console.log('[AGENT] Scrolled transcript to bottom');
    } else {
        console.warn('[AGENT] transcript-container not found for scrolling');
    }
}

// Update mode indicator
function updateModeIndicator(mode) {
    const indicator = document.getElementById('mode-indicator');
    if (!indicator) return;
    
    if (mode === 'active') {
        indicator.innerHTML = `
            <div class="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <span class="text-xs font-semibold text-green-400 uppercase tracking-wide">Active</span>
        `;
        indicator.className = 'flex items-center gap-2 px-2 py-1 bg-green-500/10 border border-green-500/30 rounded-full live-pulse';
    } else {
        indicator.innerHTML = `
            <div class="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
            <span class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Stopped</span>
        `;
        indicator.className = 'flex items-center gap-2 px-2 py-1 bg-gray-500/10 border border-gray-500/30 rounded-full';
    }
}

// Process AI analysis results and update UI
function processAIAnalysis(analysis) {
    if (!analysis) return;
    
    // Update metrics
    if (analysis.sentiment !== undefined) {
        updateSentimentUI(analysis.sentiment);
    }
    if (analysis.empathy !== undefined) {
        updateEmpathyScore(analysis.empathy);
    }
    if (analysis.quality !== undefined) {
        updateQualityScore(analysis.quality);
    }
    if (analysis.stress) {
        updateStressLevel(analysis.stress);
    }
    if (analysis.clarity) {
        updateClarity(analysis.clarity);
    }
    if (analysis.predictedCSAT !== undefined) {
        updatePredictedCSAT(analysis.predictedCSAT);
    }
    
    // Update customer info - lock name once detected
    if (analysis.customerName && !customerNameFixed && analysis.customerName !== 'Unknown') {
        console.log('[AGENT] Customer name detected:', analysis.customerName);
        updateCustomerInfo(analysis);
        customerNameFixed = true;
    }
    
    // Update issue - allow it to update as conversation evolves (don't lock it)
    if (analysis.issue) {
        updateCustomerIssue(analysis.issue);
    }
    
    // Generate coaching
    if (analysis.coaching && analysis.coaching.length > 0) {
        updateCoaching(analysis.coaching);
    }
}

// Get AI analysis via Cloudflare AI (cloud-based)
async function getAIAnalysis(text, voiceMetrics = null) {
    try {
        const requestBody = {
            text: text,
            conversationHistory: conversationHistory
        };
        
        // Include voice metrics if available
        if (voiceMetrics) {
            requestBody.voiceMetrics = voiceMetrics;
        }
        
        const response = await fetch('/api/ai-analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) throw new Error('AI analysis request failed');
        
        const data = await response.json();
        
        if (data.success && data.analysis) {
            const parsed = data.analysis;
            
            // Log AI source for debugging
            console.log(`[AI] Analysis from: ${data.aiSource || 'unknown'}`);
            if (data.aiSource === 'ollama') {
                console.log('[AI] ✓ Ollama is working!');
            } else if (data.aiSource === 'cloudflare') {
                console.log('[AI] Using Cloudflare AI (Ollama not available)');
            } else {
                console.log('[AI] Using fallback rules (AI unavailable)');
            }
            
            // Post-process: don't lock name/issue on first message if not confident
            if (conversationHistory.length <= 2) {
                // Don't lock in name unless explicitly mentioned
                if (!text.toLowerCase().includes('name') && 
                    !text.toLowerCase().includes('i\'m') && 
                    !text.toLowerCase().includes('this is')) {
                    parsed.customerName = null;
                }
            }
            
            return parsed;
        }
        
        return null;
    } catch (error) {
        console.error('AI analysis error:', error);
        return null;
    }
}

// UI update functions (simplified versions from live-demo.js)
function updateSentimentUI(sentiment) {
    const label = document.getElementById('sentiment-label');
    if (!label) return;
    
    if (sentiment < 0.3) {
        label.textContent = 'Upset';
        label.className = 'font-semibold text-red-400';
    } else if (sentiment < 0.5) {
        label.textContent = 'Frustrated';
        label.className = 'font-semibold text-orange-400';
    } else if (sentiment < 0.7) {
        label.textContent = 'Neutral';
        label.className = 'font-semibold text-yellow-400';
    } else {
        label.textContent = 'Happy';
        label.className = 'font-semibold text-green-400';
    }
}

function updateEmpathyScore(score) {
    const elem = document.getElementById('empathy-score');
    if (elem) elem.textContent = score.toFixed(1);
}

function updateQualityScore(score) {
    const elem = document.getElementById('quality-score');
    if (elem) elem.textContent = score.toFixed(1);
}

function updateStressLevel(stress) {
    const label = document.getElementById('stress-label');
    if (!label) return;
    
    label.textContent = stress;
    if (stress === 'High') {
        label.className = 'font-semibold text-red-400';
    } else if (stress === 'Medium') {
        label.className = 'font-semibold text-orange-400';
    } else {
        label.className = 'font-semibold text-green-400';
    }
}

function updateClarity(clarity) {
    const label = document.getElementById('clarity-label');
    if (label) label.textContent = clarity;
}

function updatePredictedCSAT(csat) {
    const elem = document.getElementById('predicted-csat');
    if (elem) elem.textContent = csat.toFixed(1);
}

function updateCustomerInfo(analysis) {
    if (analysis.customerName) {
        const nameElem = document.getElementById('customer-name');
        const initialsElem = document.getElementById('customer-initials');
        
        if (nameElem) nameElem.textContent = analysis.customerName;
        if (initialsElem) {
            const initials = analysis.customerName.split(' ').map(n => n[0]).join('');
            initialsElem.textContent = initials;
        }
    }
}

function updateCustomerIssue(issue) {
    const elem = document.getElementById('customer-issue');
    if (elem) elem.textContent = issue;
}

function updateCoaching(coachingItems) {
    const container = document.getElementById('coaching-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    for (const item of coachingItems) {
        // Handle verification action
        if (item.action === 'verify-customer') {
            updateVerificationStatus(true);
        }
        
        const card = document.createElement('div');
        card.className = 'coaching-card glass-panel p-4 border border-slate-700/30 mb-3';
        
        // Color coding based on type
        let borderColor = 'border-blue-500/30';
        let bgColor = 'bg-blue-500/5';
        if (item.type === 'action') {
            borderColor = 'border-green-500/30';
            bgColor = 'bg-green-500/5';
        } else if (item.type === 'empathy') {
            borderColor = 'border-blue-500/30';
            bgColor = 'bg-blue-500/5';
        } else if (item.type === 'knowledge') {
            borderColor = 'border-yellow-500/30';
            bgColor = 'bg-yellow-500/5';
        } else if (item.type === 'verification') {
            borderColor = 'border-green-500/30';
            bgColor = 'bg-green-500/5';
        } else if (item.type === 'critical') {
            borderColor = 'border-red-500/30';
            bgColor = 'bg-red-500/5';
        }
        
        card.className += ` ${borderColor} ${bgColor}`;
        
        card.innerHTML = `
            <div class="text-sm font-bold text-gray-100 mb-2">${item.title}</div>
            <div class="text-xs text-gray-300 leading-relaxed whitespace-pre-line">${item.message}</div>
        `;
        
        container.appendChild(card);
    }
}

// Update verification status
async function updateVerificationStatus(isVerified) {
    if (!currentSessionId) return;
    
    try {
        await fetch('/api/session/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: currentSessionId, isVerified })
        });
        
        // Update UI
        const statusElem = document.getElementById('customer-verification-status');
        if (statusElem) {
            if (isVerified) {
                statusElem.innerHTML = '<span class="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">Verified</span>';
            } else {
                statusElem.innerHTML = '<span class="text-xs px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">Unverified</span>';
            }
        }
        
        console.log(`[AGENT] Customer verification status: ${isVerified ? 'Verified' : 'Unverified'}`);
    } catch (error) {
        console.error('Error updating verification status:', error);
    }
}

// Update call status (Active/On Hold/Ended)
async function updateCallStatus(status) {
    if (!currentSessionId) return;
    
    try {
        await fetch('/api/session/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: currentSessionId, status })
        });
        
        // Update UI
        const statusElem = document.getElementById('call-status');
        if (statusElem) {
            const statusColors = {
                'active': { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
                'on-hold': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
                'ended': { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' }
            };
            const colors = statusColors[status] || statusColors['active'];
            statusElem.innerHTML = `<span class="text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} border ${colors.border}">${status.replace('-', ' ').toUpperCase()}</span>`;
        }
        
        console.log(`[AGENT] Call status: ${status}`);
    } catch (error) {
        console.error('Error updating call status:', error);
    }
}

function showToast(message, type = 'info') {
    // Simple toast implementation
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white text-sm z-50 ${
        type === 'success' ? 'bg-green-500' :
        type === 'error' ? 'bg-red-500' :
        'bg-blue-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Settings functions
function openSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.remove('hidden');
        // Auto-test Ollama connection when settings open
        testOllamaConnection();
    }
}

function closeSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal) modal.classList.add('hidden');
}

function saveSettings() {
    showToast('Settings saved!', 'success');
    closeSettings();
}

// Test Ollama Connection (Direct from Browser - bypasses CORS with mode: 'no-cors')
async function testOllamaConnection() {
    const statusIcon = document.getElementById('ollama-status-icon');
    const statusText = document.getElementById('ollama-status-text');
    const latencyDisplay = document.getElementById('ollama-latency');
    const testBtn = document.getElementById('test-ollama-btn');
    
    if (!statusIcon || !statusText || !latencyDisplay || !testBtn) return;
    
    // Show testing state
    statusIcon.innerHTML = '<i class="fas fa-circle-notch fa-spin text-yellow-400"></i>';
    statusText.textContent = 'Testing...';
    statusText.className = 'text-xs font-semibold text-yellow-300';
    testBtn.disabled = true;
    
    const startTime = Date.now();
    
    try {
        // FIRST: Try direct connection from browser to localhost:11434
        // This tests YOUR local machine, not the sandbox server
        try {
            const response = await fetch('http://localhost:11434/api/tags', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const latency = Date.now() - startTime;
            
            if (response.ok) {
                const data = await response.json();
                
                // Success state
                statusIcon.innerHTML = '<i class="fas fa-check-circle text-green-400"></i>';
                statusText.textContent = 'Connected ✓';
                statusText.className = 'text-xs font-semibold text-green-300';
                latencyDisplay.textContent = `${latency}ms`;
                
                // Update model info if available
                if (data.models && data.models.length > 0) {
                    const ollamaModel = document.getElementById('ollama-model');
                    const modelName = data.models.find(m => m.name && m.name.includes('qwen2.5:3b'))?.name 
                                  || data.models[0]?.name 
                                  || 'qwen2.5:3b';
                    if (ollamaModel) {
                        ollamaModel.textContent = modelName;
                    }
                    console.log('[OLLAMA TEST] ✓ Direct Success - Models:', data.models.map(m => m.name).join(', '));
                } else {
                    console.log('[OLLAMA TEST] ✓ Connected but no models installed');
                }
                return; // Success - exit function
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (directError) {
            // Direct connection failed - this might be CORS blocking or Ollama not running
            console.log('[OLLAMA TEST] Direct connection blocked or failed:', directError.message);
            
            // FALLBACK: Try via backend proxy (for production deployment)
            try {
                const response = await fetch('/api/ollama/tags');
                const latency = Date.now() - startTime;
                
                if (response.ok) {
                    const data = await response.json();
                    
                    // Check if there's an error in the response
                    if (data.error) {
                        throw new Error(data.error);
                    }
                    
                    // Success state via proxy
                    statusIcon.innerHTML = '<i class="fas fa-check-circle text-green-400"></i>';
                    statusText.textContent = 'Connected ✓ (proxy)';
                    statusText.className = 'text-xs font-semibold text-green-300';
                    latencyDisplay.textContent = `${latency}ms`;
                    
                    if (data.models && data.models.length > 0) {
                        const ollamaModel = document.getElementById('ollama-model');
                        const modelName = data.models.find(m => m.name && m.name.includes('qwen2.5:3b'))?.name 
                                      || data.models[0]?.name 
                                      || 'qwen2.5:3b';
                        if (ollamaModel) {
                            ollamaModel.textContent = modelName;
                        }
                        console.log('[OLLAMA TEST] ✓ Proxy Success - Models:', data.models.length);
                    }
                    return; // Success via proxy
                } else {
                    throw new Error(`Proxy HTTP ${response.status}`);
                }
            } catch (proxyError) {
                // Both direct and proxy failed
                throw new Error('Not Running - Start with: ollama serve');
            }
        }
    } catch (error) {
        // Failure state
        statusIcon.innerHTML = '<i class="fas fa-times-circle text-red-400"></i>';
        
        // Provide user-friendly error messages
        let errorMsg = 'Not Running';
        if (error.message.includes('Failed to fetch')) {
            errorMsg = 'Not Running';
        } else if (error.message.includes('NetworkError')) {
            errorMsg = 'Not Running';
        } else if (error.message.includes('ECONNREFUSED')) {
            errorMsg = 'Not Started';
        } else if (error.message.includes('HTTP')) {
            errorMsg = error.message;
        } else {
            errorMsg = 'Not Running';
        }
        
        statusText.textContent = `✗ ${errorMsg}`;
        statusText.className = 'text-xs font-semibold text-red-300';
        latencyDisplay.textContent = '--';
        
        console.error('[OLLAMA TEST] ✗ Failed:', error.message);
    } finally {
        testBtn.disabled = false;
    }
}

async function testAIConnection() {
    const btn = document.getElementById('test-connection-btn');
    const status = document.getElementById('connection-status');
    
    if (!btn || !status) return;
    
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';
    
    try {
        const response = await fetch('/api/ai-analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: 'Test connection',
                conversationHistory: []
            })
        });
        
        if (response.ok) {
            ollamaConnected = true;
            status.className = 'p-3 rounded-lg text-xs bg-green-500/20 border border-green-500/30 text-green-300';
            status.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Cloud AI connected successfully!';
            status.classList.remove('hidden');
        } else {
            throw new Error('Connection failed');
        }
    } catch (error) {
        status.className = 'p-3 rounded-lg text-xs bg-red-500/20 border border-red-500/30 text-red-300';
        status.innerHTML = '<i class="fas fa-times-circle mr-2"></i>Cloud AI connection failed. Please try again.';
        status.classList.remove('hidden');
    }
    
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-plug"></i> Test Connection';
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const icon = document.getElementById('theme-icon');
    if (icon) {
        icon.className = document.body.classList.contains('light-mode') 
            ? 'fas fa-sun text-sm text-gray-400'
            : 'fas fa-moon text-sm text-gray-400';
    }
}

// View Company Knowledge Base
async function viewCompanyKnowledge() {
    try {
        const response = await fetch('/api/company-knowledge');
        const data = await response.json();
        
        if (data.success && data.knowledge) {
            const knowledge = data.knowledge;
            
            // Create modal to display knowledge
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4';
            modal.onclick = (e) => {
                if (e.target === modal) modal.remove();
            };
            
            const docsHtml = Object.entries(knowledge.documents)
                .map(([key, doc]) => `
                    <div class="bg-slate-800/40 border border-slate-700/30 rounded-lg p-3 mb-3">
                        <div class="flex items-start justify-between mb-2">
                            <h4 class="font-semibold text-sm text-blue-300">${doc.title}</h4>
                            <span class="text-xs text-gray-500 px-2 py-0.5 bg-slate-700/50 rounded">${doc.category}</span>
                        </div>
                        <pre class="text-xs text-gray-400 whitespace-pre-wrap bg-slate-900/30 p-2 rounded overflow-auto max-h-32">${doc.content}</pre>
                    </div>
                `).join('');
            
            const quickRefsHtml = Object.entries(knowledge.quick_references)
                .map(([key, value]) => `
                    <div class="flex justify-between text-xs py-1 border-b border-slate-700/30">
                        <span class="text-gray-400">${key.replace(/_/g, ' ')}:</span>
                        <span class="text-gray-300 font-medium">${value}</span>
                    </div>
                `).join('');
            
            modal.innerHTML = `
                <div class="glass-panel max-w-4xl w-full max-h-[90vh] overflow-auto">
                    <div class="sticky top-0 bg-slate-900/95 backdrop-blur-sm p-4 border-b border-slate-700/30 flex items-center justify-between">
                        <h3 class="text-lg font-bold text-blue-400 flex items-center gap-2">
                            <i class="fas fa-book"></i>
                            Company Knowledge Base
                        </h3>
                        <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="p-4 space-y-4">
                        <!-- Documents -->
                        <div>
                            <h4 class="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                                <i class="fas fa-file-alt text-blue-400"></i>
                                Policy Documents (${Object.keys(knowledge.documents).length})
                            </h4>
                            ${docsHtml}
                        </div>
                        
                        <!-- Quick References -->
                        <div>
                            <h4 class="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                                <i class="fas fa-bolt text-blue-400"></i>
                                Quick References
                            </h4>
                            <div class="bg-slate-800/40 border border-slate-700/30 rounded-lg p-3">
                                ${quickRefsHtml}
                            </div>
                        </div>
                        
                        <!-- Recommended Phrases -->
                        <div>
                            <h4 class="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                                <i class="fas fa-check text-blue-400"></i>
                                Recommended Phrases
                            </h4>
                            <div class="bg-slate-800/40 border border-slate-700/30 rounded-lg p-3">
                                <div class="flex flex-wrap gap-2">
                                    ${knowledge.recommended_phrases.map(phrase => 
                                        `<span class="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full">${phrase}</span>`
                                    ).join('')}
                                </div>
                            </div>
                        </div>
                        
                        <!-- Forbidden Phrases -->
                        <div>
                            <h4 class="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                                <i class="fas fa-ban text-blue-400"></i>
                                Avoid These Phrases
                            </h4>
                            <div class="bg-slate-800/40 border border-slate-700/30 rounded-lg p-3">
                                <div class="flex flex-wrap gap-2">
                                    ${knowledge.forbidden_phrases.map(phrase => 
                                        `<span class="text-xs px-2 py-1 bg-slate-700/50 text-gray-400 rounded-full line-through">${phrase}</span>`
                                    ).join('')}
                                </div>
                            </div>
                        </div>
                        
                        <!-- Update Instructions -->
                        <div class="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                            <div class="flex items-start gap-2 mb-2">
                                <i class="fas fa-info-circle text-blue-400 text-sm mt-0.5"></i>
                                <div class="flex-1">
                                    <h5 class="text-xs font-semibold text-blue-300 mb-1">How to Update</h5>
                                    <p class="text-xs text-blue-200/80">
                                        Edit <span class="bg-slate-700/50 px-1.5 py-0.5 rounded text-blue-300">config/company-knowledge.json</span> and rebuild the project.
                                    </p>
                                    <p class="text-xs text-blue-200/60 mt-1">
                                        Last updated: ${new Date(knowledge.lastUpdated).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Update docs count in settings
            document.getElementById('docs-count').textContent = Object.keys(knowledge.documents).length;
            document.getElementById('docs-updated').textContent = new Date(knowledge.lastUpdated).toLocaleDateString();
            
        } else {
            showToast('Failed to load company knowledge', 'error');
        }
    } catch (error) {
        console.error('Error loading company knowledge:', error);
        showToast('Error loading knowledge base', 'error');
    }
}

// Manage Documentation - Add/Edit/Delete
async function manageDocumentation() {
    try {
        const response = await fetch('/api/company-knowledge');
        const data = await response.json();
        
        if (!data.success || !data.knowledge) {
            showToast('Failed to load documentation', 'error');
            return;
        }
        
        const knowledge = data.knowledge;
        
        // Create management modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4';
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
        
        const renderDocsList = () => {
            return Object.entries(knowledge.documents)
                .map(([key, doc]) => `
                    <div class="bg-slate-800/40 border border-slate-700/30 rounded-lg p-3 mb-2 hover:bg-slate-800/60 transition">
                        <div class="flex items-start justify-between">
                            <div class="flex-1">
                                <h4 class="font-semibold text-sm text-blue-300">${doc.title}</h4>
                                <span class="text-xs text-gray-500 px-2 py-0.5 bg-slate-700/50 rounded inline-block mt-1">${doc.category}</span>
                                <pre class="text-xs text-gray-400 whitespace-pre-wrap mt-2 max-h-20 overflow-auto">${doc.content.substring(0, 150)}${doc.content.length > 150 ? '...' : ''}</pre>
                            </div>
                            <div class="flex gap-1 ml-2">
                                <button 
                                    onclick="editDocument('${key}')" 
                                    class="px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded text-xs"
                                    title="Edit"
                                >
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button 
                                    onclick="deleteDocument('${key}')" 
                                    class="px-2 py-1 bg-slate-700/40 hover:bg-slate-600/40 border border-slate-600/30 text-gray-400 rounded text-xs"
                                    title="Delete"
                                >
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('');
        };
        
        modal.innerHTML = `
            <div class="glass-panel max-w-5xl w-full max-h-[90vh] overflow-auto">
                <div class="sticky top-0 bg-slate-900/95 backdrop-blur-sm p-4 border-b border-slate-700/30 flex items-center justify-between z-10">
                    <h3 class="text-lg font-bold text-blue-400 flex items-center gap-2">
                        <i class="fas fa-edit"></i>
                        Manage Documentation
                    </h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <div class="p-4">
                    <!-- Add New Document Button -->
                    <button 
                        onclick="addNewDocument()" 
                        class="w-full mb-4 px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 border-2 border-blue-500/30 border-dashed text-blue-300 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
                    >
                        <i class="fas fa-plus-circle"></i>
                        <span>Add New Document</span>
                    </button>
                    
                    <!-- Documents List -->
                    <div id="docs-list-container">
                        ${renderDocsList()}
                    </div>
                    
                    <!-- Info -->
                    <div class="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                        <div class="flex items-start gap-2">
                            <i class="fas fa-robot text-blue-400 text-sm mt-0.5"></i>
                            <div class="text-xs text-blue-300">
                                <strong>AI Integration:</strong> All documents added here are automatically referenced by the AI during coaching analysis.
                                The AI will suggest responses based on your company policies and procedures.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Store knowledge data globally for edit/delete functions
        window.currentKnowledge = knowledge;
        
    } catch (error) {
        console.error('Error managing documentation:', error);
        showToast('Error loading documentation manager', 'error');
    }
}

// Add New Document
function addNewDocument() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/90 flex items-center justify-center z-[70] p-4';
    
    modal.innerHTML = `
        <div class="glass-panel max-w-2xl w-full">
            <div class="p-4 border-b border-slate-700/30">
                <h3 class="text-lg font-bold text-blue-400 flex items-center gap-2">
                    <i class="fas fa-plus-circle"></i>
                    Add New Document
                </h3>
            </div>
            
            <div class="p-4 space-y-3">
                <div>
                    <label class="block text-xs font-semibold text-gray-300 mb-1">Document Title</label>
                    <input 
                        type="text" 
                        id="new-doc-title" 
                        placeholder="e.g., Refund Policy" 
                        class="w-full px-3 py-2 bg-slate-900/60 border border-slate-600/50 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                    />
                </div>
                
                <div>
                    <label class="block text-xs font-semibold text-gray-300 mb-1">Category</label>
                    <select 
                        id="new-doc-category" 
                        class="w-full px-3 py-2 bg-slate-900/60 border border-slate-600/50 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                    >
                        <option value="policy">Policy</option>
                        <option value="procedures">Procedures</option>
                        <option value="technical">Technical</option>
                        <option value="scripts">Scripts</option>
                        <option value="billing">Billing</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-xs font-semibold text-gray-300 mb-1">Content</label>
                    <textarea 
                        id="new-doc-content" 
                        rows="10" 
                        placeholder="Enter document content here..." 
                        class="w-full px-3 py-2 bg-slate-900/60 border border-slate-600/50 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                    ></textarea>
                </div>
            </div>
            
            <div class="p-4 border-t border-slate-700/30 flex justify-end gap-2">
                <button 
                    onclick="this.closest('.fixed').remove()" 
                    class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-semibold transition"
                >
                    Cancel
                </button>
                <button 
                    onclick="saveNewDocument()" 
                    class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition"
                >
                    <i class="fas fa-save mr-1"></i>
                    Save Document
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Save New Document
async function saveNewDocument() {
    const title = document.getElementById('new-doc-title').value.trim();
    const category = document.getElementById('new-doc-category').value;
    const content = document.getElementById('new-doc-content').value.trim();
    
    if (!title || !content) {
        showToast('Title and content are required', 'error');
        return;
    }
    
    const docKey = title.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    
    try {
        const response = await fetch('/api/company-knowledge/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                key: docKey,
                document: { title, category, content }
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Document added successfully!', 'success');
            
            // Close add modal
            document.querySelectorAll('.fixed.z-\\[70\\]').forEach(m => m.remove());
            
            // Refresh management modal
            document.querySelectorAll('.fixed.z-\\[60\\]').forEach(m => m.remove());
            manageDocumentation();
        } else {
            showToast(data.error || 'Failed to add document', 'error');
        }
    } catch (error) {
        console.error('Error saving document:', error);
        showToast('Error saving document', 'error');
    }
}

// Edit Document
function editDocument(key) {
    const doc = window.currentKnowledge.documents[key];
    if (!doc) return;
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/90 flex items-center justify-center z-[70] p-4';
    
    modal.innerHTML = `
        <div class="glass-panel max-w-2xl w-full">
            <div class="p-4 border-b border-slate-700/30">
                <h3 class="text-lg font-bold text-blue-400 flex items-center gap-2">
                    <i class="fas fa-edit"></i>
                    Edit Document
                </h3>
            </div>
            
            <div class="p-4 space-y-3">
                <div>
                    <label class="block text-xs font-semibold text-gray-300 mb-1">Document Title</label>
                    <input 
                        type="text" 
                        id="edit-doc-title" 
                        value="${doc.title}" 
                        class="w-full px-3 py-2 bg-slate-900/60 border border-slate-600/50 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                    />
                </div>
                
                <div>
                    <label class="block text-xs font-semibold text-gray-300 mb-1">Category</label>
                    <select 
                        id="edit-doc-category" 
                        class="w-full px-3 py-2 bg-slate-900/60 border border-slate-600/50 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                    >
                        <option value="policy" ${doc.category === 'policy' ? 'selected' : ''}>Policy</option>
                        <option value="procedures" ${doc.category === 'procedures' ? 'selected' : ''}>Procedures</option>
                        <option value="technical" ${doc.category === 'technical' ? 'selected' : ''}>Technical</option>
                        <option value="scripts" ${doc.category === 'scripts' ? 'selected' : ''}>Scripts</option>
                        <option value="billing" ${doc.category === 'billing' ? 'selected' : ''}>Billing</option>
                        <option value="other" ${doc.category === 'other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-xs font-semibold text-gray-300 mb-1">Content</label>
                    <textarea 
                        id="edit-doc-content" 
                        rows="10" 
                        class="w-full px-3 py-2 bg-slate-900/60 border border-slate-600/50 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                    >${doc.content}</textarea>
                </div>
            </div>
            
            <div class="p-4 border-t border-slate-700/30 flex justify-end gap-2">
                <button 
                    onclick="this.closest('.fixed').remove()" 
                    class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-semibold transition"
                >
                    Cancel
                </button>
                <button 
                    onclick="updateDocument('${key}')" 
                    class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition"
                >
                    <i class="fas fa-save mr-1"></i>
                    Update Document
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Update Document
async function updateDocument(key) {
    const title = document.getElementById('edit-doc-title').value.trim();
    const category = document.getElementById('edit-doc-category').value;
    const content = document.getElementById('edit-doc-content').value.trim();
    
    if (!title || !content) {
        showToast('Title and content are required', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/company-knowledge/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                key,
                document: { title, category, content }
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Document updated successfully!', 'success');
            
            // Close edit modal
            document.querySelectorAll('.fixed.z-\\[70\\]').forEach(m => m.remove());
            
            // Refresh management modal
            document.querySelectorAll('.fixed.z-\\[60\\]').forEach(m => m.remove());
            manageDocumentation();
        } else {
            showToast(data.error || 'Failed to update document', 'error');
        }
    } catch (error) {
        console.error('Error updating document:', error);
        showToast('Error updating document', 'error');
    }
}

// Delete Document
async function deleteDocument(key) {
    if (!confirm('Are you sure you want to delete this document? This cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch('/api/company-knowledge/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Document deleted successfully!', 'success');
            
            // Refresh management modal
            document.querySelectorAll('.fixed.z-\\[60\\]').forEach(m => m.remove());
            manageDocumentation();
        } else {
            showToast(data.error || 'Failed to delete document', 'error');
        }
    } catch (error) {
        console.error('Error deleting document:', error);
        showToast('Error deleting document', 'error');
    }
}

// Load docs count on page load
async function loadCompanyKnowledgeInfo() {
    try {
        const response = await fetch('/api/company-knowledge');
        const data = await response.json();
        
        if (data.success && data.knowledge) {
            document.getElementById('docs-count').textContent = Object.keys(data.knowledge.documents).length;
            document.getElementById('docs-updated').textContent = new Date(data.knowledge.lastUpdated).toLocaleDateString();
        }
    } catch (error) {
        console.log('Could not load company knowledge info');
    }
}

function openDocumentsFolder() {
    const folderPath = 'C:\\Users\\Nimbus VFX\\Desktop\\Company Docs';
    
    try {
        window.open(`file:///${folderPath}`, '_blank');
        showToast('Opening documents folder...', 'info');
    } catch (e) {
        showToast('Documents folder: ' + folderPath, 'info');
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(folderPath).then(() => {
                console.log('Folder path copied to clipboard');
            }).catch(() => {
                console.log('Could not copy to clipboard');
            });
        }
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    // AI is always connected (cloud-based)
    ollamaConnected = true;
    
    // Load company knowledge info
    loadCompanyKnowledgeInfo();
    
    // Show welcome message
    console.log('Agent Dashboard Ready (Cloud AI Enabled)');
    console.log('Click "Start New Session" to begin');
});
