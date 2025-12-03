# Quick Start Guide

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Web UI Server
```bash
npm start
```

You should see:
```
🚀 Web UI Server is running at http://localhost:3000
📱 Open your browser and navigate to http://localhost:3000
```

### 3. Open Web UI
Open your browser and go to: **http://localhost:3000**

## First Time Setup

### Step 1: Configure Your Settings
1. Enter **App ID** (default: 33)
2. Enter **Username** for login
3. Enter **Password** for login
4. Review/Edit **Gift Codes** list
5. Click **💾 Save Configuration**

### Step 2: Run the Workflow

#### Option A: Run Everything at Once
- Click **▶ Run All Steps** button
- Wait for completion
- View results in "Step Outputs" panel
- Check console logs for details

#### Option B: Run Step-by-Step
1. Click **Step 1: Auth Headers**
   - You'll see the Puppeteer browser open automatically
   - It will log in and capture auth headers
   - Wait for completion

2. Once Step 1 is done, click **Step 2: Get Servers**
   - Uses headers from Step 1
   - Fetches server list
   - Extracts server with highest sort value

3. After Step 2, click **Step 3: Get Characters**
   - Uses headers from Step 1 and serverId from Step 2
   - Fetches characters list
   - Extracts first character

4. Finally, click **Step 4: Apply Codes**
   - Uses all previous data
   - Applies each gift code with delays between calls
   - Shows result for each code

## Understanding the UI

### ⚙️ Configuration Panel (Left)
- Modify app settings
- Manage credentials
- Add/remove gift codes
- Save changes before running

### 🎯 Actions Panel (Right)
- Large "Run All Steps" button for quick execution
- Individual step buttons for granular control
- Clear outputs when needed

### 📊 Step Outputs (Bottom Left)
- Shows JSON output from each completed step
- Click to see full data
- Auto-updates as steps complete

### 📝 Console Output (Bottom Right)
- Real-time execution logs
- Color-coded messages
- Shows what's happening during workflow
- Clear button to reset

## Example Workflow

```
START
  ↓
[Step 1] Browser login + capture headers
  ↓
[Step 2] GET /webshop-api/apps/servers?appId=33
  ↓ Output: serverId = 69
  ↓
[Step 3] GET /webshop-api/apps/characters?appId=33&serverId=69
  ↓ Output: characterId = 53512_9043968
  ↓
[Step 4] POST /webshop-api/giftcode/apply-by-code
  ├─ Code 1: VIP6886
  ├─ Code 2: VIP666
  ├─ Code 3: VIP888
  └─ ... (loops through all codes)
  ↓
DONE - View results in console
```

## Common Tasks

### Add a New Gift Code
1. Type code in the input field (e.g., "NEWCODE123")
2. Click **+ Add** or press **Enter**
3. Code appears as a tag
4. Click **💾 Save Configuration**
5. Run **Step 4** again with new code

### Reset to Default Codes
1. Click **↻ Reload Default** button
2. Codes are restored from default list
3. Click **💾 Save Configuration** to save

### Debug a Failed Step
1. Check the **Console Output** panel for error messages
2. Click **Clear** to see only new logs
3. Modify config if needed
4. Run individual step again

### Change Login Credentials
1. Update **Username** and **Password** fields
2. Click **💾 Save Configuration**
3. Run **Step 1** to test new credentials

## Troubleshooting

**"Workflow is already running"**
- Wait for current execution to complete
- Status indicator will change from "Running..." to "Ready"

**"Step X requires previous steps"**
- Run steps in order (1 → 2 → 3 → 4)
- Or click "Run All Steps" to do everything sequentially

**"Duplicate items found"**
- Remove duplicate codes from the list
- Codes are case-insensitive in comparison

**"No authorization headers found"**
- Check username/password are correct
- Verify internet connection
- Website might be down

**Server won't start**
- Check if port 3000 is already in use
- Try a different port or close other applications

## Performance Tips

1. **First Time**: Click "Run All Steps" to go through entire workflow
2. **Testing Codes**: Run only Step 4 after first successful run
3. **Batch Adds**: Add multiple codes at once, then run Step 4
4. **Check Console**: Monitor logs to understand timing and delays

## Next Steps

After successful workflow run:
- Check "Step Outputs" to verify data was captured correctly
- Review console logs for any warnings
- Adjust gift codes as needed
- Schedule regular runs or integrate with other tools

---

For detailed information, see **WEB_UI_README.md**
