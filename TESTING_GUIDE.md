# Web UI Testing Guide

## Pre-requisites
- Node.js installed
- Dependencies installed (`npm install`)
- Valid login credentials for the target website

## Test Execution Steps

### 1. Start the Server

```bash
npm start
```

Expected output:
```
🚀 Web UI Server is running at http://localhost:3000
📱 Open your browser and navigate to http://localhost:3000
```

### 2. Open Web UI

Open browser and navigate to: **http://localhost:3000**

Expected: Professional-looking web UI with 4 sections:
- Configuration Panel (left)
- Actions Panel (right)
- Step Outputs (bottom left)
- Console Output (bottom right)

### 3. Configuration Testing

#### Test 3.1: Load Default Config
✓ App ID field shows "33"
✓ Username and Password fields are populated
✓ Gift codes list shows all default codes

#### Test 3.2: Edit App ID
1. Clear App ID field and enter "99"
2. Click "💾 Save Configuration"
3. Expected: Console shows "✅ Configuration saved successfully!"
4. App ID remains at "99"

#### Test 3.3: Edit Credentials
1. Change username to "testuser"
2. Change password to "testpass"
3. Click "💾 Save Configuration"
4. Expected: Console shows confirmation
5. Values persist after reload

#### Test 3.4: Add Gift Code
1. Type "TESTCODE" in gift code input
2. Click "+ Add" or press Enter
3. Expected:
   - "TESTCODE" appears as purple tag
   - Input field clears
   - Focus returns to input
4. Type another code "NEWCODE"
5. Click Add
6. Expected: Both codes appear as tags

#### Test 3.5: Remove Gift Code
1. After adding codes, click "×" on any tag
2. Expected: Code removed immediately
3. Can remove all codes

#### Test 3.6: Detect Duplicate
1. Add code "DUPLICATE"
2. Try to add "DUPLICATE" again
3. Expected: Console error "❌ Code "DUPLICATE" already exists"
4. Code not added

#### Test 3.7: Save Validates Duplicates
1. Manually create duplicate codes (if possible)
2. Click "💾 Save Configuration"
3. Expected: Error message if duplicates exist

#### Test 3.8: Reload Default
1. Modify the codes list
2. Click "↻ Reload Default"
3. Expected: Original default codes restored
4. Console shows "✅ Codes reset to default"

### 4. Workflow Execution Tests

#### Test 4.1: Run Full Workflow
1. Configure valid credentials
2. Click "▶ Run All Steps"
3. Expected:
   - Status changes to "Running..."
   - Status dot becomes orange/purple
   - All buttons disabled
   - Console starts showing logs
   - Browser window opens (Puppeteer login)
   - After ~30-60 seconds, execution completes
   - Status changes back to "Ready"
   - Buttons re-enable

#### Test 4.2: View Console Output
During workflow execution:
✓ Console shows real-time logs
✓ Messages are color-coded
✓ Auto-scrolls to newest message
✓ Shows authentication process
✓ Shows API requests

Expected console messages:
```
ℹ️ Starting workflow...
🔐 [FOUND TOKEN] => Bearer...
✔ Step 1 completed successfully
📡 [GET] https://hub.onlive.vn/...
✔ Response received
✅ Workflow completed successfully!
```

#### Test 4.3: View Step Outputs
After workflow completes:
1. Check "Step Outputs" section
2. Expected:
   - step1: Headers object (authorization, x-core-client-id, etc.)
   - step2: Server object (idString, name, sort)
   - step3: Character object (characterId, character, level)
   - step4: Array of responses from each gift code

#### Test 4.4: Run Individual Step 1
1. Clear outputs with "🗑 Clear Outputs"
2. Click "Step 1: Auth Headers"
3. Expected:
   - Running state engaged
   - Browser opens
   - Login happens
   - Status shows "Running..."
   - Completes with headers in output
   - Console shows successful auth

#### Test 4.5: Run Step 2 (After Step 1)
1. With Step 1 output available
2. Click "Step 2: Get Servers"
3. Expected:
   - API called with headers from Step 1
   - Response shown in outputs
   - Server with highest sort returned
   - Console shows GET request

#### Test 4.6: Run Step 3 (After Steps 1-2)
1. With Steps 1-2 outputs available
2. Click "Step 3: Get Characters"
3. Expected:
   - API called with headers from Step 1 + serverId from Step 2
   - First character extracted
   - Output shows character data
   - Console shows successful request

#### Test 4.7: Run Step 4 Multiple Times
1. With Steps 1-3 outputs available
2. Click "Step 4: Apply Codes" first time
3. Expected:
   - Each gift code called with delay
   - Console shows progress for each code
   - Results array in outputs
4. Modify gift codes (add/remove)
5. Save configuration
6. Click "Step 4: Apply Codes" again
7. Expected:
   - New codes are used
   - Previous results replaced

#### Test 4.8: Dependency Validation
1. Clear all outputs
2. Try to run Step 2 without Step 1
3. Expected: Error message
   ```
   ❌ Step 2 requires previous steps to be completed first: 1
   ```

### 5. Console Testing

