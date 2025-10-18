// Live Demo Script - Realistic call simulation with Dana & Marcus

const conversation = [
    {
        time: 2,
        speaker: 'agent',
        name: 'Marcus',
        text: 'Thank you for calling TechEase Internet Support. My name is Marcus. How can I help you today?',
        sentiment: null,
        empathy: null,
        stress: null,
        clarity: null,
        coaching: null
    },
    {
        time: 8,
        speaker: 'customer',
        name: 'Dana',
        text: "I'm honestly getting fed up. My internet keeps dropping every hour, and it's been happening all week. I'm tired of calling and getting no real help.",
        highlights: ['fed up', 'dropping every hour', 'all week', 'tired of calling', 'no real help'],
        sentiment: 0.1,
        empathy: 3.2,
        stress: 'High',
        clarity: 'Good',
        customerInfo: {
            name: 'Dana Rodriguez',
            initials: 'DR',
            issue: 'Internet Dropping',
            tags: ['Repeat Caller']
        },
        coaching: {
            type: 'de-escalation',
            title: 'Customer Frustrated',
            message: 'Customer expressing frustration with recurring issue and lack of resolution.',
            phrase: "I understand your frustration, Dana. Let's get this resolved for you right now.",
            priority: 1
        }
    },
    {
        time: 15,
        speaker: 'agent',
        name: 'Marcus',
        text: "I'm really sorry to hear that, Dana. I know how frustrating it can be when your connection keeps cutting out. Let's take a look together and see what might be going on.",
        sentiment: 0.15,
        empathy: 5.5,
        stress: 'High',
        clarity: 'Good',
        coaching: null
    },
    {
        time: 24,
        speaker: 'customer',
        name: 'Dana',
        text: "You said that last time. The last agent said they would fix it within 24 hours, and here I am, calling again. I work from home. This is costing me time and money.",
        highlights: ['said that last time', 'calling again', 'work from home', 'costing me time and money'],
        sentiment: 0.08,
        empathy: 5.5,
        stress: 'High',
        clarity: 'Good',
        customerInfo: {
            tags: ['Work From Home', '3rd Call']
        },
        coaching: {
            type: 'empathy',
            title: 'Acknowledge Impact',
            message: 'Customer expressing financial and professional impact. Validate the seriousness.',
            phrase: "I completely understand - when you work from home, reliable internet isn't optional. Let me find a real solution.",
            priority: 1
        }
    },
    {
        time: 35,
        speaker: 'agent',
        name: 'Marcus',
        text: "I completely understand. I can see from your account that there were a few signal drops reported on your line. Let me try restarting your modem remotely.",
        sentiment: 0.12,
        empathy: 6.0,
        stress: 'High',
        clarity: 'Good',
        coaching: null
    },
    {
        time: 45,
        speaker: 'agent',
        name: 'Marcus',
        text: "Alright, I've just sent the restart signal. It should reconnect in about a minute or two.",
        sentiment: 0.15,
        empathy: 6.0,
        stress: 'High',
        clarity: 'Good',
        coaching: null
    },
    {
        time: 52,
        speaker: 'customer',
        name: 'Dana',
        text: "I've done that a hundred times. That's not fixing the issue. I need a real solution, not another restart.",
        highlights: ['done that a hundred times', 'not fixing', 'real solution'],
        sentiment: 0.10,
        empathy: 6.0,
        stress: 'High',
        clarity: 'Good',
        coaching: {
            type: 'action',
            title: 'Escalate or Offer Alternative',
            message: 'Customer rejecting basic troubleshooting. Consider escalating to technical team.',
            phrase: "You're right - if restarts haven't worked, we need to escalate this to our network team for deeper analysis.",
            priority: 1
        }
    },
    {
        time: 62,
        speaker: 'agent',
        name: 'Marcus',
        text: 'I understand. We follow the "Step One Service Protocol," which requires us to restart and monitor before escalating to our network team. Once that is complete, I can submit a ticket if the issue continues.',
        sentiment: 0.12,
        empathy: 5.2,
        stress: 'High',
        clarity: 'Good',
        coaching: {
            type: 'transparency',
            title: 'Protocol Limitation',
            message: 'Agent citing protocol. Customer may feel unheard. Balance protocol with empathy.',
            phrase: "I know this process feels frustrating. I wish I could skip ahead, but I need to follow protocol to get you the best help.",
            priority: 2
        }
    },
    {
        time: 72,
        speaker: 'customer',
        name: 'Dana',
        text: "So you're telling me I have to wait again?",
        highlights: ['wait again'],
        sentiment: 0.15,
        empathy: 5.2,
        stress: 'Medium',
        clarity: 'Good',
        coaching: null
    },
    {
        time: 77,
        speaker: 'agent',
        name: 'Marcus',
        text: "For now, yes. We need to confirm if this step resolves it first. It usually helps in most cases.",
        sentiment: 0.18,
        empathy: 4.8,
        stress: 'Medium',
        clarity: 'Good',
        coaching: null
    },
    {
        time: 85,
        speaker: 'customer',
        name: 'Dana',
        text: "(sighs) Fine. Let's see if it works. The lights are back on... Okay, it's connected again.",
        highlights: ['sighs', 'Fine'],
        sentiment: 0.35,
        empathy: 4.8,
        stress: 'Medium',
        clarity: 'Good',
        coaching: null
    },
    {
        time: 93,
        speaker: 'agent',
        name: 'Marcus',
        text: "That's great news. Let's hope it stays stable this time. I'll note the account and send a follow-up email with the service report.",
        sentiment: 0.40,
        empathy: 5.5,
        stress: 'Medium',
        clarity: 'Good',
        coaching: null
    },
    {
        time: 102,
        speaker: 'customer',
        name: 'Dana',
        text: "Alright. I appreciate your tone, Marcus. You're polite. I just wish someone would actually fix it for good.",
        highlights: ['appreciate', 'polite', 'fix it for good'],
        sentiment: 0.50,
        empathy: 5.5,
        stress: 'Medium',
        clarity: 'Good',
        coaching: {
            type: 'empathy',
            title: 'Customer Softening',
            message: 'Customer acknowledging agent effort despite frustration. Good rapport building.',
            phrase: "Thank you, Dana. I genuinely want this resolved for you. If it drops again, call back immediately and reference this case.",
            priority: 2
        }
    },
    {
        time: 112,
        speaker: 'agent',
        name: 'Marcus',
        text: "I completely understand. If it drops again, please call back and we'll escalate it to our network department immediately.",
        sentiment: 0.48,
        empathy: 6.0,
        stress: 'Medium',
        clarity: 'Good',
        coaching: null
    },
    {
        time: 120,
        speaker: 'customer',
        name: 'Dana',
        text: "So you're saying I have to call again? This is the third time. You can't just create that ticket now?",
        highlights: ['call again', 'third time', "can't just create that ticket"],
        sentiment: 0.35,
        empathy: 6.0,
        stress: 'Medium',
        clarity: 'Good',
        coaching: {
            type: 'action',
            title: 'Customer Requesting Proactive Action',
            message: 'Customer wants ticket created now. Consider if protocol allows proactive escalation.',
            phrase: "Let me check if I can create a preventive ticket now based on your history. You shouldn't have to call back.",
            priority: 1
        }
    },
    {
        time: 130,
        speaker: 'agent',
        name: 'Marcus',
        text: "The protocol doesn't allow it until we verify the restart result. I'm really sorry.",
        sentiment: 0.30,
        empathy: 5.0,
        stress: 'Medium',
        clarity: 'Good',
        coaching: {
            type: 'transparency',
            title: 'Protocol Limitation Again',
            message: 'Agent stuck in protocol. Customer frustration may increase. Show genuine regret.',
            phrase: "I hear you - this policy frustrates me too. I'll document everything so if you do call back, it's escalated instantly.",
            priority: 2
        }
    },
    {
        time: 138,
        speaker: 'customer',
        name: 'Dana',
        text: "That's ridiculous. You're nice, but this process is useless. I'll call again if it happens, but I'm not happy about it.",
        highlights: ['ridiculous', "You're nice", 'process is useless', 'not happy'],
        sentiment: 0.32,
        empathy: 5.0,
        stress: 'Medium',
        clarity: 'Good',
        coaching: null
    },
    {
        time: 148,
        speaker: 'agent',
        name: 'Marcus',
        text: "I understand, Dana. I truly wish I could do more within the system.",
        sentiment: 0.35,
        empathy: 5.5,
        stress: 'Low',
        clarity: 'Good',
        coaching: null
    },
    {
        time: 153,
        speaker: 'customer',
        name: 'Dana',
        text: "Yeah. Thanks anyway.",
        sentiment: 0.40,
        empathy: 5.5,
        stress: 'Low',
        clarity: 'Good',
        coaching: null
    }
];

