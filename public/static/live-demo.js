// Live Real-Time Coaching - Fully Reactive
// Your voice = Customer, AI Agent responds

// State management
let conversationHistory = []; // Track full conversation for AI context
let customerIssueFixed = false; // Once issue is identified, keep it fixed
let statusUpdateCount = 0; // Limit status updates to max 4
let customerHasSpoken = false; // Track if customer has spoken yet

// Live mode state
let recognition = null; // Speech recognition instance
let isListening = false; // Track if actively listening
let ollamaConnected = false; // Track if Ollama is connected and ready
let audioContext = null; // Web Audio API context
let analyser = null; // Audio analyser for spectrum
let microphone = null; // Microphone stream
let dataArray = null; // Frequency data array
let animationFrameId = null; // Animation frame ID

// Call timer
let callStartTime = null;
function updateCallTimer() {
    if (!callStartTime) return;
    const elapsed = Math.floor((Date.now() - callStartTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    callTime.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// DOM elements
const transcriptMessages = document.getElementById('transcript-messages');
const transcriptContainer = document.getElementById('transcript-container');
const coachingContainer = document.getElementById('coaching-container');
const empathyScore = document.getElementById('empathy-score');
const callTime = document.getElementById('call-time');
const sentimentLabel = document.getElementById('sentiment-label');
const stressLabel = document.getElementById('stress-label');
const qualityScore = document.getElementById('quality-score');
const predictedCsat = document.getElementById('predicted-csat');

// Customer info elements
const customerName = document.getElementById('customer-name');
const customerInitials = document.getElementById('customer-initials');
const customerTier = document.getElementById('customer-tier');
const customerStatus = document.getElementById('customer-status');
const customerIssue = document.getElementById('customer-issue');
const customerTags = document.getElementById('customer-tags');
const clarityLabel = document.getElementById('clarity-label');

function updateSentimentUI(sentiment) {
    if (sentiment < 0.3) {
        sentimentLabel.textContent = 'Upset';
        sentimentLabel.className = 'font-semibold text-red-400';
    } else if (sentiment < 0.5) {
        sentimentLabel.textContent = 'Frustrated';
        sentimentLabel.className = 'font-semibold text-orange-400';
    } else if (sentiment < 0.7) {
        sentimentLabel.textContent = 'Neutral';
        sentimentLabel.className = 'font-semibold text-yellow-400';
    } else if (sentiment < 0.85) {
        sentimentLabel.textContent = 'Satisfied';
        sentimentLabel.className = 'font-semibold text-green-400';
    } else {
        sentimentLabel.textContent = 'Happy';
        sentimentLabel.className = 'font-semibold text-emerald-400';
    }
}

function updateEmpathyScore(score) {
    empathyScore.textContent = score.toFixed(1);
    
    empathyScore.style.transition = 'color 0.5s ease';
    if (score < 5) {
        empathyScore.style.color = '#ef4444';
    } else if (score < 7) {
        empathyScore.style.color = '#f59e0b';
    } else if (score < 8.5) {
        empathyScore.style.color = '#3b82f6';
    } else {
        empathyScore.style.color = '#10b981';
    }
}

function updateStressLevel(stress) {
    if (!stress) return;
    stressLabel.textContent = stress;
    if (stress === 'High') {
        stressLabel.className = 'font-semibold text-red-400';
    } else if (stress === 'Medium') {
        stressLabel.className = 'font-semibold text-orange-400';
    } else {
        stressLabel.className = 'font-semibold text-green-400';
    }
}

function updateClarity(clarity) {
    if (!clarity) return;
    clarityLabel.textContent = clarity;
    if (clarity === 'Poor') {
        clarityLabel.className = 'font-semibold text-red-400';
    } else if (clarity === 'Fair') {
        clarityLabel.className = 'font-semibold text-orange-400';
    } else {
        clarityLabel.className = 'font-semibold text-green-400';
    }
}

function updateMetrics(empathy) {
    const quality = Math.min(92, Math.max(65, Math.round(empathy * 9 + 29)));
    qualityScore.textContent = `${quality}%`;
    
    const csat = Math.min(9.5, Math.max(5.0, (empathy * 0.95 + 1.2))).toFixed(1);
    predictedCsat.textContent = csat;
}

function updateCustomerInfo(info) {
    if (info.name) {
        customerName.textContent = info.name;
        customerName.className = 'font-medium text-sm';
    }
    if (info.initials) {
        customerInitials.textContent = info.initials;
    }
    if (info.tier) {
        customerTier.textContent = info.tier;
    }
    if (info.issue) {
        customerIssue.textContent = info.issue;
        customerIssue.className = 'font-semibold text-red-400';
    }
    if (info.tags) {
        info.tags.forEach(tag => {
            const existingTags = Array.from(customerTags.children).map(el => el.textContent);
            if (!existingTags.includes(tag)) {
                const tagEl = document.createElement('span');
                let tagClass = 'px-2 py-0.5 rounded text-xs border ';
                if (tag.includes('Call')) {
                    tagClass += 'bg-red-500/10 text-red-400 border-red-500/30';
                } else if (tag.includes('Work')) {
                    tagClass += 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
                } else if (tag.includes('Premium')) {
                    tagClass += 'bg-purple-500/10 text-purple-400 border-purple-500/30';
                } else {
                    tagClass += 'bg-blue-500/10 text-blue-400 border-blue-500/30';
                }
                tagEl.className = tagClass;
                tagEl.textContent = tag;
                customerTags.appendChild(tagEl);
            }
        });
    }
}

function addTranscriptLine(speakerName, text, speakerType) {
    const isAgent = speakerType === 'agent';
    const avatar = isAgent ? 
        `<i class="fas fa-headset text-white text-xs"></i>` :
        `<span class="text-xs font-semibold">CU</span>`;
    const bgColor = isAgent ? 'from-blue-500 to-cyan-500' : 'from-yellow-500 to-orange-500';
    const textColor = isAgent ? 'text-blue-400' : 'text-yellow-400';
    
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const transcriptLine = document.createElement('div');
    transcriptLine.className = 'transcript-line flex gap-3 group';
    transcriptLine.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-gradient-to-br ${bgColor} flex items-center justify-center flex-shrink-0 ring-2 ring-${isAgent ? 'blue' : 'yellow'}-500/30 text-white">
            ${avatar}
        </div>
        <div class="flex-1 bg-slate-800/20 rounded-lg p-3 border border-${isAgent ? 'blue' : 'yellow'}-500/10">
            <div class="flex items-start justify-between mb-1">
                <span class="text-xs font-medium ${textColor}">${speakerName}${isAgent ? ' (AI Agent)' : ''}</span>
                <span class="text-xs text-gray-500">${timeStr}</span>
            </div>
            <p class="text-sm leading-relaxed">
                ${text}
            </p>
        </div>
    `;
    
    transcriptMessages.appendChild(transcriptLine);
}

function showAgentThinking() {
    const thinkingDiv = document.createElement('div');
    thinkingDiv.id = 'agent-thinking';
    thinkingDiv.className = 'transcript-line flex gap-3';
    thinkingDiv.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 ring-2 ring-blue-500/30">
            <i class="fas fa-headset text-white text-xs"></i>
        </div>
        <div class="flex-1 bg-slate-800/20 rounded-lg p-3 border border-blue-500/10">
            <div class="flex items-center gap-1">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;
    
    transcriptMessages.appendChild(thinkingDiv);
}

function removeAgentThinking() {
    const thinking = document.getElementById('agent-thinking');
    if (thinking) {
        thinking.remove();
    }
}

function addCoachingCard(coaching, isAI = false) {
    let iconClass, iconBg, borderColor, title;
    switch(coaching.type) {
        case 'de-escalation':
            iconClass = 'fa-exclamation';
            iconBg = 'bg-red-500';
            borderColor = 'border-red-500/30';
            title = coaching.title;
            break;
        case 'empathy':
            iconClass = 'fa-heart';
            iconBg = 'bg-green-500';
            borderColor = 'border-green-500/30';
            title = coaching.title;
            break;
        case 'action':
            iconClass = 'fa-check';
            iconBg = 'bg-blue-500';
            borderColor = 'border-blue-500/30';
            title = coaching.title;
            break;
        case 'transparency':
            iconClass = 'fa-eye';
            iconBg = 'bg-purple-500';
            borderColor = 'border-purple-500/30';
            title = coaching.title;
            break;
        case 'resolution':
            iconClass = 'fa-wrench';
            iconBg = 'bg-cyan-500';
            borderColor = 'border-cyan-500/30';
            title = coaching.title;
            break;
        case 'knowledge':
            iconClass = 'fa-book';
            iconBg = 'bg-purple-500';
            borderColor = 'border-purple-500/30';
            title = coaching.title;
            break;
        default:
            iconClass = 'fa-lightbulb';
            iconBg = 'bg-blue-500';
            borderColor = 'border-blue-500/30';
            title = 'Suggestion';
    }
    
    const card = document.createElement('div');
    const aiLabel = isAI ? '<span class="ml-auto text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/30">AI</span>' : '';
    card.className = `coaching-card p-3 rounded-lg bg-gradient-to-br from-${coaching.type === 'de-escalation' ? 'red' : 'blue'}-500/10 to-transparent border ${borderColor}`;
    
    let phraseHTML = '';
    if (coaching.phrase) {
        phraseHTML = `
            <p class="text-xs text-gray-300 mb-3 leading-relaxed italic border-l-2 border-blue-400 pl-2">
                "${coaching.phrase}"
            </p>
            <button onclick="usePhraseClicked()" class="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold">
                Use This Phrase
            </button>
        `;
    }
    
    card.innerHTML = `
        <div class="flex items-start justify-between mb-2">
            <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0">
                    <i class="fas ${iconClass} text-white text-xs"></i>
                </div>
                <span class="text-xs font-semibold text-gray-200">${title}</span>
            </div>
            ${aiLabel}
        </div>
        <p class="text-xs text-gray-400 mb-2 leading-relaxed">
            ${coaching.message}
        </p>
        ${phraseHTML}
    `;
    
    setTimeout(() => {
        coachingContainer.insertBefore(card, coachingContainer.firstChild);
    }, coaching.priority === 1 ? 300 : 0);
}

// AI agent responds to customer
async function getAgentResponse(customerMessage) {
    try {
        const ollamaUrl = localStorage.getItem('ollama-host') || 'http://localhost:11434';
        const model = localStorage.getItem('ollama-model') || 'qwen2.5:3b';
        
        showAgentThinking();
        
        // Build context
        let context = "You are a helpful AI customer service agent. Respond naturally to the customer.\n\n";
        context += "CONVERSATION:\n";
        
        const recentHistory = conversationHistory.slice(-6);
        recentHistory.forEach(msg => {
            context += `${msg.speaker === 'agent' ? 'Agent' : 'Customer'}: ${msg.text}\n`;
        });
        
        context += `\nRespond to the customer in 1-2 sentences. Be helpful and empathetic.`;
        
        const response = await fetch(`${ollamaUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model,
                prompt: context,
                stream: false,
                options: {
                    temperature: 0.8,
                    top_p: 0.9,
                    num_predict: 80
                }
            })
        });
        
        const data = await response.json();
        removeAgentThinking();
        
        const agentText = data.response.trim();
        
        // Add agent response to transcript
        addTranscriptLine('AI Agent', agentText, 'agent');
        
        // Add to history
        conversationHistory.push({
            speaker: 'agent',
            name: 'AI Agent',
            text: agentText
        });
        
    } catch (error) {
        console.error('Agent response failed:', error);
        removeAgentThinking();
    }
}

