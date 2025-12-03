# Vplay Web Auto - Workflow Automation System

A comprehensive automation framework with a modern web UI for managing complex multi-step workflows with intelligent data mapping and error handling.

## 🎯 Overview

This project provides:
- **Browser Automation**: Login and header capture using Puppeteer
- **API Orchestration**: Chain multiple API calls with data mapping
- **Batch Processing**: Execute repeated operations with different data
- **Web UI**: User-friendly interface for configuration and monitoring
- **Real-time Logging**: Live console output and step-by-step execution tracking
- **Flexible Configuration**: Dynamic workflow definition with interpolation

## 📋 Project Structure

```
vplay-web-auto/
├── server.js                      # Express web server
├── package.json                   # Dependencies
├── setup.js                       # Setup verification script
│
├── public/                        # Web UI
│   ├── index.html                # Main interface
│   ├── styles.css                # UI styling
│   └── app.js                    # Frontend logic
│
├── steps/                        # Workflow steps
│   ├── getAuthHeaders.js         # Step 1: Authentication
│   ├── apiCall.js                # Step 2+: API calls
│   └── workflow.js               # Workflow engine
│
├── workflows/                    # Workflow definitions
│   └── giftcode-automation.js   # Example: Gift code automation
│
├── WEB_UI_README.md             # Web UI documentation
├── QUICK_START.md               # Quick start guide
├── CONFIG_SCHEMA.js             # Configuration reference
└── WORKFLOW_GUIDE.md            # (from previous setup)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ installed
- npm or yarn package manager
- Modern web browser (Chrome, Firefox, Edge, Safari)

### Installation

1. **Clone or navigate to project directory**
```bash
cd vplay-web-auto
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the server**
```bash
npm start
```

4. **Open web UI**
Navigate to: http://localhost:3000

## 💡 Usage

### Via Web UI (Recommended)

1. **Configure Settings**
   - Set App ID (default: 33)
   - Enter login credentials
   - Manage gift codes list

2. **Run Workflow**
   - Click "▶ Run All Steps" for sequential execution
   - Or run individual steps with "Step 1", "Step 2", etc.

3. **Monitor Progress**
   - View console output in real-time
   - Check step outputs
   - Handle any errors from console logs

### Workflow Execution

**Full Workflow:**
```
Step 1: Get Authentication Headers
  ↓ (logs in and captures auth headers)
Step 2: Get Available Servers
  ↓ (fetches server list, extracts highest sort)
Step 3: Get Characters
  ↓ (fetches characters, extracts first one)
Step 4: Apply Gift Codes
  ↓ (loops through codes with delays)
Done
```

## 🔧 Configuration

### Global Config (in `workflows/giftcode-automation.js`)

```javascript
{
  appId: "33",                                    // Application ID
  credentials: {
    username: "your_username",
    password: "your_password"
  },
  // ... other settings
}
```

### Workflow Config

Each step can be configured:

```javascript
{
  type: "apiCall",                               // Step type
  name: "Step 2: Get Servers",                   // Display name
  enabled: true,                                 // Enable/disable
  method: "GET",                                 // HTTP method
  url: "https://api.example.com/...",           // API endpoint
  headers: {
    "authorization": "${step1.authorization}"   // Interpolation
  },
  body: null,                                    // Request body
  responseTransform: (data) => data.data[0],    // Transform response
  delay: 500,                                    // Delay before request (ms)
  retries: 1,                                    // Retry count
  delayAfter: 1000,                              // Delay after step (ms)
}
```

## 📍 Data Mapping (Interpolation)

Access previous step outputs using `${stepN.field}` syntax:

### Basic Access
- `${step1.authorization}` - Access field from step 1
- `${step2.idString}` - Access different field from step 2

### Nested Access
- `${step3.data.characterId}` - Nested fields with dots
- `${step3.data.0.name}` - Array elements with index

### Special Characters
- `${step1['x-core-client-id']}` - Fields with hyphens in brackets

### Batch Context
- `${item}` - Current batch item
- `${itemIndex}` - Current item index (0-based)
- `${step1.authorization}` - Still access previous step outputs

## 🎮 Step Types

### 1. getAuthHeaders
Logs in to website and captures authentication headers.

```javascript
{
  type: "getAuthHeaders",
  name: "Step 1: Get Auth Headers",
}
```

### 2. apiCall
Single API request with header injection and response transformation.

```javascript
{
  type: "apiCall",
  method: "GET",
  url: "https://api.example.com/resource?id=${step1.id}",
  headers: { "Authorization": "Bearer ${step1.token}" },
  responseTransform: (data) => data.data[0],
}
```

### 3. batch
Multiple API calls with same endpoint but different data.

