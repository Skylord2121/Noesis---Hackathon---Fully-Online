// Agent Dashboard with Real-Time Customer Transcript
// Human Agent responds, AI provides coaching and tracking

// Session management
let currentSessionId = null;
let customerLink = null;
let pollInterval = null;
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
    
    // Show session info modal
    showSessionModal();
    
    // Start polling for customer messages
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
        clearInterval(pollInterval);
    }
    
    pollInterval = setInterval(async () => {
        await fetchNewMessages();
    }, 1000); // Poll every second
}

function stopPolling() {
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
}

// Fetch new messages from server
async function fetchNewMessages() {
    if (!currentSessionId) return;
    
    try {
        const response = await fetch(`/api/session/messages?sessionId=${currentSessionId}&since=${lastMessageTimestamp}`);
        if (!response.ok) return;
        
        const data = await response.json();
        
        if (data.messages && data.messages.length > 0) {
            for (const message of data.messages) {
                if (message.role === 'customer') {
                    // Customer message received with voice metrics
                    await handleCustomerMessage(message.content, message.voiceMetrics);
                    lastMessageTimestamp = message.timestamp;
                    
                    if (!customerHasSpoken) {
                        customerHasSpoken = true;
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error fetching messages:', error);
    }
}

// Handle incoming customer message with voice metrics
async function handleCustomerMessage(text, voiceMetrics = null) {
    // Add to transcript
    addTranscriptMessage('customer', text);
    
    // Add to conversation history with voice data
    conversationHistory.push({
        role: 'customer',
        content: text,
        timestamp: Date.now(),
        voiceMetrics: voiceMetrics
    });
    
    // Animate spectrum bars when customer speaks
    animateCustomerSpectrum();
    
    // Process with AI for coaching and metrics (async)
    processWithAI(text, voiceMetrics);
}

// Animate customer voice spectrum
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
    if (!currentSessionId) return;
    
    try {
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
            throw new Error('Failed to send message');
        }
        
        // Add to local transcript
        addTranscriptMessage('agent', text);
        
        // Add to conversation history
        conversationHistory.push({
            role: 'agent',
            content: text,
            timestamp: Date.now()
        });
        
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
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
                
                // Send agent's message
                sendAgentMessage(transcript);
            } else {
                interimTranscript += transcript;
            }
        }
    };
    
    agentRecognition.onerror = (event) => {
        console.error('Agent speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
            stopAgentSpeaking();
        }
    };
    
    agentRecognition.onend = () => {
        isAgentRecognitionActive = false;
        if (isAgentSpeaking) {
            try {
                agentRecognition.start();
                isAgentRecognitionActive = true;
            } catch (e) {
                console.error('Error restarting agent recognition:', e);
            }
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
        if (!isAgentRecognitionActive) {
            agentRecognition.start();
            isAgentRecognitionActive = true;
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
        if (isAgentRecognitionActive) {
            agentRecognition.stop();
            isAgentRecognitionActive = false;
        }
        isAgentSpeaking = false;
        
        // Update UI
        const btn = document.getElementById('agent-speak-btn');
        if (btn) {
            btn.classList.remove('bg-red-500', 'hover:bg-red-600');
            btn.classList.add('bg-blue-500', 'hover:bg-blue-600');
            btn.innerHTML = '<i class="fas fa-microphone"></i> Speak';
        }
    } catch (e) {
        console.error('Error stopping agent speaking:', e);
    }
}

// Add message to transcript
function addTranscriptMessage(role, text) {
    const transcriptMessages = document.getElementById('transcript-messages');
    if (!transcriptMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'transcript-line flex items-start gap-3 py-2';
    
    const isCustomer = role === 'customer';
    const avatar = isCustomer 
        ? '<div class="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">C</div>'
        : '<div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">A</div>';
    
    const label = isCustomer ? 'Customer' : 'Agent';
    const textColor = isCustomer ? 'text-yellow-300' : 'text-blue-300';
    
    messageDiv.innerHTML = `
        ${avatar}
        <div class="flex-1 min-w-0">
            <div class="text-xs ${textColor} font-semibold mb-1">${label}</div>
            <div class="text-sm text-gray-300 leading-relaxed">${text}</div>
        </div>
    `;
    
    transcriptMessages.appendChild(messageDiv);
    
    // Auto-scroll to bottom
    const container = document.getElementById('transcript-container');
    if (container) {
        container.scrollTop = container.scrollHeight;
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

// Process with AI (coaching and metrics)
async function processWithAI(text, voiceMetrics = null) {
    if (!ollamaConnected) return;
    
    try {
        // Get AI analysis with voice metrics
        const analysis = await getAIAnalysis(text, voiceMetrics);
        
        if (analysis) {
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
            
            // Update customer info - only lock name when explicitly mentioned
            if (analysis.customerName && !customerNameFixed) {
                // Check if customer actually introduced themselves
                const recentMessages = conversationHistory.slice(-3).map(m => m.content.toLowerCase()).join(' ');
                if (recentMessages.includes('name') || recentMessages.includes('i\'m') || recentMessages.includes('this is')) {
                    updateCustomerInfo(analysis);
                    customerNameFixed = true;
                }
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
    } catch (error) {
        console.error('Error processing with AI:', error);
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
        const card = document.createElement('div');
        card.className = 'coaching-card glass-panel p-4 border border-slate-700/30 mb-3';
        
        // Color coding based on type
        let borderColor = 'border-blue-500/30';
        let bgColor = 'bg-blue-500/5';
        if (item.type === 'action') {
            borderColor = 'border-green-500/30';
            bgColor = 'bg-green-500/5';
        } else if (item.type === 'empathy') {
            borderColor = 'border-purple-500/30';
            bgColor = 'bg-purple-500/5';
        } else if (item.type === 'knowledge') {
            borderColor = 'border-yellow-500/30';
            bgColor = 'bg-yellow-500/5';
        }
        
        card.className += ` ${borderColor} ${bgColor}`;
        
        card.innerHTML = `
            <div class="text-sm font-bold text-gray-100 mb-2">${item.title}</div>
            <div class="text-xs text-gray-300 leading-relaxed whitespace-pre-line">${item.message}</div>
        `;
        
        container.appendChild(card);
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
    if (modal) modal.classList.remove('hidden');
}

function closeSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal) modal.classList.add('hidden');
}

function saveSettings() {
    showToast('Settings saved!', 'success');
    closeSettings();
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
                            <h4 class="font-semibold text-sm text-purple-300">${doc.title}</h4>
                            <span class="text-xs text-gray-500 px-2 py-0.5 bg-slate-700/50 rounded">${doc.category}</span>
                        </div>
                        <pre class="text-xs text-gray-400 whitespace-pre-wrap font-mono bg-slate-900/30 p-2 rounded overflow-auto max-h-32">${doc.content}</pre>
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
                        <h3 class="text-lg font-bold text-purple-400 flex items-center gap-2">
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
                                <i class="fas fa-file-alt text-purple-400"></i>
                                Policy Documents (${Object.keys(knowledge.documents).length})
                            </h4>
                            ${docsHtml}
                        </div>
                        
                        <!-- Quick References -->
                        <div>
                            <h4 class="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                                <i class="fas fa-bolt text-yellow-400"></i>
                                Quick References
                            </h4>
                            <div class="bg-slate-800/40 border border-slate-700/30 rounded-lg p-3">
                                ${quickRefsHtml}
                            </div>
                        </div>
                        
                        <!-- Recommended Phrases -->
                        <div>
                            <h4 class="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                                <i class="fas fa-check text-green-400"></i>
                                Recommended Phrases
                            </h4>
                            <div class="bg-slate-800/40 border border-slate-700/30 rounded-lg p-3">
                                <div class="flex flex-wrap gap-2">
                                    ${knowledge.recommended_phrases.map(phrase => 
                                        `<span class="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded-full">${phrase}</span>`
                                    ).join('')}
                                </div>
                            </div>
                        </div>
                        
                        <!-- Forbidden Phrases -->
                        <div>
                            <h4 class="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                                <i class="fas fa-ban text-red-400"></i>
                                Avoid These Phrases
                            </h4>
                            <div class="bg-slate-800/40 border border-slate-700/30 rounded-lg p-3">
                                <div class="flex flex-wrap gap-2">
                                    ${knowledge.forbidden_phrases.map(phrase => 
                                        `<span class="text-xs px-2 py-1 bg-red-500/20 text-red-300 rounded-full line-through">${phrase}</span>`
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
                                        Edit <code class="bg-slate-700/50 px-1 rounded">config/company-knowledge.json</code> and rebuild the project.
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
