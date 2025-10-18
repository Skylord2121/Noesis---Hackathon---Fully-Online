// Live Demo Script - Realistic call simulation with Laura & Maya

const conversation = [
    {
        time: 2,
        speaker: 'agent',
        name: 'Maya',
        text: 'Thank you for calling BrightWave Internet Support. This is Maya. How can I help you today?',
        sentiment: 0.5,
        empathy: 3.2,
        stress: null,
        clarity: null,
        coaching: null
    },
    {
        time: 8,
        speaker: 'customer',
        name: 'Laura',
        text: "Honestly, I'm really upset right now. My internet's been cutting out every few minutes for the last three days, and this is the third time I'm calling! Nobody's fixing it.",
        highlights: ['upset', "cutting out", "third time", "Nobody's fixing"],
        sentiment: 0.05,
        empathy: 3.2,
        stress: 'High',
        clarity: 'Poor',
        customerInfo: {
            name: 'Laura Chen',
            initials: 'LC',
            issue: 'Internet Outage',
            tags: ['3rd Call']
        },
        coaching: {
            type: 'de-escalation',
            title: 'De-escalation Needed',
            message: 'Customer is expressing frustration about repeat contact. Acknowledge their patience and validate their concern.',
            phrase: "I hear how frustrating this must be, Laura. Let me take ownership of this right now and make sure we resolve it today.",
            priority: 1
        }
    },
    {
        time: 16,
        speaker: 'agent',
        name: 'Maya',
        text: "I'm sorry you've had to deal with that, Laura. I can hear the frustration in your voice. Let's take a minute to sort this out together.",
        sentiment: 0.15,
        empathy: 5.8,
        stress: 'High',
        clarity: 'Fair',
        coaching: null
    },
    {
        time: 24,
        speaker: 'customer',
        name: 'Laura',
        text: "It's just so annoying! I work from home. Every time it drops, I lose connection in meetings. Last agent said it'd be fine by yesterday—still nothing!",
        highlights: ['annoying', 'work from home', 'lose connection', 'still nothing'],
        sentiment: 0.12,
        empathy: 5.8,
        stress: 'High',
        clarity: 'Fair',
        customerInfo: {
            tags: ['Work From Home']
        },
        coaching: {
            type: 'empathy',
            title: 'Show Understanding',
            message: 'Customer is explaining impact on work. Demonstrate you understand the business consequence.',
            phrase: "I completely understand - losing connection during work meetings is not acceptable. Let me look into this immediately.",
            priority: 2
        }
    },
    {
        time: 33,
        speaker: 'agent',
        name: 'Maya',
        text: "Totally understandable. Let's pull up your connection details and see what's happening right now.",
        sentiment: 0.25,
        empathy: 6.9,
        stress: 'Medium',
        clarity: 'Good',
        clarity: 'Good',
        customerInfo: {
            tier: 'Premium • 2.3yr',
            tags: ['Premium']
        },
        coaching: {
            type: 'action',
            title: 'Taking Action',
            message: 'Good - moving to problem-solving while maintaining empathy.',
            phrase: null,
            priority: 3
        }
    },
    {
        time: 39,
        speaker: 'agent',
        name: 'Maya',
        text: "Alright, I see a service alert in your area. It looks like one router node has been unstable since Monday.",
        sentiment: 0.35,
        empathy: 7.2,
        stress: 'Medium',
        clarity: 'Good',
        coaching: null
    },
    {
        time: 46,
        speaker: 'customer',
        name: 'Laura',
        text: "So that's why! But why couldn't anyone just tell me that before?",
        highlights: ["couldn't anyone tell me"],
        sentiment: 0.40,
        empathy: 7.2,
        stress: 'Medium',
        clarity: 'Good',
        coaching: {
            type: 'transparency',
            title: 'Build Trust',
            message: 'Customer wants transparency. Reference specific protocols to show systematic improvement.',
            phrase: "You're absolutely right. Let me explain our Service Impact Transparency Protocol and why this should have been communicated sooner.",
            priority: 1
        }
    },
    {
        time: 52,
        speaker: 'agent',
        name: 'Maya',
        text: "You're right. We should've been clearer. We actually have a \"Service Impact Transparency Protocol\" that guides us to notify customers when outages last more than 24 hours. It seems your case slipped through that process, and I'm really sorry for that.",
        sentiment: 0.55,
        empathy: 8.4,
        stress: 'Low',
        clarity: 'Good',
        coaching: null
    },
    {
        time: 64,
        speaker: 'customer',
        name: 'Laura',
        text: "Okay… I appreciate you saying that. So what now?",
        sentiment: 0.62,
        empathy: 8.4,
        stress: 'Low',
        clarity: 'Good',
        coaching: {
            type: 'resolution',
            title: 'Clear Next Steps',
            message: 'Customer is ready to move forward. Provide specific timeline and compensate for inconvenience.',
            phrase: "I'm opening a priority ticket right now and will also credit your account for the downtime.",
            priority: 2
        }
    },
    {
        time: 69,
        speaker: 'agent',
        name: 'Maya',
        text: "I've just opened a priority ticket linked to your account. The repair crew is scheduled for tonight, and based on our protocol, your connection should stabilize within 12 hours. I'll also credit your account for the downtime.",
        sentiment: 0.75,
        empathy: 9.1,
        stress: 'Low',
        clarity: 'Good',
        coaching: null
    },
    {
        time: 80,
        speaker: 'customer',
        name: 'Laura',
        text: "Wow, thank you. I wish every agent handled it like this.",
        sentiment: 0.85,
        empathy: 9.1,
        stress: 'Low',
        clarity: 'Good',
        coaching: {
            type: 'knowledge',
            title: 'Document Success',
            message: 'Excellent resolution. Customer expressing satisfaction with handling.',
            phrase: null,
            priority: 3
        }
    },
    {
        time: 86,
        speaker: 'agent',
        name: 'Maya',
        text: "That means a lot, Laura. I'll stay on the line for a moment while I confirm the credit. You'll get an email summary following our Quality Care Guide—it lists the steps and your ticket number so you can track it easily.",
        sentiment: 0.90,
        empathy: 9.3,
        stress: 'Low',
        clarity: 'Good',
        coaching: null
    },
    {
        time: 98,
        speaker: 'customer',
        name: 'Laura',
        text: "That's perfect. Thanks for your patience. I feel better now.",
        sentiment: 0.92,
        empathy: 9.3,
        stress: 'Low',
        clarity: 'Good',
        coaching: null
    },
    {
        time: 103,
        speaker: 'agent',
        name: 'Maya',
        text: "You're very welcome. I'm glad we got this sorted out. Is there anything else I can help you with before we close?",
        sentiment: 0.95,
        empathy: 9.5,
        stress: 'Low',
        clarity: 'Good',
        coaching: null
    },
    {
        time: 110,
        speaker: 'customer',
        name: 'Laura',
        text: "No, that's all. Have a good day, Maya.",
        sentiment: 0.95,
        empathy: 9.5,
        stress: 'Low',
        clarity: 'Good',
        coaching: null
    },
    {
        time: 113,
        speaker: 'agent',
        name: 'Maya',
        text: "You too, Laura—and thanks for giving us the chance to fix this.",
        sentiment: 0.98,
        empathy: 9.6,
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
    // Update quality score based on empathy (realistic range 60-92%)
    const quality = Math.min(92, Math.max(60, Math.round(empathy * 8 + 20)));
    qualityScore.textContent = `${quality}%`;
    
    // Update predicted CSAT (realistic range 3.5-9.2)
    const csat = Math.min(9.2, Math.max(3.5, (empathy * 0.85 + 1.5))).toFixed(1);
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
    // Remove old cards if priority is 1
    if (coaching.priority === 1) {
        const oldCards = coachingContainer.querySelectorAll('.coaching-card');
        oldCards.forEach(card => {
            card.classList.add('fade-out');
            setTimeout(() => card.remove(), 300);
        });
    }
    
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
        context += `    "empathy": 3.0-9.5 (realistic decimal, avoid 10),\n`;
        context += `    "sentiment": 0.0-1.0 (0=very upset, 0.5=neutral, 1.0=happy),\n`;
        context += `    "stress": "High|Medium|Low",\n`;
        context += `    "clarity": "Poor|Fair|Good",\n`;
        context += `    "issue": "Brief issue (max 25 chars)",\n`;
        context += `    "tags": ["Short Tag", "2-3 Words Max"] (max 4 tags about CUSTOMER only: account type, issue type, behavior - NOT agent performance)\n`;
        context += `  }\n`;
        context += `}\n\n`;
        context += `Examples of GOOD tags: "3rd Call", "Work From Home", "Premium Account", "Frustrated", "Technical Issue"\n`;
        context += `Examples of BAD tags: "High CSAT", "Agent Performance", "Good Service" (these are about agent, not customer)\n`;
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
                
                // Update customer info (issue and tags)
                const customerInfo = {};
                if (metrics.issue) {
                    customerInfo.issue = metrics.issue.substring(0, 30);
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
            
            // Update sentiment and empathy
            updateSentimentUI(item.sentiment);
            updateEmpathyScore(item.empathy);
            updateStressLevel(item.stress);
            updateClarity(item.clarity);
            updateMetrics(item.empathy);
            
            // Add coaching if present (original mock coaching)
            if (item.coaching) {
                setTimeout(() => addCoachingCard(item.coaching, false), 800);
            }
            
            // NEW: If customer (Laura) spoke, call AI for real-time analysis
            if (item.speaker === 'customer') {
                setTimeout(() => {
                    analyzeCustomerMessage(item.text, item.name, 'Maya');
                }, 1500); // Delay slightly so AI response comes after mock coaching
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

// Start simulation on page load
document.addEventListener('DOMContentLoaded', () => {
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
    
    // Start after a brief delay
    setTimeout(() => {
        simulateCall();
    }, 1000);
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

function saveSettings() {
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
    
    showToast('Settings saved successfully!', 'success');
    
    setTimeout(() => {
        closeSettings();
    }, 1000);
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
        statusDiv.className = 'p-3 rounded-lg text-sm bg-green-500/10 border border-green-500/30';
        statusDiv.innerHTML = `
            <div class="flex items-start gap-2">
                <i class="fas fa-check-circle text-green-400 mt-0.5"></i>
                <div class="flex-1">
                    <p class="text-green-400 font-semibold">Connection Successful!</p>
                    <p class="text-gray-400 text-xs mt-1">Model: ${model}</p>
                    <p class="text-gray-400 text-xs mt-1">Response: ${data.response?.substring(0, 30)}...</p>
                    <p class="text-gray-400 text-xs mt-1">Available: ${availableModels.slice(0, 3).join(', ')}</p>
                </div>
            </div>
        `;
        showToast('Connection successful!', 'success');
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