#### Test 5.1: Clear Console
1. Run workflow to generate logs
2. Click "Clear" button in console header
3. Expected: All console output cleared
4. New logs still appear after clearing

#### Test 5.2: Console Auto-scroll
1. Generate long output
2. Scroll console up
3. Generate new messages
4. Expected: Auto-scrolls to bottom showing latest

#### Test 5.3: Message Color Coding
1. Run workflow
2. Expected in console:
   - ℹ️ messages in white/light gray (info)
   - ✅ messages in green (success)
   - ❌ messages in red (error)
   - ⚠️ messages in yellow (warn)

### 6. UI Responsiveness Testing

#### Test 6.1: Desktop View (1920x1080)
✓ All sections visible
✓ Layout is 2 columns (config + actions)
✓ Outputs and console below
✓ No horizontal scroll needed

#### Test 6.2: Tablet View (768x1024)
✓ Layout adapts to 1 column
✓ All sections still accessible
✓ Buttons remain clickable
✓ Console readable

#### Test 6.3: Mobile View (375x667)
✓ Single column layout
✓ Sections stack vertically
✓ Input fields are usable
✓ Buttons are large enough

#### Test 6.4: Window Resize
✓ UI reflows smoothly
✓ No broken layout
✓ Content remains readable

### 7. Error Handling Tests

#### Test 7.1: Invalid Credentials
1. Enter wrong username/password
2. Run Step 1
3. Expected: Console error about login failure

#### Test 7.2: Network Error
1. Disconnect internet
2. Try to run workflow
3. Expected: Network error in console

#### Test 7.3: Invalid Configuration
1. Leave required fields empty
2. Try to save
3. Expected: Validation error (or field required message)

#### Test 7.4: Browser Already Running
1. During Step 1 execution
2. Try to run Step 1 again
3. Expected: Error "Workflow is already running"

### 8. Performance Testing

#### Test 8.1: Large Code List
1. Add 50+ gift codes
2. Save configuration
3. Run workflow
4. Expected:
   - No UI freezing
   - Codes processed sequentially
   - All codes handled correctly

#### Test 8.2: Long Console Output
1. Run multiple workflows
2. Generate 200+ console lines
3. Expected:
   - Console buffer manages size
   - Performance not degraded
   - Old messages still accessible via scroll

#### Test 8.3: Execution Time
1. Run full workflow
2. Expected: 2-5 minutes depending on:
   - Network speed
   - API response times
   - Configured delays
   - Number of gift codes

### 9. State Management Tests

#### Test 9.1: Refresh Page During Execution
1. Start workflow
2. During execution, press F5
3. Expected:
   - Page reloads
   - Workflow continues in background
   - Can restart after completion

#### Test 9.2: Outputs Persist
1. Run workflow, complete successfully
2. Modify configurations
3. View outputs section
4. Expected: Previous outputs still visible

#### Test 9.3: Clear Outputs
1. With outputs displayed
2. Click "🗑 Clear Outputs"
3. Expected: All outputs cleared
4. "No outputs yet" message shows

### 10. API Testing (Optional)

#### Test 10.1: Direct API Calls
```bash
# Get config
curl http://localhost:3000/api/config

# Run workflow
curl -X POST http://localhost:3000/api/run-workflow

# Get step outputs
curl http://localhost:3000/api/step-outputs

# Check if running
curl http://localhost:3000/api/is-running
```

Expected: Valid JSON responses

## Test Results Checklist

- [ ] Server starts successfully
- [ ] Web UI loads properly
- [ ] Configuration loads from file
- [ ] Can edit and save configuration
- [ ] Gift codes add/remove work
- [ ] Duplicate detection works
- [ ] Reload defaults works
- [ ] Full workflow executes
- [ ] Individual steps execute
- [ ] Console shows real-time output
- [ ] Step outputs display correctly
- [ ] Dependency validation works
- [ ] Error messages appear
- [ ] UI is responsive
- [ ] Browser doesn't freeze
- [ ] Status indicator updates
- [ ] Buttons disable during execution

## Known Issues & Workarounds

**Issue**: Browser window stays open after login
**Workaround**: Allow process to run, window will close after step completes

**Issue**: Port 3000 already in use
**Workaround**: Kill the process using port 3000 or modify PORT in server.js

**Issue**: Puppeteer won't launch
**Workaround**: Ensure Chrome/Chromium is installed and accessible

## Performance Baseline

- Page load: <2 seconds
- Configuration save: <500ms
- Step 1 (auth): 15-30 seconds
- Step 2 (servers): 1-2 seconds
- Step 3 (characters): 1-2 seconds
- Step 4 (codes): 1-2 seconds per code + configured delay

## Notes for Testers

1. **First Run**: Full workflow may take 30-60 seconds due to Puppeteer startup
2. **Subsequent Runs**: Faster as cached data is used
3. **Delays**: Configured `delayBetweenCalls` affects execution time
4. **Network**: Slow networks may cause timeouts (increase timeout config)
5. **Credentials**: Use valid account credentials to avoid login errors

---

**Test Date**: [Date]
**Tester**: [Name]
**Result**: ✅ PASS / ❌ FAIL
**Notes**: [Any additional notes]
