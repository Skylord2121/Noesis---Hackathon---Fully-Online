# Documentation Management Feature

## Overview
The Noesis platform now includes a built-in documentation management system that allows you to add, edit, and delete company knowledge documents directly from the Settings page. The AI automatically references all documentation during coaching analysis.

## How to Access

1. Open the agent dashboard: `/static/agent.html`
2. Click **Settings** button (top right)
3. In the **Company Knowledge** section, click **Manage** button
4. The Documentation Manager will open

## Features

### 📄 Add New Document
- Click **"Add New Document"** button
- Fill in:
  - **Title**: Document name (e.g., "Refund Policy")
  - **Category**: Select from predefined categories
    - Policy
    - Procedures
    - Technical
    - Scripts
    - Billing
    - Other
  - **Content**: Full document text
- Click **Save Document**

### ✏️ Edit Document
- Click the blue **Edit** icon on any document
- Modify title, category, or content
- Click **Update Document**

### 🗑️ Delete Document
- Click the red **Delete** icon on any document
- Confirm deletion
- Document is removed immediately

### 👁️ View All Documents
- Click **View** button to see read-only view of all documents
- Includes:
  - Policy documents
  - Quick references
  - Recommended phrases
  - Forbidden phrases

## AI Integration

### How AI Uses Documentation

The AI coaching system automatically references all company knowledge documents when:
1. Analyzing customer sentiment
2. Generating coaching suggestions
3. Recommending phrases to use
4. Identifying policy violations

### Example AI Coaching with Documentation

**Customer says**: "I want a refund for my order from last month"

**AI References**:
- Refund Policy document
- Determines: 31-60 days = 50% partial refund eligible
- Coaching: "Customer may be eligible for partial refund. Review account and offer 50% refund per policy."

**Customer says**: "This is ridiculous, you guys are scammers!"

**AI References**:
- Escalation Procedures document
- Forbidden phrases list (avoids "There's nothing I can do")
- Coaching: "Customer is escalating. Use empathy phrase: 'I understand your frustration.' Consider supervisor transfer."

## Important Notes

### ⚠️ Session-Only Changes
- **Changes are TEMPORARY** (runtime only)
- Documents persist only while the service is running
- Restarting PM2 or rebuilding will reset to `company-knowledge.json`

### 💾 Permanent Changes
To make documentation changes permanent:
1. Edit: `/home/user/webapp/config/company-knowledge.json`
2. Rebuild: `npm run build`
3. Restart: `pm2 restart webapp`

### 🔄 Migration Path
For production deployment:
1. Test changes using the Management UI (temporary)
2. Once satisfied, manually update `company-knowledge.json`
3. Commit to git repository
4. Deploy to production

## Document Structure

### Document Format
```json
{
  "document_key": {
    "title": "Document Title",
    "category": "policy",
    "content": "Full document content here..."
  }
}
```

### Categories
- **policy**: Company policies (refunds, returns, etc.)
- **procedures**: Step-by-step procedures (escalation, troubleshooting)
- **technical**: Technical guides (password reset, account setup)
- **scripts**: Call scripts and templates
- **billing**: Billing-related information
- **other**: Miscellaneous documentation

## Best Practices

### Writing Effective Documentation

1. **Be Specific**: Include exact steps and conditions
2. **Use Examples**: Show real scenarios
3. **Stay Current**: Update regularly
4. **Use Clear Language**: Avoid jargon
5. **Include Exceptions**: Note special cases

### Good Example
```
REFUND POLICY:

1. FULL REFUNDS (100%):
   - Within 30 days of purchase
   - Product defect or service failure
   
2. PARTIAL REFUNDS (50%):
   - 31-60 days after purchase
   
3. PROCESS:
   - Verify purchase date
   - Check refund eligibility
   - Process within 5-7 business days
```

### Poor Example
```
We have a refund policy. Ask your supervisor.
```

## API Endpoints

### Get All Documents
```
GET /api/company-knowledge
Response: { success: true, knowledge: {...} }
```

### Add Document
```
POST /api/company-knowledge/add
Body: { 
  key: "document_key",
  document: { title, category, content }
}
```

### Update Document
```
POST /api/company-knowledge/update
Body: { 
  key: "document_key",
  document: { title, category, content }
}
```

### Delete Document
```
POST /api/company-knowledge/delete
Body: { key: "document_key" }
```

## Troubleshooting

### Document Not Saving
- Check browser console for errors
- Ensure title and content are not empty
- Verify network connection

### AI Not Using New Documentation
- AI reads from in-memory knowledge immediately
- No rebuild needed for runtime changes
- Check if document content is clear and specific

### Changes Lost After Restart
- This is expected behavior for runtime changes
- Update `company-knowledge.json` for persistence

## Future Enhancements

Potential improvements for future versions:
- [ ] Persistent storage (database or file system)
- [ ] Document versioning and history
- [ ] Import/export functionality
- [ ] Bulk upload from CSV/Excel
- [ ] Document search and filtering
- [ ] Usage analytics (which docs AI references most)
- [ ] Template library for common document types
