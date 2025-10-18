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

// DOM elements
const transcriptMessages = document.getElementById('transcript-messages');
const transcriptContainer = document.getElementById('transcript-container');
const coachingContainer = document.getElementById('coaching-container');
const empathyScore = document.getElementById('empathy-score');
const callTime = document.getElementById('call-time');
const sentimentLabel = document.getElementById('sentiment-label');
const stressLabel = document.getElementById('stress-label');
const sentimentIndicator = document.getElementById('sentiment-indicator');
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
    const position = sentiment * 100;
    sentimentIndicator.style.left = `${position}%`;
    
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
    const quality = Math.min(99, Math.round(empathy * 10 + 5));
    qualityScore.textContent = `${quality}%`;
    
    // Update predicted CSAT
    const csat = Math.min(10, (empathy * 0.9 + 1).toFixed(1));
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

function addCoachingCard(coaching) {
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
            
            // Add coaching if present
            if (item.coaching) {
                setTimeout(() => addCoachingCard(item.coaching), 800);
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

// Start simulation on page load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize metrics
    qualityScore.textContent = '--';
    predictedCsat.textContent = '--';
    
    // Start after a brief delay
    setTimeout(() => {
        simulateCall();
    }, 1000);
});

// Make usePhraseClicked available globally
window.usePhraseClicked = usePhraseClicked;
