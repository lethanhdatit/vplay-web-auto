# 📋 Quick Reference Card

## 🚀 START HERE

```bash
npm install    # Install dependencies
npm start      # Start server on port 3000
# Open: http://localhost:3000
```

## 🎯 Main Features

| Feature | How to Use |
|---------|-----------|
| **Configure** | Set App ID, username, password, gift codes → Save |
| **Run All** | Click "▶ Run All Steps" → Monitor console |
| **Run Step** | Click specific step (1-4) → View output |
| **Manage Codes** | Add/remove codes → Reload default → Save |
| **Monitor** | Watch console for logs → Check outputs |
| **Debug** | Clear logs → Run step → Check errors |

## 📍 Workflow Steps

```
1. Get Auth Headers
   └─ Browser login, capture headers
   
2. Get Servers  
   └─ Fetch servers, extract highest sort
   
3. Get Characters
   └─ Fetch characters, extract first one
   
4. Apply Codes
   └─ POST each gift code with delays
```

## 🎨 UI Layout

```
┌──────────────────────────────┐
│ ⚙️ CONFIG    │    🎯 ACTIONS │
├──────────────┼────────────────┤
│  📊 OUTPUTS  │  📝 CONSOLE    │
└──────────────┴────────────────┘
```

## 🔌 API Examples

```javascript
// Get config
GET /api/config

// Update config
POST /api/config
{ "appId": "33", "credentials": {...}, "items": [...] }

// Run workflow
POST /api/run-workflow

// Run single step
POST /api/run-step/1

// Get outputs
GET /api/step-outputs

// Clear outputs
POST /api/clear-outputs
```

## 📊 Data Mapping

```javascript
// Access previous step output:
${step1.authorization}              // Field access
${step2.idString}                   // Different step
${step3.data.characterId}           // Nested
${step3.data.0.name}                // Array element
${step1['x-core-client-id']}       // Special chars
```

## 🎯 Common Tasks

### Add Gift Code
1. Type code in input
2. Click "+ Add" or press Enter
3. Code appears as tag
4. Save configuration

### Remove Gift Code
1. Click "×" on any code tag
2. Code disappears
3. Save configuration

### Run Specific Step
1. Complete previous steps first
2. Click step button (e.g., "Step 2")
3. View results in outputs
4. Check console for logs

### Test New Configuration
1. Update fields
2. Click "Save Configuration"
3. Run Step 1 first
4. Run other steps in order

### Debug Error
1. Clear console
2. Run failing step
3. Read error message in console
4. Check step outputs for data
5. Modify config and retry

## 📁 Important Files

| File | Purpose |
|------|---------|
| `server.js` | Express backend |
| `public/app.js` | Frontend logic |
| `public/index.html` | HTML UI |
| `public/styles.css` | Styling |
| `steps/getAuthHeaders.js` | Login step |
| `steps/apiCall.js` | API call step |
| `steps/workflow.js` | Workflow engine |
| `workflows/giftcode-automation.js` | Configuration |

## 🔑 Key Concepts

**Steps**: Individual workflow operations (auth, API call, batch)

**Data Mapping**: Accessing outputs from previous steps

**Response Transform**: Custom function to process API response

**Batch Processing**: Repeat same API with different data

**Error Handling**: Stop, continue, or retry on error

**Status**: Visual indicator (Ready/Running)

## ⚙️ Configuration

### Minimal Config
```javascript
{
  appId: "33",
  credentials: { username: "user", password: "pass" },
  workflow: [ /* steps */ ]
}
```

### Step Config
```javascript
{
  type: "apiCall",
  method: "GET",
  url: "https://api.com/endpoint",
  headers: { "auth": "${step1.token}" },
  delay: 500,
  retries: 1,
  responseTransform: (data) => data.data[0]
}
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3000 in use | Kill process or change PORT in server.js |
| Login fails | Check credentials and network |
| Step error | Check console, validate dependencies |
| Codes not saving | Look for duplicates or console errors |
| Browser won't open | Allow Puppeteer, check headless setting |
| Slow execution | Add delays, check network, increase timeout |

## 📚 Documentation Map

| Need | Read |
|------|------|
| **5-min start** | QUICK_START.md |
| **All features** | README.md |
| **UI details** | WEB_UI_README.md |
| **Config** | CONFIG_SCHEMA.js |
| **Workflow** | WORKFLOW_GUIDE.md |
| **Testing** | TESTING_GUIDE.md |
| **All docs** | DOCUMENTATION_INDEX.md |
| **Visual** | UI_VISUAL_GUIDE.md |

## 🎯 Status Indicators

| Status | Meaning |
|--------|---------|
| 🟢 Green dot | System ready |
| 🟣 Purple dot | Workflow running |
| 🔴 Red dot | Error occurred |
| ✅ Success | Operation completed |
| ❌ Error | Operation failed |
| ⚠️ Warning | Potential issue |

## ⏱️ Timing Guide

| Step | Duration |
|------|----------|
| Step 1 (Login) | 15-30 sec |
| Step 2 (Servers) | 1-2 sec |
| Step 3 (Characters) | 1-2 sec |
| Step 4 per code | 1-2 sec + delay |
| **Total (5 codes)** | **30-40 sec** |

## 🔒 Security Notes

- Credentials stored in memory only
- Not persisted to disk
- Cleared on app restart
- Use strong passwords
- Keep app locally hosted
- Don't share server URL publicly

## 💡 Pro Tips

1. **Test Steps**: Run each step individually first
2. **Save Often**: Save config before running
3. **Monitor Logs**: Check console for detailed info
4. **Batch Test**: Modify codes and run Step 4 multiple times
5. **Error Check**: Clear logs before debugging
6. **Validate Data**: Check outputs after each step
7. **Use Delays**: Add delays between batch calls
8. **Retry Logic**: Configure retries for stability

## 🎓 Learning Path

1. **First Time**: Read QUICK_START.md
2. **Hands On**: Run npm start, use UI
3. **Learn**: Read WEB_UI_README.md
4. **Customize**: Modify workflows/giftcode-automation.js
5. **Extend**: Create new workflow configs
6. **Advanced**: Study WORKFLOW_GUIDE.md

## 📞 Getting Help

1. **Check console output** - Shows detailed error info
2. **Review docs** - Most answers in DOCUMENTATION_INDEX.md
3. **Test step by step** - Isolate the issue
4. **Check config** - Verify syntax and values
5. **Review examples** - See CONFIG_SCHEMA.js for patterns

---

**More Info**: See DOCUMENTATION_INDEX.md for complete guide index

**Start**: Run `npm start` and open http://localhost:3000