// Analyze customer message for metrics and coaching
async function analyzeCustomerMessage(customerMessage, customerName, agentName) {
    try {
        const ollamaUrl = localStorage.getItem('ollama-host') || 'http://localhost:11434';
        const model = localStorage.getItem('ollama-model') || 'qwen2.5:3b';
        
        const loadingCard = document.createElement('div');
        loadingCard.id = 'ai-loading';
        loadingCard.className = 'p-3 rounded-lg bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/30';
        loadingCard.innerHTML = `
            <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-brain text-white text-xs animate-pulse"></i>
                </div>
                <span class="text-xs text-gray-300">AI analyzing...</span>
            </div>
        `;
        coachingContainer.insertBefore(loadingCard, coachingContainer.firstChild);
        
        let context = "You are an AI call center analyst. Analyze the customer's message and provide complete metrics.\n\n";
        context += "RECENT CONVERSATION:\n";
        
        const recentHistory = conversationHistory.slice(-4);
        recentHistory.forEach(msg => {
            context += `${msg.speaker === 'agent' ? agentName : customerName}: ${msg.text}\n`;
        });
        
        context += `\nCUSTOMER JUST SAID:\n${customerName}: ${customerMessage}\n\n`;
        context += `Analyze and return ONLY this EXACT JSON format:\n`;
        context += `{\n`;
        context += `  "coaching": {\n`;
        context += `    "type": "de-escalation|empathy|action|transparency|resolution|knowledge",\n`;
        context += `    "title": "Brief title (max 40 chars)",\n`;
        context += `    "message": "Short advice (max 120 chars)",\n`;
        context += `    "phrase": "Suggested response (max 80 chars) or null",\n`;
        context += `    "priority": 1-3\n`;
        context += `  },\n`;
        context += `  "metrics": {\n`;
        context += `    "empathy": 4.0-9.5 (use context: upset=4-6, neutral=6-7, positive=7.5-9.5),\n`;
        context += `    "sentiment": 0.0-1.0 (0=very upset, 0.5=neutral, 0.9-1.0=very happy),\n`;
        context += `    "stress": "High|Medium|Low",\n`;
        context += `    "clarity": "Poor|Fair|Good",\n`;
        context += `    "status": "Open|Investigating|Ongoing|Resolving|Resolved" (update progress max 4 times),\n`;
        context += `    "issue": ${customerIssueFixed ? '"KEEP_UNCHANGED"' : '"Brief issue (max 25 chars)"'},\n`;
        context += `    "tags": ["Max 4"] (ONLY customer identifiers: account tier, contact history, work situation - NEVER emotions like Happy/Frustrated/Neutral)\n`;
        context += `  }\n`;
        context += `}\n\n`;
        context += `GOOD tags: "Premium", "3rd Contact", "Work From Home", "Business Account", "VIP", "New Customer", "2+ Years"\n`;
        context += `BAD tags: "Happy", "Frustrated", "Satisfied", "Technical Issue", "Neutral" (emotions/issues are tracked separately)\n`;
        context += `Return ONLY valid JSON, nothing else.`;
        
        const response = await fetch(`${ollamaUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model,
                prompt: context,
                stream: false,
                options: {
                    temperature: 0.7,
                    top_p: 0.9,
                    num_predict: 250
                }
            })
        });
        
        const data = await response.json();
        
        const loading = document.getElementById('ai-loading');
        if (loading) loading.remove();
        
        let aiAnalysis;
        try {
            const responseText = data.response.trim();
            
            let jsonMatch = responseText.match(/\{[\s\S]*\}/);
            
            if (jsonMatch) {
                let jsonStr = jsonMatch[0];
                
                const openBraces = (jsonStr.match(/\{/g) || []).length;
                const closeBraces = (jsonStr.match(/\}/g) || []).length;
                if (openBraces > closeBraces) {
                    for (let i = 0; i < (openBraces - closeBraces); i++) {
                        jsonStr += '}';
                    }
                }
                
                jsonStr = jsonStr.replace(/,(\s*[\]}])/g, '$1');
                
                try {
                    aiAnalysis = JSON.parse(jsonStr);
                } catch (e) {
                    console.error('JSON parse failed, using fallback:', e);
                    aiAnalysis = null;
                }
            }
            
            let coaching;
            if (aiAnalysis && aiAnalysis.coaching) {
                coaching = {
                    type: aiAnalysis.coaching.type || 'empathy',
                    title: (aiAnalysis.coaching.title || 'AI Suggestion').substring(0, 40),
                    message: (aiAnalysis.coaching.message || 'Consider the customer\'s emotional state').substring(0, 120),
                    phrase: aiAnalysis.coaching.phrase ? aiAnalysis.coaching.phrase.substring(0, 80) : null,
                    priority: aiAnalysis.coaching.priority || 2
                };
            } else {
                coaching = {
                    type: 'empathy',
                    title: 'AI Suggestion',
                    message: responseText.substring(0, 120),
                    phrase: null,
                    priority: 2
                };
            }
            
            if (aiAnalysis && aiAnalysis.metrics) {
                const metrics = aiAnalysis.metrics;
                
                if (typeof metrics.empathy === 'number') {
                    updateEmpathyScore(Math.max(0, Math.min(10, metrics.empathy)));
                    updateMetrics(metrics.empathy);
                }
                
                if (typeof metrics.sentiment === 'number') {
                    updateSentimentUI(Math.max(0, Math.min(1, metrics.sentiment)));
                }
                
                if (metrics.stress && ['High', 'Medium', 'Low'].includes(metrics.stress)) {
                    updateStressLevel(metrics.stress);
                }
                
                if (metrics.clarity && ['Poor', 'Fair', 'Good'].includes(metrics.clarity)) {
                    updateClarity(metrics.clarity);
                }
                
                if (metrics.status && statusUpdateCount < 4) {
                    const validStatuses = ['Open', 'Investigating', 'Ongoing', 'Resolving', 'Resolved'];
                    if (validStatuses.includes(metrics.status)) {
                        customerStatus.textContent = metrics.status;
                        customerStatus.className = 'font-semibold ' + 
                            (metrics.status === 'Resolved' ? 'text-green-400' : 
                             metrics.status === 'Open' ? 'text-red-400' : 'text-yellow-400');
                        statusUpdateCount++;
                    }
                }
                
                const customerInfo = {};
                if (!customerIssueFixed && metrics.issue && metrics.issue !== 'KEEP_UNCHANGED') {
                    customerInfo.issue = metrics.issue.substring(0, 25);
                    customerIssueFixed = true;
                }
                if (metrics.tags && Array.isArray(metrics.tags)) {
                    customerInfo.tags = metrics.tags.slice(0, 4);
                }
                if (Object.keys(customerInfo).length > 0) {
                    updateCustomerInfo(customerInfo);
                }
            }
            
            addCoachingCard(coaching, true);
            
        } catch (parseError) {
            console.error('Failed to parse AI response:', parseError);
            addCoachingCard({
                type: 'action',
                title: 'AI Analysis',
                message: data.response.substring(0, 120),
                phrase: null,
                priority: 2
            }, true);
        }
        
    } catch (error) {
        console.error('Failed to get AI coaching:', error);
        const loading = document.getElementById('ai-loading');
        if (loading) loading.remove();
        
        addCoachingCard({
            type: 'knowledge',
            title: 'AI Connection Error',
            message: 'Could not connect to Ollama. Make sure it\'s running and accessible at: ' + (localStorage.getItem('ollama-host') || 'http://localhost:11434'),
            phrase: null,
            priority: 3
        }, true);
    }
}

function usePhraseClicked() {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(34, 197, 94, 0.95);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        animation: slide-in 0.3s ease;
    `;
    toast.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Phrase inserted';
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slide-in 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// Update call timer
setInterval(updateCallTimer, 1000);

// Theme toggle function
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    
    body.classList.toggle('light-mode');
    
    if (body.classList.contains('light-mode')) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        localStorage.setItem('theme', 'light');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        localStorage.setItem('theme', 'dark');
    }
}

// Initialize Speech Recognition (Customer voice only)
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        console.error('Speech Recognition not supported in this browser');
        return null;
    }
    
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event) => {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;
        
        if (result.isFinal) {
            console.log('Customer said:', transcript);
            
            // YOUR VOICE = CUSTOMER
            addTranscriptLine('Customer', transcript, 'customer');
            
            conversationHistory.push({
                speaker: 'customer',
                name: 'Customer',
                text: transcript
            });
            
            customerHasSpoken = true;
            
            // Trigger AI analysis for metrics
            setTimeout(() => {
                analyzeCustomerMessage(transcript, 'Customer', 'AI Agent');
            }, 500);
            
            // AI agent responds
            setTimeout(() => {
                getAgentResponse(transcript);
            }, 1500);
        }
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
    };
    
    recognition.onend = () => {
        if (isListening) {
            recognition.start();
        }
    };
    
    return recognition;
}

