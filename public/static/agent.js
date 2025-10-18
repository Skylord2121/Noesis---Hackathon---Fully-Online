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

// Ollama connection
let ollamaConnected = false;

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
                    // Customer message received
                    await handleCustomerMessage(message.content);
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

// Handle incoming customer message
async function handleCustomerMessage(text) {
    // Add to transcript
    addTranscriptMessage('customer', text);
    
    // Add to conversation history
    conversationHistory.push({
        role: 'customer',
        content: text,
        timestamp: Date.now()
    });
    
    // Animate spectrum bars when customer speaks
    animateCustomerSpectrum();
    
    // Process with AI for coaching and metrics (async)
    processWithAI(text);
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
async function processWithAI(text) {
    if (!ollamaConnected) return;
    
    try {
        // Get AI analysis
        const analysis = await getAIAnalysis(text);
        
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

// Get AI analysis via Ollama
async function getAIAnalysis(text) {
    const ollamaHost = localStorage.getItem('ollamaHost') || 'http://localhost:11434';
    const ollamaModel = localStorage.getItem('ollamaModel') || 'qwen2.5:3b';
    
    const conversationContext = conversationHistory
        .slice(-10)
        .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
        .join('\n');
    
    const prompt = `You are an expert customer service analyst providing real-time coaching to a live agent.

CONVERSATION:
${conversationContext}

LATEST CUSTOMER: "${text}"

TASK: Provide SHORT, actionable coaching. Keep suggestions brief and punchy.

CRITICAL RULES:
1. CUSTOMER NAME: Extract if mentioned ("My name is Sarah", "I'm John", "This is Mike")
2. ISSUE: Be specific (Password Reset, Billing Dispute, Refund, Shipping Delay, Account Locked)
3. COACHING: Keep it SHORT unless complex protocol needed
   - DEFAULT: 1-2 sentences max
   - ONLY give detailed steps if technical issue requires it
   - Focus on WHAT to do, not HOW in detail

GOOD SHORT COACHING:
"Acknowledge frustration first. Say: 'I understand how frustrating this is. Let me help you right away.'"
"Ask for order number. Check if refund was already issued."
"Password reset link expires in 24hrs. Check spam folder if not received."

BAD (TOO LONG):
"Guide customer through: 1) Go to amazon.com/ap/forgotpassword, 2) Enter email address that's registered with account, 3) Wait for email, 4) Check spam folder if not in inbox within 5 minutes, 5) Click reset link..."

Respond ONLY with valid JSON:
{
  "sentiment": 0.0-1.0,
  "empathy": 0.0-10.0,
  "quality": 0.0-10.0,
  "stress": "Low"|"Medium"|"High",
  "clarity": "Poor"|"Fair"|"Good"|"Excellent",
  "predictedCSAT": 0.0-10.0,
  "customerName": "FirstName LastName"|null,
  "issue": "Specific Issue",
  "coaching": [
    {
      "type": "action"|"empathy"|"knowledge",
      "title": "Brief title (3-5 words)",
      "message": "Short suggestion (1-2 sentences max, unless technical protocol)"
    }
  ]
}`;
    
    try {
        const response = await fetch(`${ollamaHost}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: ollamaModel,
                prompt: prompt,
                stream: false,
                temperature: 0.2,
                num_predict: 300
            })
        });
        
        if (!response.ok) throw new Error('Ollama request failed');
        
        const data = await response.json();
        
        // Try to extract JSON from response
        let jsonMatch = data.response.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            
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
    } catch (error) {
        console.error('AI analysis error:', error);
    }
    
    return null;
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
    const ollamaHost = document.getElementById('ollama-host').value;
    const ollamaModel = document.getElementById('ollama-model').value;
    
    localStorage.setItem('ollamaHost', ollamaHost);
    localStorage.setItem('ollamaModel', ollamaModel);
    
    showToast('Settings saved!', 'success');
    closeSettings();
}

async function testOllamaConnection() {
    const ollamaHost = document.getElementById('ollama-host').value || 'http://localhost:11434';
    const btn = document.getElementById('test-connection-btn');
    const status = document.getElementById('connection-status');
    
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';
    
    try {
        const response = await fetch(`${ollamaHost}/api/tags`);
        if (response.ok) {
            ollamaConnected = true;
            status.className = 'p-3 rounded-lg text-xs bg-green-500/20 border border-green-500/30 text-green-300';
            status.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Connected successfully!';
            status.classList.remove('hidden');
        } else {
            throw new Error('Connection failed');
        }
    } catch (error) {
        ollamaConnected = false;
        status.className = 'p-3 rounded-lg text-xs bg-red-500/20 border border-red-500/30 text-red-300';
        status.innerHTML = '<i class="fas fa-times-circle mr-2"></i>Connection failed. Is Ollama running?';
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
    // Load settings
    const ollamaHost = localStorage.getItem('ollamaHost') || 'http://localhost:11434';
    const ollamaModel = localStorage.getItem('ollamaModel') || 'qwen2.5:3b';
    
    const ollamaHostInput = document.getElementById('ollama-host');
    const ollamaModelInput = document.getElementById('ollama-model');
    
    if (ollamaHostInput) ollamaHostInput.value = ollamaHost;
    if (ollamaModelInput) ollamaModelInput.value = ollamaModel;
    
    // Test Ollama connection on load
    testOllamaConnection();
    
    // Show welcome message
    console.log('Agent Dashboard Ready');
    console.log('Click "Start New Session" to begin');
});