```javascript
{
  type: "batch",
  method: "POST",
  url: "https://api.example.com/process",
  bodyTemplate: {
    code: "${item}",
    serverId: "${step2.id}",
  },
  items: ["CODE1", "CODE2", "CODE3"],
  delayBetweenCalls: 2000,
  parallel: false,
}
```

## 📊 Web UI Features

### ⚙️ Configuration Panel
- Editable App ID
- Credentials management
- Dynamic gift codes list
- Add/remove codes with duplicate detection
- Save configuration button

### 🎯 Actions Panel
- Run all steps
- Run individual steps
- Clear stored outputs
- Dependency validation

### 📊 Step Outputs
- JSON formatted results
- Real-time updates
- Scrollable view
- Success/error indication

### 📝 Console Output
- Live execution logs
- Color-coded messages
- Clear button
- Auto-scroll to latest

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/config` | GET | Get current configuration |
| `/api/config` | POST | Update configuration |
| `/api/run-workflow` | POST | Execute entire workflow |
| `/api/run-step/:stepNum` | POST | Run single step |
| `/api/step-outputs` | GET | Get all step outputs |
| `/api/clear-outputs` | POST | Clear stored outputs |
| `/api/is-running` | GET | Check if running |

## 🐛 Error Handling

### Step Dependencies
- Steps validate that previous steps completed successfully
- Error: "Step X requires previous steps" → Run dependencies first

### Duplicate Detection
- Gift codes checked for duplicates before save
- Error: "Duplicate items found" → Remove duplicate codes

### Network Errors
- Automatic retries with exponential backoff
- Configurable via `retries` parameter
- Timeout defaults to 30 seconds

### Login Failures
- Check credentials in configuration
- Verify website is accessible
- Check if account is locked/blocked

## 💾 Local Storage

Step outputs are stored in server memory while running:
- **Persistence**: Saved only while server is running
- **Scope**: Within single server instance
- **Clearing**: Manually via "Clear Outputs" button or app restart
- **Purpose**: Enable dependent steps and re-execution

## 🧪 Testing

### Test Individual Steps
1. Run Step 1 to authenticate
2. Run Step 2 to fetch servers
3. Run Step 3 to fetch characters
4. Test Step 4 multiple times with different codes

### Debug Workflow
1. Clear console with "Clear" button
2. Run specific step
3. Check console output for errors
4. Review step outputs for data validation

## 📈 Performance Considerations

- **Delays**: Adjust `delayAfter` to manage API rate limits
- **Retries**: Set appropriate `retries` count for stability
- **Timeout**: Increase for slow networks
- **Batch Delay**: Use `delayBetweenCalls` to avoid rate limiting

## 🔐 Security

- **Credentials**: Stored in-memory only, not persisted to disk
- **Local Execution**: Server runs locally by default
- **No Data Storage**: Outputs cleared on restart
- **HTTPS**: Configure externally if needed

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3000 in use | Kill process or use different port |
| Dependencies not found | Run `npm install` |
| Login fails | Check credentials and network |
| Steps fail with dependencies | Run steps in order or use "Run All" |
| Codes not saving | Check for duplicates and console errors |
| Browser won't open | Allow puppeteer to run or disable headless mode |

## 📚 Documentation

- **QUICK_START.md** - Get started quickly
- **WEB_UI_README.md** - Detailed UI documentation
- **WORKFLOW_GUIDE.md** - Workflow engine details
- **CONFIG_SCHEMA.js** - Configuration reference with examples

## 🎨 Customization

### Add New Step Type
Edit `steps/workflow.js` `executeWorkflow()` function:

```javascript
else if (step.type === "myCustomType") {
  output = await myCustomStepFunction(step, results);
}
```

### Change UI Styling
Edit `public/styles.css` to customize colors, fonts, layout.

### Modify Workflow
Edit `workflows/giftcode-automation.js` to add/remove/modify steps.

## 📝 Example Workflows

### Authentication + API Chain
```javascript
[
  { type: "getAuthHeaders", ... },
  { type: "apiCall", method: "GET", url: "...", headers: {...} },
  { type: "apiCall", method: "GET", url: "...", responseTransform: ... }
]
```

### Batch Processing
```javascript
[
  { type: "getAuthHeaders", ... },
  { 
    type: "batch",
    items: ["ITEM1", "ITEM2", "ITEM3"],
    bodyTemplate: { item: "${item}" },
    delayBetweenCalls: 1000
  }
]
```

## 🤝 Contributing

To extend or modify:
1. Review `CONFIG_SCHEMA.js` for structure
2. Add new steps in `steps/` directory
3. Update `steps/workflow.js` to handle new step types
4. Test via web UI

## 📞 Support

For issues or questions:
1. Check console output for error messages
2. Review documentation files
3. Verify configuration syntax
4. Check network connectivity

## 📄 License

This project is provided as-is for automation and testing purposes.

---

**Last Updated**: December 2025
**Version**: 2.0 (Web UI)