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
let isPaused = false; // Track if session is paused
let isAgentThinking = false; // Track if agent is generating response (prevents mic restart)
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

function updateQualityScore(quality) {
    if (typeof quality === 'number') {
        qualityScore.textContent = `${quality}%`;
    }
}

function updatePredictedCsat(csat) {
    if (typeof csat === 'number') {
        predictedCsat.textContent = csat.toFixed(1);
    }
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

// Capitalize first letter of each sentence
function capitalizeSentences(text) {
    // Split by sentence endings (. ! ?) and capitalize first letter
    return text.replace(/(^|[.!?]\s+)([a-z])/g, (match, separator, letter) => {
        return separator + letter.toUpperCase();
    });
}

function addTranscriptLine(speakerName, text, speakerType) {
    const isAgent = speakerType === 'agent';
    const avatar = isAgent ? 
        `<i class="fas fa-headset text-white text-xs"></i>` :
        `<span class="text-xs font-semibold">CU</span>`;
    const bgColor = isAgent ? 'from-blue-500 to-cyan-500' : 'from-yellow-500 to-orange-500';
    const textColor = isAgent ? 'text-blue-400' : 'text-yellow-400';
    
    // Capitalize first letter of each sentence
    const formattedText = capitalizeSentences(text);
    
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
                ${formattedText}
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
        
        isAgentThinking = true;
        
        if (recognition && isListening && !isPaused) {
            try {
                recognition.stop();
            } catch (e) {
                // Already stopped
            }
        }
        
        showAgentThinking();
        
        // Build context with company information
        let context = "You are a customer service agent for Amazon Customer Service.\n\n";
        context += "COMPANY CONTEXT:\n";
        context += "- Company: Amazon\n";
        context += "- Department: Customer Service - Package Support\n";
        context += "- Your role: Help customers with package delivery issues, tracking, returns, and refunds\n";
        context += "- Common issues: Delayed packages, lost packages, damaged items, wrong items delivered\n";
        context += "- You have access to: Order tracking, delivery status, refund processing, replacement orders\n\n";
        
        context += "CONVERSATION HISTORY:\n";
        
        const recentHistory = conversationHistory.slice(-6);
        recentHistory.forEach(msg => {
            context += `${msg.speaker === 'agent' ? 'Agent' : 'Customer'}: ${msg.text}\n`;
        });
        
        context += `\nRespond as an Amazon customer service agent. Be helpful, empathetic, and professional. Keep responses to 1-2 sentences.\n`;
        
        // IMPORTANT: Ask for customer name on first interaction ONLY if we don't have it
        const hasCustomerName = customerName.textContent !== 'Identifying';
        if (conversationHistory.length <= 2 && !hasCustomerName) {
            context += `CRITICAL: This is the customer's first message and you don't know their name yet. Ask for their name to personalize service. Example: "I'd be happy to help! May I have your name please?"\n`;
        } else if (hasCustomerName) {
            context += `NOTE: Customer's name is ${customerName.textContent}. Use their name when appropriate.\n`;
        }
        
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
        
        isAgentThinking = false;
        
        if (isListening && !isPaused) {
            animateSpectrum();
        }
        
        if (recognition && isListening && !isPaused) {
            setTimeout(() => {
                try {
                    recognition.start();
                } catch (e) {
                    // Already running
                }
            }, 500);
        }
        
    } catch (error) {
        console.error('Agent response failed:', error);
        removeAgentThinking();
        
        isAgentThinking = false;
        
        if (isListening && !isPaused) {
            animateSpectrum();
        }
        
        if (recognition && isListening && !isPaused) {
            setTimeout(() => {
                try {
                    recognition.start();
                } catch (e) {
                    // Already running
                }
            }, 500);
        }
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
        
        let context = "You are an AI call center quality analyst. Analyze CUSTOMER emotions and AGENT performance.\n\n";
        context += "RECENT CONVERSATION:\n";
        
        const recentHistory = conversationHistory.slice(-4);
        recentHistory.forEach(msg => {
            context += `${msg.speaker === 'agent' ? agentName : customerName}: ${msg.text}\n`;
        });
        
        context += `\n🚨 CUSTOMER JUST SAID: "${customerMessage}"\n\n`;
        context += `🎯 ANALYZE THE MESSAGE ABOVE:\n`;
        
        // Simple keyword detection to guide AI
        const lowerMsg = customerMessage.toLowerCase();
        if (lowerMsg.includes('happy') || lowerMsg.includes('great') || lowerMsg.includes('good') || lowerMsg.includes('satisfied')) {
            context += `⚠️ CUSTOMER SAID THEY ARE HAPPY! Use HIGH scores:\n`;
            context += `- empathy: 8.0-9.5\n`;
            context += `- sentiment: 0.75-0.95\n`;
            context += `- stress: "Low"\n`;
            context += `- clarity: "Good"\n`;
            context += `- quality: 75-90\n`;
            context += `- predicted_csat: 7.5-9.5\n\n`;
        } else if (lowerMsg.includes('angry') || lowerMsg.includes('mad') || lowerMsg.includes('furious') || lowerMsg.includes('pissed')) {
            context += `⚠️ CUSTOMER SAID THEY ARE ANGRY! Use LOW scores:\n`;
            context += `- empathy: 1.0-2.0\n`;
            context += `- sentiment: 0.0-0.15\n`;
            context += `- stress: "High"\n`;
            context += `- clarity: "Poor"\n`;
            context += `- quality: 10-25\n`;
            context += `- predicted_csat: 0.5-2.0\n\n`;
        } else if (lowerMsg.includes('frustrated') || lowerMsg.includes('annoyed') || lowerMsg.includes('upset')) {
            context += `⚠️ CUSTOMER SAID THEY ARE FRUSTRATED! Use MEDIUM-LOW scores:\n`;
            context += `- empathy: 2.5-4.0\n`;
            context += `- sentiment: 0.2-0.4\n`;
            context += `- stress: "High"\n`;
            context += `- clarity: "Fair"\n`;
            context += `- quality: 25-45\n`;
            context += `- predicted_csat: 2.5-4.0\n\n`;
        } else {
            context += `Customer seems neutral. Use MEDIUM scores:\n`;
            context += `- empathy: 5.0-6.0\n`;
            context += `- sentiment: 0.45-0.60\n`;
            context += `- stress: "Medium"\n`;
            context += `- clarity: "Fair"\n`;
            context += `- quality: 50-70\n`;
            context += `- predicted_csat: 5.0-6.5\n\n`;
        }
        
        // Extract name if present
        const namePatterns = [/my name is (\w+)/i, /i'm (\w+)/i, /this is (\w+)/i, /i am (\w+)/i];
        let detectedName = null;
        for (const pattern of namePatterns) {
            const match = customerMessage.match(pattern);
            if (match && match[1] && match[1].length > 1) {
                detectedName = match[1];
                break;
            }
        }
        if (detectedName) {
            context += `🔔 CUSTOMER NAME DETECTED: "${detectedName}" - Set customer_name to this!\n\n`;
        }
        
        context += `Return ONLY this EXACT JSON format:\n`;
        context += `{\n`;
        context += `  "coaching": {\n`;
        context += `    "type": "de-escalation|empathy|action|transparency|resolution|knowledge",\n`;
        context += `    "title": "Brief title (max 40 chars)",\n`;
        context += `    "message": "Short advice (max 120 chars)",\n`;
        context += `    "phrase": "Suggested response (max 80 chars) or null",\n`;
        context += `    "priority": 1-3\n`;
        context += `  },\n`;
        context += `  "metrics": {\n`;
        context += `    "empathy": 1.0-10.0,\n`;
        context += `    "sentiment": 0.0-1.0,\n`;
        context += `    "stress": "High|Medium|Low",\n`;
        context += `    "clarity": "Poor|Fair|Good",\n`;
        context += `    "quality": 40-95,\n`;
        context += `    "predicted_csat": 1.0-10.0,\n`;
        context += `    "status": "Open|Investigating|Ongoing|Resolving|Resolved",\n`;
        context += `    "issue": ${customerIssueFixed ? '"KEEP_UNCHANGED"' : '"Brief issue description (max 30 chars) or null"'},\n`;
        context += `    "customer_name": "Extract if customer says their name, otherwise null",\n`;
        context += `    "tags": ["Max 3 or empty array"]\n`;
        context += `  }\n`;
        context += `}\n\n`;
        
        context += `🎯 CRITICAL RULES FOR METRICS:\n\n`;
        
        context += `1. SENTIMENT (0.0-1.0): Customer's emotion\n`;
        context += `   - Angry/frustrated/upset → 0.0-0.3\n`;
        context += `   - Neutral/okay/calm → 0.4-0.6\n`;
        context += `   - Happy/satisfied/great mood → 0.7-1.0\n\n`;
        
        context += `2. STRESS:\n`;
        context += `   - High: Angry, urgent, repeating\n`;
        context += `   - Medium: Concerned, worried\n`;
        context += `   - Low: Calm, patient, happy\n\n`;
        
        context += `3. EMPATHY (1.0-10.0): Customer happiness level\n`;
        context += `   - Angry/furious → 1.0-2.0\n`;
        context += `   - Frustrated → 2.0-4.0\n`;
        context += `   - Neutral/calm → 5.0-6.0\n`;
        context += `   - Happy/satisfied → 7.0-8.0\n`;
        context += `   - Very happy/great mood → 8.0-10.0\n\n`;
        
        context += `4. QUALITY (10-100): Call quality\n`;
        context += `   - Customer angry → 10-30\n`;
        context += `   - Customer frustrated → 30-50\n`;
        context += `   - Customer neutral → 50-70\n`;
        context += `   - Customer happy → 70-85\n`;
        context += `   - Customer very happy → 85-100\n\n`;
        
        context += `5. PREDICTED CSAT (0.0-10.0): Customer satisfaction\n`;
        context += `   - Match the customer's mood to score\n`;
        context += `   - Angry → 0-2, Frustrated → 2-4, Neutral → 5-6, Happy → 7-8, Very happy → 8-10\n\n`;
        
        context += `6. STATUS: Open → Investigating → Ongoing → Resolving → Resolved\n\n`;
        
        context += `7. ISSUE: Extract the actual problem (not emotion)\n`;
        context += `   - "My bag is missing" → "Missing bag"\n`;
        context += `   - "Package delayed" → "Package delayed"\n`;
        context += `   - No problem mentioned → null\n`;
        context += `   - Already set → "KEEP_UNCHANGED"\n\n`;
        
        context += `8. CUSTOMER NAME: Extract if they say their name, otherwise null\n\n`;
        context += `9. TAGS: Only if explicitly mentioned, otherwise []\n\n`;
        
        context += `⚠️ EXAMPLES:\n`;
        context += `"I'm angry" → empathy: 1.5, quality: 15, predicted_csat: 1.5\n`;
        context += `"I'm happy" → empathy: 8.0, quality: 80, predicted_csat: 8.0\n`;
        context += `"I'm in a great mood" → empathy: 9.0, quality: 90, predicted_csat: 9.0\n\n`;
        
        context += `Return ONLY valid JSON. NO explanations. NO text outside JSON.`;
        
        const response = await fetch(`${ollamaUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model,
                prompt: context,
                stream: false,
                options: {
                    temperature: 0.5,  // Lower temperature for more consistent scoring
                    top_p: 0.9,
                    num_predict: 300   // More tokens for detailed analysis
                }
            })
        });
        
        const data = await response.json();
        
        const loading = document.getElementById('ai-loading');
        if (loading) loading.remove();
        
        // DEBUG: Log AI response to see what's actually being returned
        console.log('🔍 AI RAW RESPONSE:', data.response);
        
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
                // Fallback - show plain text but clean it up
                const cleanText = responseText
                    .replace(/```json/g, '')
                    .replace(/```/g, '')
                    .replace(/\{[\s\S]*\}/g, '') // Remove any JSON remnants
                    .trim();
                
                if (cleanText && cleanText.length > 10) {
                    coaching = {
                        type: 'empathy',
                        title: 'AI Suggestion',
                        message: cleanText.substring(0, 120),
                        phrase: null,
                        priority: 2
                    };
                } else {
                    // Skip if no useful content
                    coaching = null;
                }
            }
            
            if (aiAnalysis && aiAnalysis.metrics) {
                const metrics = aiAnalysis.metrics;
                
                // DEBUG: Log parsed metrics
                console.log('📊 PARSED METRICS:', {
                    empathy: metrics.empathy,
                    sentiment: metrics.sentiment,
                    stress: metrics.stress,
                    quality: metrics.quality,
                    csat: metrics.predicted_csat,
                    name: metrics.customer_name,
                    issue: metrics.issue
                });
                
                if (typeof metrics.empathy === 'number') {
                    updateEmpathyScore(Math.max(0, Math.min(10, metrics.empathy)));
                }
                
                // Quality score from AI (NOT calculated)
                if (typeof metrics.quality === 'number') {
                    updateQualityScore(Math.max(0, Math.min(100, metrics.quality)));
                }
                
                // Predicted CSAT from AI (NOT calculated)
                if (typeof metrics.predicted_csat === 'number') {
                    updatePredictedCsat(Math.max(0, Math.min(10, metrics.predicted_csat)));
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
                
                // STATUS: Always start at "Open" on first message, then update based on AI
                if (metrics.status) {
                    const validStatuses = ['Open', 'Investigating', 'Ongoing', 'Resolving', 'Resolved'];
                    if (validStatuses.includes(metrics.status)) {
                        // Set status to "Open" on first customer message if not already set
                        if (statusUpdateCount === 0 && customerHasSpoken && customerStatus.textContent === 'N/A') {
                            customerStatus.textContent = 'Open';
                            customerStatus.className = 'font-semibold text-red-400';
                            statusUpdateCount++;
                        } else if (statusUpdateCount < 10) { // Allow more status updates to track progression
                            customerStatus.textContent = metrics.status;
                            customerStatus.className = 'font-semibold ' + 
                                (metrics.status === 'Resolved' ? 'text-green-400' : 
                                 metrics.status === 'Open' ? 'text-red-400' : 'text-yellow-400');
                            statusUpdateCount++;
                        }
                    }
                }
                
                const customerInfo = {};
                
                // NAME: Extract customer name if provided
                if (metrics.customer_name && typeof metrics.customer_name === 'string') {
                    const name = metrics.customer_name.trim();
                    if (name.length > 0 && name.length < 30) {
                        customerInfo.name = name;
                        const nameParts = name.split(' ');
                        customerInfo.initials = nameParts.map(part => part.charAt(0).toUpperCase()).join('').substring(0, 2);
                    }
                }
                
                // ISSUE: Only set once when customer describes actual problem (not emotion)
                if (!customerIssueFixed && metrics.issue && metrics.issue !== 'KEEP_UNCHANGED' && metrics.issue !== null && metrics.issue !== 'null') {
                    const emotionWords = ['angry', 'frustrated', 'upset', 'happy', 'satisfied', 'annoyed', 'mad', 'furious'];
                    const isEmotion = emotionWords.some(word => metrics.issue.toLowerCase().includes(word));
                    
                    if (!isEmotion) {
                        customerInfo.issue = metrics.issue.substring(0, 30);
                        customerIssueFixed = true;
                    }
                }
                if (metrics.tags && Array.isArray(metrics.tags)) {
                    customerInfo.tags = metrics.tags.slice(0, 4);
                }
                if (Object.keys(customerInfo).length > 0) {
                    updateCustomerInfo(customerInfo);
                }
            }
            
            if (coaching) {
                addCoachingCard(coaching, true);
            }
            
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
    recognition.maxAlternatives = 1;
    
    // Increase pause tolerance - wait longer before finalizing
    // Note: These are browser-dependent, but we can configure what we can
    if ('webkitSpeechRecognition' in window) {
        // For Chrome/Edge - allow longer pauses (not standard, but helps)
        recognition.continuous = true; // Keep listening even after pauses
    }
    
    recognition.onresult = (event) => {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;
        
        if (result.isFinal) {
            const capitalizedTranscript = transcript.charAt(0).toUpperCase() + transcript.slice(1);
            addTranscriptLine('Customer', capitalizedTranscript, 'customer');
            
            conversationHistory.push({
                speaker: 'customer',
                name: 'Customer',
                text: capitalizedTranscript
            });
            
            customerHasSpoken = true;
            
            // Only process if not paused
            if (!isPaused) {
                // Trigger AI analysis for metrics
                setTimeout(() => {
                    analyzeCustomerMessage(capitalizedTranscript, 'Customer', 'Amazon Agent');
                }, 500);
                
                // AI agent responds
                setTimeout(() => {
                    getAgentResponse(capitalizedTranscript);
                }, 1500);
            }
        }
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
    };
    
    recognition.onend = () => {
        if (isListening && !isPaused && !isAgentThinking) {
            try {
                recognition.start();
            } catch (e) {
                // Could not restart
            }
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
    // Stop animation if not listening, paused, or agent thinking
    if (!analyser || !isListening || isPaused || isAgentThinking) {
        const bars = document.querySelectorAll('.spectrum-bar');
        bars.forEach(bar => {
            bar.style.height = '0%'; // Reset to zero when not active
        });
        return;
    }
    
    analyser.getByteFrequencyData(dataArray);
    
    const bars = document.querySelectorAll('.spectrum-bar');
    bars.forEach((bar, index) => {
        const value = dataArray[Math.floor(index * dataArray.length / bars.length)] || 0;
        const height = (value / 255) * 100;
        bar.style.height = `${Math.max(0, height)}%`; // Allow bars to go to zero
    });
    
    if (isListening) {
        animationFrameId = requestAnimationFrame(animateSpectrum);
    }
}

// Start/Stop live session
function toggleLiveSession() {
    isListening = !isListening;
    isPaused = false; // Reset pause state
    
    const modeIndicator = document.getElementById('mode-indicator');
    const startStopBtn = document.getElementById('start-stop-btn');
    const startStopIcon = document.getElementById('start-stop-icon');
    const startStopText = document.getElementById('start-stop-text');
    const pauseResumeBtn = document.getElementById('pause-resume-btn');
    
    if (isListening) {
        // Start live session
        
        // Clear all previous data
        clearDemoData();
        conversationHistory = [];
        customerIssueFixed = false;
        statusUpdateCount = 0;
        customerHasSpoken = false;
        transcriptMessages.innerHTML = ''; // Clear transcript
        
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
                
                // Update start/stop button
                startStopIcon.className = 'fas fa-stop text-base';
                startStopText.textContent = 'Stop Session';
                startStopBtn.className = 'px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg text-sm transition flex items-center gap-2 shadow-lg';
                
                // Show pause button
                pauseResumeBtn.classList.remove('hidden');
                
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
            animationFrameId = null;
        }
        
        // Stop spectrum animation
        animateSpectrum(); // Call once to reset bars
        
        callStartTime = null;
        
        modeIndicator.innerHTML = `
            <div class="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
            <span class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Stopped</span>
        `;
        modeIndicator.className = 'flex items-center gap-2 px-2 py-1 bg-gray-500/10 border border-gray-500/30 rounded-full';
        
        // Update start/stop button
        startStopIcon.className = 'fas fa-microphone text-base';
        startStopText.textContent = 'Start Session';
        startStopBtn.className = 'px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg text-sm transition flex items-center gap-2 shadow-lg';
        
        // Hide pause button
        pauseResumeBtn.classList.add('hidden');
        
        showToast('Live session stopped', 'success');
    }
}

// Pause/Resume functionality
function togglePause() {
    isPaused = !isPaused;
    
    const pauseResumeBtn = document.getElementById('pause-resume-btn');
    const pauseResumeIcon = document.getElementById('pause-resume-icon');
    const pauseResumeText = document.getElementById('pause-resume-text');
    const modeIndicator = document.getElementById('mode-indicator');
    
    if (isPaused) {
        if (recognition) {
            try {
                recognition.stop();
            } catch (e) {
                // Already stopped
            }
        }
        
        // Update pause button to resume
        pauseResumeIcon.className = 'fas fa-play text-base';
        pauseResumeText.textContent = 'Resume';
        pauseResumeBtn.className = 'px-6 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 font-semibold rounded-lg text-sm transition flex items-center gap-2 border border-green-500/30';
        
        // Update indicator
        modeIndicator.innerHTML = `
            <div class="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
            <span class="text-xs font-semibold text-yellow-400 uppercase tracking-wide">Paused</span>
        `;
        modeIndicator.className = 'flex items-center gap-2 px-2 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full';
        
        showToast('Session paused', 'success');
    } else {
        if (recognition && isListening && !isAgentThinking) {
            try {
                recognition.start();
            } catch (e) {
                // Already started
            }
        }
        
        // Update pause button back to pause
        pauseResumeIcon.className = 'fas fa-pause text-base';
        pauseResumeText.textContent = 'Pause';
        pauseResumeBtn.className = 'px-6 py-3 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 font-semibold rounded-lg text-sm transition flex items-center gap-2 border border-yellow-500/30';
        
        // Update indicator back to live
        modeIndicator.innerHTML = `
            <div class="w-1.5 h-1.5 bg-red-500 rounded-full live-pulse"></div>
            <span class="text-xs font-semibold text-red-400 uppercase tracking-wide">Live</span>
        `;
        modeIndicator.className = 'flex items-center gap-2 px-2 py-1 bg-red-500/10 border border-red-500/30 rounded-full';
        
        showToast('Session resumed', 'success');
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

// Clear any demo customer info on load
function clearDemoData() {
    customerName.textContent = 'Identifying...';
    customerName.className = 'font-medium text-sm text-gray-500';
    customerInitials.textContent = '?';
    customerTier.textContent = 'N/A';
    customerStatus.textContent = 'N/A';
    customerIssue.textContent = 'N/A';
    customerTags.innerHTML = ''; // Clear all tags
    sentimentLabel.textContent = 'N/A';
    sentimentLabel.className = 'font-semibold text-gray-500';
    stressLabel.textContent = 'N/A';
    stressLabel.className = 'font-semibold text-gray-500';
    clarityLabel.textContent = 'N/A';
    clarityLabel.className = 'font-semibold text-gray-500';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Clear all demo data
    clearDemoData();
    
    // Initialize metrics
    empathyScore.textContent = '--';
    qualityScore.textContent = '--';
    predictedCsat.textContent = '--';
    callTime.textContent = '00:00';
    
    // Stop spectrum bars initially (set to minimum height)
    const bars = document.querySelectorAll('.spectrum-bar');
    bars.forEach(bar => {
        bar.style.height = '10%';
        bar.style.animation = 'none'; // Stop CSS animation
    });
    
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
window.togglePause = togglePause;