// Initialize audio spectrum for customer voice
async function initAudioSpectrum() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        
        analyser.fftSize = 64;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        
        microphone.connect(analyser);
        
        animateSpectrum();
        
        return true;
    } catch (error) {
        console.error('Failed to access microphone:', error);
        return false;
    }
}

function animateSpectrum() {
    if (!analyser) return;
    
    analyser.getByteFrequencyData(dataArray);
    
    const bars = document.querySelectorAll('.spectrum-bar');
    bars.forEach((bar, index) => {
        const value = dataArray[Math.floor(index * dataArray.length / bars.length)] || 0;
        const height = (value / 255) * 100;
        bar.style.height = `${Math.max(10, height)}%`;
    });
    
    animationFrameId = requestAnimationFrame(animateSpectrum);
}

// Start/Stop live session
function toggleLiveSession() {
    isListening = !isListening;
    
    const modeIndicator = document.getElementById('mode-indicator');
    const modeBtnText = document.getElementById('mode-btn-text');
    const toggleBtn = document.getElementById('toggle-mode-btn');
    
    if (isListening) {
        // Start live session
        if (!recognition) {
            recognition = initSpeechRecognition();
        }
        
        if (recognition) {
            try {
                recognition.start();
                
                // Start audio spectrum
                initAudioSpectrum();
                
                // Start call timer
                callStartTime = Date.now();
                
                modeIndicator.innerHTML = `
                    <div class="w-1.5 h-1.5 bg-red-500 rounded-full live-pulse"></div>
                    <span class="text-xs font-semibold text-red-400 uppercase tracking-wide">Live</span>
                `;
                modeIndicator.className = 'flex items-center gap-2 px-2 py-1 bg-red-500/10 border border-red-500/30 rounded-full';
                
                modeBtnText.textContent = 'Stop Session';
                toggleBtn.className = 'px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-semibold rounded border border-red-500/30 transition';
                
                showToast('Live session started - speak now', 'success');
            } catch (error) {
                console.error('Failed to start:', error);
                showToast('Microphone access denied', 'error');
                isListening = false;
            }
        } else {
            showToast('Speech recognition not supported', 'error');
            isListening = false;
        }
    } else {
        // Stop live session
        if (recognition) {
            recognition.stop();
        }
        
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        
        callStartTime = null;
        
        modeIndicator.innerHTML = `
            <div class="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
            <span class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Stopped</span>
        `;
        modeIndicator.className = 'flex items-center gap-2 px-2 py-1 bg-gray-500/10 border border-gray-500/30 rounded-full';
        
        modeBtnText.textContent = 'Start Session';
        toggleBtn.className = 'px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs font-semibold rounded border border-green-500/30 transition';
        
        showToast('Live session stopped', 'success');
    }
}