// State management
let currentTime = 0;
let currentIndex = 0;
let callActive = true;
let callPaused = false; // Track if call is paused
let conversationHistory = []; // Track full conversation for AI context
let customerIssueFixed = false; // Once issue is identified, keep it fixed
let statusUpdateCount = 0; // Limit status updates to max 4
let aiRequestCount = 0; // Track AI requests to limit frequency
let customerHasSpoken = false; // Track if customer has spoken yet

// Live mode state
let liveMode = false; // Track if in live mode or demo mode
let recognition = null; // Speech recognition instance
let isListening = false; // Track if actively listening
let ollamaConnected = false; // Track if Ollama is connected and ready

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

// Helper functions
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function updateSentimentUI(sentiment) {
    // Update sentiment label only (bar removed)
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
    
    // Animate color change
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
    if (!stress) return; // Don't update if null
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
    if (!clarity) return; // Don't update if null
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
    // Update quality score based on empathy
    // Low empathy (4.0-6.0): 65-78%
    // Medium empathy (6.0-7.5): 78-85%
    // High empathy (7.5-9.5): 85-92%
    const quality = Math.min(92, Math.max(65, Math.round(empathy * 9 + 29)));
    qualityScore.textContent = `${quality}%`;
    
    // Update predicted CSAT
    // Low empathy (4.0-6.0): 5.0-7.0
    // Medium empathy (6.0-7.5): 7.0-8.5
    // High empathy (7.5-9.5): 8.5-9.5
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
    if (info.tier) {
        customerTier.textContent = info.tier;
    }
    if (info.issue) {
        customerIssue.textContent = info.issue;
        customerIssue.className = 'font-semibold text-red-400';
    }
    if (info.tags) {
        info.tags.forEach(tag => {
            // Check if tag already exists
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

function highlightText(text, highlights) {
    if (!highlights || highlights.length === 0) return text;
    
    let result = text;
    highlights.forEach(term => {
        const regex = new RegExp(`(${term})`, 'gi');
        result = result.replace(regex, '<span class="highlight-term">$1</span>');
    });
    return result;
}

function addTranscriptLine(item) {
    const isAgent = item.speaker === 'agent';
    const borderColor = isAgent ? 'border-blue-500' : 'border-yellow-500';
    const textColor = isAgent ? 'text-blue-400' : 'text-yellow-400';
    const avatar = isAgent ? 
        `<i class="fas fa-headset text-white text-xs"></i>` :
        `<span class="text-xs font-semibold">LC</span>`;
    const bgColor = isAgent ? 'from-blue-500 to-cyan-500' : 'from-yellow-500 to-orange-500';
    
    const minutes = Math.floor(currentTime / 60);
    const seconds = currentTime % 60;
    const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    const transcriptLine = document.createElement('div');
    transcriptLine.className = 'transcript-line flex gap-3 group';
    transcriptLine.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-gradient-to-br ${bgColor} flex items-center justify-center flex-shrink-0 ring-2 ring-${isAgent ? 'blue' : 'yellow'}-500/30 text-white">
            ${avatar}
        </div>
        <div class="flex-1 bg-slate-800/20 rounded-lg p-3 border border-${isAgent ? 'blue' : 'yellow'}-500/10">
            <div class="flex items-start justify-between mb-1">
                <span class="text-xs font-medium ${textColor}">${item.name}${isAgent ? ' (Agent)' : ''}</span>
                <span class="text-xs text-gray-500">${timeStr}</span>
            </div>
            <p class="text-sm leading-relaxed">
                ${highlightText(item.text, item.highlights)}
            </p>
        </div>
    `;
    
    // Append to messages container (flex-col layout means bottom is last)
    transcriptMessages.appendChild(transcriptLine);
    
    // Container uses flex-col-reverse, so scrollTop 0 shows the latest messages
    // No need to manually scroll - flex-col-reverse handles it
}

function addTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'transcript-line flex gap-3';
    typingDiv.innerHTML = `
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
    
    transcriptMessages.appendChild(typingDiv);
}

function removeTypingIndicator() {
    const typing = document.getElementById('typing-indicator');
    if (typing) {
        typing.remove();
    }
}

function addCoachingCard(coaching, isAI = false) {
    // Don't remove old cards - keep all coaching suggestions visible
    // Users can scroll through the history
    
    // Determine card styling based on type
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

// NEW: Call Ollama API for AI coaching analysis (DIRECT from browser)
async function analyzeCustomerMessage(customerMessage, customerName, agentName) {
    try {
        // Get saved Ollama settings
        const ollamaUrl = localStorage.getItem('ollama-host') || 'http://localhost:11434';
        const model = localStorage.getItem('ollama-model') || 'qwen2.5:3b';
        
        // Add loading indicator
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
        
        // Build comprehensive analysis prompt
        let context = "You are an AI call center analyst. Analyze the customer's message and provide complete metrics.\n\n";
        context += "RECENT CONVERSATION:\n";
        
        // Only include last 4 messages for context
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
        
        // Call Ollama directly from browser
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
        
        // Remove loading indicator
        const loading = document.getElementById('ai-loading');
        if (loading) loading.remove();
        
        // Parse the AI response
        let aiAnalysis;
        try {
            const responseText = data.response.trim();
            
            // Try to extract and complete JSON
            let jsonMatch = responseText.match(/\{[\s\S]*\}/);
            
            if (jsonMatch) {
                let jsonStr = jsonMatch[0];
                
                // Try to fix incomplete JSON by closing it properly
                const openBraces = (jsonStr.match(/\{/g) || []).length;
                const closeBraces = (jsonStr.match(/\}/g) || []).length;
                if (openBraces > closeBraces) {
                    for (let i = 0; i < (openBraces - closeBraces); i++) {
                        jsonStr += '}';
                    }
                }
                
                // Remove trailing commas before closing brace
                jsonStr = jsonStr.replace(/,(\s*[\]}])/g, '$1');
                
                try {
                    aiAnalysis = JSON.parse(jsonStr);
                } catch (e) {
                    console.error('JSON parse failed, using fallback:', e);
                    aiAnalysis = null;
                }
            }
            
            // Validate and extract coaching
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
            
            // Extract and apply metrics
            if (aiAnalysis && aiAnalysis.metrics) {
                const metrics = aiAnalysis.metrics;
                
                // Update empathy score
                if (typeof metrics.empathy === 'number') {
                    updateEmpathyScore(Math.max(0, Math.min(10, metrics.empathy)));
                    updateMetrics(metrics.empathy);
                }
                
                // Update sentiment
                if (typeof metrics.sentiment === 'number') {
                    updateSentimentUI(Math.max(0, Math.min(1, metrics.sentiment)));
                }
                
                // Update stress level
                if (metrics.stress && ['High', 'Medium', 'Low'].includes(metrics.stress)) {
                    updateStressLevel(metrics.stress);
                }
                
                // Update clarity
                if (metrics.clarity && ['Poor', 'Fair', 'Good'].includes(metrics.clarity)) {
                    updateClarity(metrics.clarity);
                }
                
                // Update customer status (max 4 times)
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
                
                // Update customer info (issue fixed once set, tags)
                const customerInfo = {};
                if (!customerIssueFixed && metrics.issue && metrics.issue !== 'KEEP_UNCHANGED') {
                    customerInfo.issue = metrics.issue.substring(0, 25);
                    customerIssueFixed = true; // Lock it after first set
                }
                if (metrics.tags && Array.isArray(metrics.tags)) {
                    customerInfo.tags = metrics.tags.slice(0, 4);
                }
                if (Object.keys(customerInfo).length > 0) {
                    updateCustomerInfo(customerInfo);
                }
            }
            
            // Add coaching card
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
        // Remove loading indicator on error
        const loading = document.getElementById('ai-loading');
        if (loading) loading.remove();
        
        // Show error in coaching panel
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
    // Create toast notification
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

// Main simulation loop
function simulateCall() {
    // Skip if paused
    if (callPaused) {
        setTimeout(simulateCall, 100); // Check again soon
        return;
    }
    
    callTime.textContent = formatTime(currentTime);
    
    // Check if we need to add next conversation item
    if (currentIndex < conversation.length) {
        const item = conversation[currentIndex];
        
        if (currentTime >= item.time) {
            // Show typing indicator before agent responses
            if (item.speaker === 'agent' && currentTime > 0) {
                removeTypingIndicator();
            }
            
            // Add transcript line
            addTranscriptLine(item);
            
            // Add to conversation history for AI context
            conversationHistory.push({
                speaker: item.speaker,
                name: item.name,
                text: item.text
            });
            
            // Update customer info if present
            if (item.customerInfo) {
                updateCustomerInfo(item.customerInfo);
            }
            
            // Update sentiment and empathy (ONLY from AI, not hardcoded values)
            if (item.speaker === 'customer') {
                customerHasSpoken = true;
            }
            
            // Don't use hardcoded sentiment/empathy values - wait for AI
            // These will be updated by the AI analysis function
            
            // Add coaching if present (original mock coaching)
            if (item.coaching) {
                setTimeout(() => addCoachingCard(item.coaching, false), 800);
            }
            
            // NEW: If customer spoke, call AI to get ALL metrics
            if (item.speaker === 'customer' && ollamaConnected) {
                // Call AI for EVERY customer message to get accurate metrics
                // Get agent name from conversation (first agent message)
                const agentName = conversation.find(msg => msg.speaker === 'agent')?.name || 'Agent';
                
                setTimeout(() => {
                    analyzeCustomerMessage(item.text, item.name, agentName);
                }, 800); // Call AI to get real metrics
            }
            
            // Show typing for next agent response
            if (currentIndex < conversation.length - 1 && conversation[currentIndex + 1].speaker === 'agent') {
                setTimeout(() => addTypingIndicator(), 1000);
            }
            
            currentIndex++;
        }
    }
    
    // Continue simulation
    if (currentTime < 120) { // Run for 2 minutes
        currentTime++;
        setTimeout(simulateCall, 1000);
    } else {
        callActive = false;
        removeTypingIndicator();
    }
}

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

// Initialize Speech Recognition
function initSpeechRecognition() {
    // Check if browser supports Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        console.error('Speech Recognition not supported in this browser');
        return null;
    }
    
    recognition = new SpeechRecognition();
    recognition.continuous = true; // Keep listening
    recognition.interimResults = true; // Get interim results
    recognition.lang = 'en-US';
    
    let lastTranscript = '';
    let lastSpeaker = 'agent'; // Alternate between agent and customer
    
    recognition.onresult = (event) => {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;
        
        // Only process if it's a final result
        if (result.isFinal) {
            console.log('Final transcript:', transcript);
            
            // Alternate speaker (simple logic - you can improve this)
            lastSpeaker = lastSpeaker === 'agent' ? 'customer' : 'agent';
            const speakerName = lastSpeaker === 'agent' ? 'Agent' : 'Customer';
            
            // Add to transcript display
            addLiveTranscriptLine(speakerName, transcript, lastSpeaker);
            
            // Add to conversation history
            conversationHistory.push({
                speaker: lastSpeaker,
                name: speakerName,
                text: transcript
            });
            
            // If customer spoke, trigger AI analysis
            if (lastSpeaker === 'customer') {
                customerHasSpoken = true;
                aiRequestCount++;
                if (aiRequestCount % 2 === 1) { // Every other customer message
                    setTimeout(() => {
                        analyzeCustomerMessage(transcript, 'Customer', 'Agent');
                    }, 1500);
                }
            }
            
            lastTranscript = transcript;
        }
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
            console.log('No speech detected, continuing...');
        }
    };
    
    recognition.onend = () => {
        if (isListening && liveMode) {
            // Restart if still in live mode
            recognition.start();
        }
    };
    
    return recognition;
}

// Add live transcript line
function addLiveTranscriptLine(speakerName, text, speakerType) {
    const isAgent = speakerType === 'agent';
    const borderColor = isAgent ? 'border-blue-500' : 'border-yellow-500';
    const textColor = isAgent ? 'text-blue-400' : 'text-yellow-400';
    const avatar = isAgent ? 
        `<i class="fas fa-headset text-white text-xs"></i>` :
        `<span class="text-xs font-semibold">CU</span>`;
    const bgColor = isAgent ? 'from-blue-500 to-cyan-500' : 'from-yellow-500 to-orange-500';
    
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
                <span class="text-xs font-medium ${textColor}">${speakerName}${isAgent ? ' (Agent)' : ''}</span>
                <span class="text-xs text-gray-500">${timeStr}</span>
            </div>
            <p class="text-sm leading-relaxed">
                ${text}
            </p>
        </div>
    `;
    
    transcriptMessages.appendChild(transcriptLine);
}

// Toggle between demo and live mode
function toggleMode() {
    liveMode = !liveMode;
    
    const modeIndicator = document.getElementById('mode-indicator');
    const modeBtnText = document.getElementById('mode-btn-text');
    const toggleBtn = document.getElementById('toggle-mode-btn');
    
    if (liveMode) {
        // Switch to live mode
        callActive = false; // Stop demo simulation
        
        // Initialize speech recognition if not already
        if (!recognition) {
            recognition = initSpeechRecognition();
        }
        
        if (recognition) {
            // Start listening
            try {
                recognition.start();
                isListening = true;
                
                modeIndicator.innerHTML = `
                    <div class="w-1.5 h-1.5 bg-red-500 rounded-full live-pulse"></div>
                    <span class="text-xs font-semibold text-red-400 uppercase tracking-wide">Live</span>
                `;
                modeIndicator.className = 'flex items-center gap-2 px-2 py-1 bg-red-500/10 border border-red-500/30 rounded-full';
                
                modeBtnText.textContent = 'Stop Live';
                toggleBtn.className = 'px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-semibold rounded border border-red-500/30 transition';
                
                showToast('Live mode activated - speak into microphone', 'success');
            } catch (error) {
                console.error('Failed to start recognition:', error);
                showToast('Microphone access denied or unavailable', 'error');
                liveMode = false;
            }
        } else {
            showToast('Speech recognition not supported in your browser', 'error');
            liveMode = false;
        }
    } else {
        // Switch back to demo mode
        if (recognition && isListening) {
            recognition.stop();
            isListening = false;
        }
        
        modeIndicator.innerHTML = `
            <div class="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
            <span class="text-xs font-semibold text-purple-400 uppercase tracking-wide">Demo</span>
        `;
        modeIndicator.className = 'flex items-center gap-2 px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full';
        
        modeBtnText.textContent = 'Go Live';
        toggleBtn.className = 'px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs font-semibold rounded border border-green-500/30 transition';
        
        showToast('Demo mode activated', 'success');
        
        // Restart demo simulation
        callActive = true;
        currentTime = 0;
        currentIndex = 0;
        setTimeout(() => simulateCall(), 1000);
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
                    <p class="text-sm mb-3">The dashboard requires Ollama to analyze conversations. Please configure and test your connection in Settings.</p>
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

// Start simulation on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize metrics
    qualityScore.textContent = '--';
    predictedCsat.textContent = '--';
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        document.getElementById('theme-icon').classList.remove('fa-moon');
        document.getElementById('theme-icon').classList.add('fa-sun');
    }
    
    // Initialize speech recognition (but don't start)
    initSpeechRecognition();
    
    // Check Ollama connection before starting
    console.log('Checking Ollama connection...');
    ollamaConnected = await checkOllamaConnection();
    
    if (ollamaConnected) {
        console.log('Ollama connected! Starting demo...');
        // Start demo after a brief delay
        setTimeout(() => {
            simulateCall();
        }, 1000);
    } else {
        console.warn('Ollama not connected. Demo will not start.');
        showConnectionWarning();
        // Don't start demo - wait for user to configure Ollama
    }
});

// Settings Modal Functions
function openSettings() {
    const modal = document.getElementById('settings-modal');
    modal.classList.remove('hidden');
    
    // Load saved settings
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
    
    // Test connection after saving
    ollamaConnected = await checkOllamaConnection();
    
    if (ollamaConnected) {
        showToast('Connection verified! Dashboard ready.', 'success');
        setTimeout(() => {
            closeSettings();
            // Start demo if not running
            if (!callActive && !liveMode) {
                setTimeout(() => {
                    callActive = true;
                    simulateCall();
                }, 500);
            }
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
    
    // Show loading state
    testBtn.disabled = true;
    testBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';
    statusDiv.classList.remove('hidden');
    statusDiv.className = 'p-3 rounded-lg text-sm bg-blue-500/10 border border-blue-500/30';
    statusDiv.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i><span class="text-blue-400">Testing connection...</span>';
    
    try {
        // Test directly from browser (not through backend)
        // Test 1: Check if server is reachable
        const tagsResponse = await fetch(`${host}/api/tags`, {
            method: 'GET'
        });
        
        if (!tagsResponse.ok) {
            throw new Error(`Ollama server returned ${tagsResponse.status}`);
        }
        
        const tagsData = await tagsResponse.json();
        const availableModels = tagsData.models?.map(m => m.name) || [];
        
        // Test 2: Check if model exists (exact match or partial match)
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
                        <p class="text-gray-400 text-xs mt-2">⚠️ Try testing anyway - it might still work</p>
                    </div>
                </div>
            `;
            // Don't return - continue to test generation anyway
            console.log('Model check failed but continuing...', { model, availableModels });
        }
        
        // Test 3: Try a simple generation
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
        
        // Success!
        ollamaConnected = true; // Set global flag
        
        statusDiv.className = 'p-3 rounded-lg text-sm bg-green-500/10 border border-green-500/30';
        statusDiv.innerHTML = `
            <div class="flex items-start gap-2">
                <i class="fas fa-check-circle text-green-400 mt-0.5"></i>
                <div class="flex-1">
                    <p class="text-green-400 font-semibold">Connection Successful!</p>
                    <p class="text-gray-400 text-xs mt-1">Model: ${model}</p>
                    <p class="text-gray-400 text-xs mt-1">Response: ${data.response?.substring(0, 30)}...</p>
                    <p class="text-gray-400 text-xs mt-1">Available: ${availableModels.slice(0, 3).join(', ')}</p>
                    <p class="text-cyan-400 text-xs mt-2 font-semibold"><i class="fas fa-info-circle mr-1"></i>You can now start the demo or go live!</p>
                </div>
            </div>
        `;
        showToast('Connection successful!', 'success');
        
        // Remove warning if it exists
        const warning = document.getElementById('ollama-warning');
        if (warning) warning.remove();
        
        // Start demo if not already started
        if (!callActive && !liveMode) {
            setTimeout(() => {
                callActive = true;
                simulateCall();
            }, 1000);
        }
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

// Hold/Resume functionality
function toggleHoldResume() {
    const btn = document.getElementById('hold-resume-btn');
    const icon = document.getElementById('hold-resume-icon');
    const text = document.getElementById('hold-resume-text');
    
    callPaused = !callPaused;
    
    if (callPaused) {
        // Switch to Resume state
        icon.className = 'fas fa-play text-xs';
        text.textContent = 'Resume';
        btn.className = 'px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 font-semibold rounded text-sm transition flex items-center gap-2 border border-green-500/30';
    } else {
        // Switch back to Hold state
        icon.className = 'fas fa-pause text-xs';
        text.textContent = 'Hold';
        btn.className = 'px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 font-semibold rounded text-sm transition flex items-center gap-2 border border-yellow-500/30';
    }
}

// Make functions available globally
window.usePhraseClicked = usePhraseClicked;
window.toggleTheme = toggleTheme;
window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.saveSettings = saveSettings;
window.testOllamaConnection = testOllamaConnection;
window.toggleHoldResume = toggleHoldResume;
window.toggleMode = toggleMode;
