# 🚀 Workflow Automation Web UI

A modern, user-friendly web interface for managing and executing automated workflows with configuration management and step-by-step execution.

## Features

### ⚙️ Configuration Panel
- **App ID**: Configurable application identifier
- **Credentials**: Username and password management
- **Gift Codes Manager**: 
  - Add/remove gift codes dynamically
  - Duplicate detection
  - Reload default codes
  - Visual code tags

### 🎯 Actions Panel
- **Run All Steps**: Execute complete workflow sequentially
- **Clear Outputs**: Reset all step outputs
- **Individual Step Execution**: 
  - Run Step 1: Get Authentication Headers
  - Run Step 2: Get Available Servers
  - Run Step 3: Get Characters from Server
  - Run Step 4: Apply Gift Codes
  - Dependencies are automatically validated

### 📊 Step Outputs
- Display results from each step
- JSON formatted output
- Real-time updates
- Scrollable container

### 📝 Console Output
- Real-time log display
- Color-coded messages (log, error, warn, success)
- Clear button
- Auto-scroll to latest message
- Dark theme for easy reading

## Installation

```bash
# Install dependencies
npm install

# Start the web server
npm start
```

The UI will be available at: `http://localhost:3000`

## Usage

### 1. Configure Settings
- Set App ID (default: 33)
- Enter your login credentials
- Manage gift codes:
  - Click "Add" to add new codes
  - Or paste codes and click "Add"
  - Click "×" on tags to remove codes
  - Use "Reload Default" to restore original codes

### 2. Save Configuration
- Click "💾 Save Configuration" after making changes
- Configuration is validated before saving
- Console will show confirmation

### 3. Run Workflow

#### Option A: Run All Steps (Sequential)
```
Click "▶ Run All Steps"
- Step 1: Authenticate and capture headers
- Step 2: Fetch available servers
- Step 3: Get characters from highest-sort server
- Step 4: Apply gift codes with delays between calls
```

#### Option B: Run Individual Steps
```
Click specific step button (e.g., "Step 2: Get Servers")
- Each step requires its dependencies to be completed first
- Outputs are stored locally for dependent steps
- You can modify config and re-run steps
```

### 4. Monitor Progress
- Status indicator shows "Running" or "Ready"
- Console output displays real-time logs
- Step outputs are displayed immediately after completion
- Disabled buttons prevent concurrent executions

### 5. View Results
- **Step Outputs**: Shows JSON results from each step
- **Console**: Shows detailed execution logs
- Use "Clear" buttons to reset outputs or logs

## Data Flow

```
Step 1: Get Auth Headers
   ↓
   └─→ Returns: { authorization, x-core-client-id, x-core-api-version, user-agent }
       
Step 2: Get Servers (uses Step 1 headers)
   ↓
   └─→ Returns: { idString, name, sort }
       
Step 3: Get Characters (uses Step 1 headers + Step 2 serverId)
   ↓
   └─→ Returns: { characterId, character, level }
       
Step 4: Apply Codes (uses Step 1-3 data, loops through codes)
   ↓
   └─→ Returns: Array of API responses for each code
```

## Configuration Examples

### Edit Gift Codes
1. Clear existing codes with "×"
2. Type new code in input field
3. Press Enter or click "Add"
4. Code appears as a tag
5. Click "Save Configuration"

### Reset to Defaults
1. Click "↻ Reload Default" button
2. Original codes list is restored
3. Changes are not saved until you click "💾 Save Configuration"

### Change Credentials
1. Update Username/Password fields
2. Click "💾 Save Configuration"
3. Next workflow run will use new credentials

## Error Handling

| Error | Solution |
|-------|----------|
| "Step X requires previous steps" | Run all steps sequentially or run dependencies first |
| "Duplicate items found" | Remove duplicate codes before saving |
| "No authorization headers found" | Check login credentials and website accessibility |
| "HTTP 400/500 errors" | Check configuration and network connectivity |

## Advanced Features

### Local Step Output Storage
- Step outputs are stored in memory
- Persists while server is running
- Allows dependent steps to access previous outputs
- Cleared when "🗑 Clear Outputs" is clicked

### Validation
- Duplicate gift code detection
- Step dependency validation
- Configuration validation before save
- HTTP error handling with detailed messages

### Real-time Console
- All console.log, console.error, console.warn captured
- Color-coded by severity
- Scrollable with auto-scroll on new messages
- Clear button to reset display

## API Endpoints

### GET `/api/config`
Get current configuration
```json
{
  "appId": "33",
  "credentials": { "username": "", "password": "" },
  "items": ["CODE1", "CODE2"]
}
```

### POST `/api/config`
Update configuration
```json
{
  "appId": "33",
  "credentials": { "username": "", "password": "" },
  "items": ["CODE1", "CODE2"]
}
```

### POST `/api/run-workflow`
Execute entire workflow

### POST `/api/run-step/:stepNum`
Execute specific step (1-4)

### GET `/api/step-outputs`
Get all step outputs

### POST `/api/clear-outputs`
Clear all stored outputs

### GET `/api/is-running`
Check if workflow is executing

## Tips & Tricks

1. **Batch Testing**: Test individual steps separately before running the full workflow
2. **Debugging**: Check console output for detailed error messages
3. **Save Before Run**: Always save configuration before running workflow
4. **Reuse Outputs**: Run Step 1 once, then run other steps multiple times with same auth
5. **Code Management**: Add frequently used codes to leverage the UI's persistence

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, the server will fail to start. Check for other applications:
```bash
# On Windows
netstat -ano | findstr :3000
```

### Login Fails
- Verify credentials are correct
- Check internet connection
- Website might have rate limiting (add delays)

### Codes Not Saving
- Ensure no duplicate codes exist
- Check browser console for JavaScript errors
- Verify server is running with `GET http://localhost:3000`

### Steps Fail with Dependencies
- Run steps in order: 1 → 2 → 3 → 4
- Or click "Run All Steps" to execute sequentially
- Check console for specific error messages