// Check Ollama connection on startup
async function checkOllamaConnection() {
    const ollamaUrl = localStorage.getItem('ollama-host') || 'http://localhost:11434';
    const model = localStorage.getItem('ollama-model') || 'qwen2.5:3b';
    
    try {
        const response = await fetch(`${ollamaUrl}/api/tags`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000)
        });
        
        if (!response.ok) {
            return false;
        }
        
        const data = await response.json();
        const availableModels = data.models?.map(m => m.name) || [];
        const modelExists = availableModels.some(m => m === model || m.includes(model.split(':')[0]));
        
        return modelExists;
    } catch (error) {
        console.error('Ollama connection check failed:', error);
        return false;
    }
}

// Show connection warning
function showConnectionWarning() {
    const warningDiv = document.createElement('div');
    warningDiv.id = 'ollama-warning';
    warningDiv.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 z-50';
    warningDiv.innerHTML = `
        <div class="bg-red-500/90 backdrop-blur-sm text-white px-6 py-4 rounded-lg shadow-lg border border-red-400 max-w-md">
            <div class="flex items-start gap-3">
                <i class="fas fa-exclamation-triangle text-2xl"></i>
                <div class="flex-1">
                    <h3 class="font-bold text-lg mb-1">Ollama Not Connected</h3>
                    <p class="text-sm mb-3">Configure Ollama in Settings to enable AI coaching.</p>
                    <button onclick="openSettings()" class="px-4 py-2 bg-white text-red-600 rounded font-semibold text-sm hover:bg-gray-100 transition">
                        <i class="fas fa-cog mr-2"></i>Open Settings
                    </button>
                </div>
                <button onclick="document.getElementById('ollama-warning').remove()" class="text-white hover:text-red-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(warningDiv);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize metrics
    empathyScore.textContent = '--';
    qualityScore.textContent = '--';
    predictedCsat.textContent = '--';
    callTime.textContent = '00:00';
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        document.getElementById('theme-icon').classList.remove('fa-moon');
        document.getElementById('theme-icon').classList.add('fa-sun');
    }
    
    // Initialize speech recognition
    initSpeechRecognition();
    
    // Check Ollama connection
    console.log('Checking Ollama connection...');
    ollamaConnected = await checkOllamaConnection();
    
    if (ollamaConnected) {
        console.log('Ollama connected! Ready to start live session.');
        showToast('Ready! Click "Start Session" to begin.', 'success');
    } else {
        console.warn('Ollama not connected.');
        showConnectionWarning();
    }
});

// Settings Modal Functions
function openSettings() {
    const modal = document.getElementById('settings-modal');
    modal.classList.remove('hidden');
    
    const savedHost = localStorage.getItem('ollama-host') || 'http://localhost:11434';
    const savedModel = localStorage.getItem('ollama-model') || 'qwen2.5:3b';
    
    document.getElementById('ollama-host').value = savedHost;
    document.getElementById('ollama-model').value = savedModel;
}

function closeSettings() {
    document.getElementById('settings-modal').classList.add('hidden');
}

async function saveSettings() {
    const host = document.getElementById('ollama-host').value.trim();
    const model = document.getElementById('ollama-model').value.trim();
    
    if (!host) {
        showToast('Please enter an Ollama host URL', 'error');
        return;
    }
    
    if (!model) {
        showToast('Please enter a model name', 'error');
        return;
    }
    
    localStorage.setItem('ollama-host', host);
    localStorage.setItem('ollama-model', model);
    
    showToast('Settings saved! Testing connection...', 'success');
    
    ollamaConnected = await checkOllamaConnection();
    
    if (ollamaConnected) {
        showToast('Connection verified! Ready to start live session.', 'success');
        setTimeout(() => {
            closeSettings();
        }, 1500);
    } else {
        showToast('Settings saved, but connection failed. Check settings.', 'error');
    }
}

async function testOllamaConnection() {
    const host = document.getElementById('ollama-host').value.trim();
    const model = document.getElementById('ollama-model').value.trim();
    const statusDiv = document.getElementById('connection-status');
    const testBtn = document.getElementById('test-connection-btn');
    
    if (!host) {
        showToast('Please enter an Ollama host URL', 'error');
        return;
    }
    
    testBtn.disabled = true;
    testBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';
    statusDiv.classList.remove('hidden');
    statusDiv.className = 'p-3 rounded-lg text-sm bg-blue-500/10 border border-blue-500/30';
    statusDiv.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i><span class="text-blue-400">Testing connection...</span>';
    
    try {
        const tagsResponse = await fetch(`${host}/api/tags`, {
            method: 'GET'
        });
        
        if (!tagsResponse.ok) {
            throw new Error(`Ollama server returned ${tagsResponse.status}`);
        }
        
        const tagsData = await tagsResponse.json();
        const availableModels = tagsData.models?.map(m => m.name) || [];
        
        const modelExists = availableModels.some(m => m === model || m.includes(model.split(':')[0]));
        
        if (!modelExists && availableModels.length > 0) {
            statusDiv.className = 'p-3 rounded-lg text-sm bg-orange-500/10 border border-orange-500/30';
            statusDiv.innerHTML = `
                <div class="flex items-start gap-2">
                    <i class="fas fa-exclamation-triangle text-orange-400 mt-0.5"></i>
                    <div class="flex-1">
                        <p class="text-orange-400 font-semibold">Model Not Found</p>
                        <p class="text-gray-400 text-xs mt-1">Looking for: "${model}"</p>
                        <p class="text-gray-400 text-xs mt-1">Available: ${availableModels.join(', ')}</p>
                    </div>
                </div>
            `;
        }
        
        const testResponse = await fetch(`${host}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model,
                prompt: 'Say "Hello" in one word.',
                stream: false,
                options: { num_predict: 10 }
            })
        });
        
        const data = await testResponse.json();
        
        if (!testResponse.ok) {
            throw new Error(`Model generation failed: ${testResponse.status}`);
        }
        
        ollamaConnected = true;
        
        statusDiv.className = 'p-3 rounded-lg text-sm bg-green-500/10 border border-green-500/30';
        statusDiv.innerHTML = `
            <div class="flex items-start gap-2">
                <i class="fas fa-check-circle text-green-400 mt-0.5"></i>
                <div class="flex-1">
                    <p class="text-green-400 font-semibold">Connection Successful!</p>
                    <p class="text-cyan-400 text-xs mt-2 font-semibold"><i class="fas fa-info-circle mr-1"></i>Ready to start live session!</p>
                </div>
            </div>
        `;
        showToast('Connection successful!', 'success');
        
        const warning = document.getElementById('ollama-warning');
        if (warning) warning.remove();
        
    } catch (error) {
        statusDiv.className = 'p-3 rounded-lg text-sm bg-red-500/10 border border-red-500/30';
        statusDiv.innerHTML = `
            <div class="flex items-start gap-2">
                <i class="fas fa-times-circle text-red-400 mt-0.5"></i>
                <div class="flex-1">
                    <p class="text-red-400 font-semibold">Error</p>
                    <p class="text-gray-400 text-xs mt-1">${error.message}</p>
                </div>
            </div>
        `;
        showToast('Connection error', 'error');
    } finally {
        testBtn.disabled = false;
        testBtn.innerHTML = '<i class="fas fa-plug"></i> Test Connection';
    }
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'rgba(34, 197, 94, 0.95)' : 'rgba(239, 68, 68, 0.95)';
    const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
    
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        animation: slide-in 0.3s ease;
    `;
    toast.innerHTML = `<i class="fas fa-${icon} mr-2"></i>${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slide-in 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Make functions available globally
window.usePhraseClicked = usePhraseClicked;
window.toggleTheme = toggleTheme;
window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.saveSettings = saveSettings;
window.testOllamaConnection = testOllamaConnection;
window.toggleLiveSession = toggleLiveSession;
