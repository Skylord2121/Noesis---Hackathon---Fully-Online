# How to Update Company Documents

## 📍 Location
Your company knowledge is stored in:
```
/home/user/webapp/config/company-knowledge.json
```

## 🎯 Quick Update Guide

### Option 1: Via Dashboard (View Only)
1. Open dashboard: https://3000-ib0z8zuo7krasmb055710-b237eb32.sandbox.novita.ai
2. Click **Settings** (gear icon)
3. Click **"View Knowledge Base"** button
4. Review all your current policies

### Option 2: Edit Directly (Recommended)
1. **Edit the file:**
   ```bash
   # Open the file in your text editor
   nano /home/user/webapp/config/company-knowledge.json
   # OR use any text editor you prefer
   ```

2. **Make your changes** (see format below)

3. **Save the file**

4. **Rebuild and restart:**
   ```bash
   cd /home/user/webapp
   npm run build
   pm2 restart webapp
   ```

5. **Done!** AI will now use your updated policies.

---

## 📝 File Format

The JSON file has these main sections:

### 1. **Documents** (Your Company Policies)
```json
"documents": {
  "policy_name": {
    "title": "Human-Readable Title",
    "category": "billing|technical|procedures|scripts",
    "content": "Your full policy text here..."
  }
}
```

### 2. **Quick References** (Fast Facts)
```json
"quick_references": {
  "business_hours": "Monday-Friday 9AM-6PM EST",
  "return_window": "30 days from delivery date"
}
```

### 3. **Recommended Phrases** (Use These)
```json
"recommended_phrases": [
  "Let me look into that for you",
  "I can help you with that"
]
```

### 4. **Forbidden Phrases** (Avoid These)
```json
"forbidden_phrases": [
  "I don't know",
  "That's not my department"
]
```

---

## ✏️ Example: Adding a New Policy

### Before:
```json
"documents": {
  "refund_policy": { ... },
  "password_reset": { ... }
}
```

### After (Added Shipping Policy):
```json
"documents": {
  "refund_policy": { ... },
  "password_reset": { ... },
  "shipping_policy": {
    "title": "Shipping Policy",
    "category": "procedures",
    "content": "SHIPPING POLICY:\n\n1. Standard Shipping:\n   - 5-7 business days\n   - Free for orders over $50\n\n2. Express Shipping:\n   - 2-3 business days\n   - $15.99 flat rate\n\n3. International:\n   - 10-14 business days\n   - Calculated at checkout"
  }
}
```

---

## ✏️ Example: Updating Existing Policy

### Find the policy you want to update:
```json
"refund_policy": {
  "title": "Refund Policy",
  "category": "billing",
  "content": "REFUND POLICY:\n\n1. FULL REFUNDS (100%):\n   - Within 30 days of purchase\n   ..."
}
```

### Change the content:
```json
"refund_policy": {
  "title": "Refund Policy",
  "category": "billing",
  "content": "REFUND POLICY (UPDATED 2025):\n\n1. FULL REFUNDS (100%):\n   - Within 60 days of purchase (EXTENDED!)\n   - Product defect or service failure\n   ..."
}
```

---

## 🔄 Update Frequency

**How often you update:** Once or twice per month (or whenever policies change)

**When to rebuild:**
- After adding new policies
- After updating existing policies
- After changing quick references or phrases

**What happens automatically:**
- AI reads your policies on every analysis
- Coaching suggestions reference your exact policies
- Agents see the most up-to-date information

---

## 🧪 Testing Your Updates

After rebuilding, test with these scenarios:

### Test Password Reset:
```bash
curl -X POST http://localhost:3000/api/ai-analysis \
  -H "Content-Type: application/json" \
  -d '{"text":"I forgot my password"}'
```
**Should reference:** Password reset procedure

### Test Refund Request:
```bash
curl -X POST http://localhost:3000/api/ai-analysis \
  -H "Content-Type: application/json" \
  -d '{"text":"I want a refund"}'
```
**Should reference:** Refund policy with timeframes

---

## 📋 What's Currently Loaded

**4 Documents:**
1. **Refund Policy** - Full/partial/no refunds based on timeframe
2. **Escalation Procedures** - When and how to escalate
3. **Password Reset Procedure** - Step-by-step verification and reset
4. **Call Opening Scripts** - Greetings for different scenarios

**5 Quick References:**
- Business hours
- Response times
- Supervisor availability
- Shipping times
- Return window

**6 Recommended Phrases** + **6 Forbidden Phrases**

---

## 🆘 Troubleshooting

### AI not using new policies?
1. Make sure you rebuilt: `npm run build`
2. Make sure you restarted: `pm2 restart webapp`
3. Check for JSON syntax errors (missing commas, brackets)

### JSON syntax errors?
- Use a JSON validator: https://jsonlint.com
- Common mistakes:
  - Missing comma between entries
  - Missing closing bracket `}`
  - Unescaped quotes inside strings (use `\"`)

### How to verify it's working?
1. Open dashboard settings
2. Click "View Knowledge Base"
3. Your new policies should appear
4. Document count should be updated

---

## 💡 Pro Tips

1. **Keep it concise:** AI works best with clear, structured policies (not paragraphs)
2. **Use line breaks:** Add `\n\n` for readability
3. **Categorize properly:** Use correct categories (billing, technical, procedures, scripts)
4. **Test after changes:** Always verify AI is referencing your updates
5. **Version your policies:** Include dates in titles/content for tracking

---

## 🔗 Quick Links

- **Dashboard:** https://3000-ib0z8zuo7krasmb055710-b237eb32.sandbox.novita.ai
- **Knowledge File:** `/home/user/webapp/config/company-knowledge.json`
- **GitHub Repo:** https://github.com/Skylord2121/Noesis---Oct-18

---

**Need help?** The AI coaching system automatically adapts to whatever you put in the knowledge base. Just keep the JSON format correct, and you're good to go! 🚀
