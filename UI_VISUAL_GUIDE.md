🎨 **WEB UI VISUAL GUIDE & SCREENSHOTS REFERENCE**

═══════════════════════════════════════════════════════════════

# Web UI Layout & Components

## Overall Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│  🚀 Workflow Automation                    ● Ready           │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────┐  ┌──────────────────────────────┐
│                          │  │                              │
│   ⚙️ CONFIGURATION       │  │   🎯 ACTIONS                │
│                          │  │                              │
│  App ID: [   33   ]      │  │  [▶ Run All Steps]           │
│                          │  │  [🗑 Clear Outputs]          │
│  Username: [username  ]  │  │                              │
│  Password: [password  ]  │  │  Run Individual Steps:       │
│                          │  │  ┌──────────────────────┐    │
│  Gift Codes:             │  │  │ Step 1: Auth Headers │    │
│  ┌──────────────────┐    │  │  │ Step 2: Get Servers  │    │
│  │ [VIP6886] ×      │    │  │  │ Step 3: Get Chars    │    │
│  │ [VIP666] ×       │    │  │  │ Step 4: Apply Codes  │    │
│  │ [VIP888] ×       │    │  │  └──────────────────────┘    │
│  └──────────────────┘    │  │                              │
│                          │  │                              │
│  [Input new code   ]     │  │                              │
│  [+ Add] [↻ Reload]      │  │                              │
│                          │  │                              │
│  [💾 Save Config]        │  │                              │
│                          │  │                              │
└──────────────────────────┘  └──────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                  📊 STEP OUTPUTS                            │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────┐ │
│  │ step1:           │  │ step2:           │  │ step3:   │ │
│  │ {                │  │ {                │  │ {        │ │
│  │  authorization   │  │  idString: "69"  │  │  char    │ │
│  │  x-core-client   │  │  name: "Thao...  │  │  ID:...  │ │
│  │  ...             │  │  sort: 69        │  │  ...     │ │
│  │ }                │  │ }                │  │ }        │ │
│  └──────────────────┘  └──────────────────┘  └──────────┘ │
│                                                              │
│  [step4: [...responses...]]                                │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  📝 CONSOLE OUTPUT              [Clear]                     │
│                                                              │
│  ℹ️ UI ready. Configure and run workflow.                  │
│  ℹ️ Starting workflow...                                   │
│  ▶ GO TO START: https://giftcode.onlive.vn                │
│  🔎 WAIT FOR LOGIN BUTTON...                              │
│  ✔ LOGIN BUTTON CLICKED (attempt 1)                       │
│  🔐 [FOUND TOKEN] => Bearer eyJhbGciOi...                 │
│  📡 [GET] https://hub.onlive.vn/webshop...                │
│  ✔ Response received (attempt 1/1)                        │
│  ✔ Response transformed                                   │
│  ✅ Workflow completed successfully!                       │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

## Section Details

### 1. Configuration Panel (Left Side)

```
┌─────────────────────────────┐
│ ⚙️ CONFIGURATION             │
├─────────────────────────────┤
│                             │
│ App ID:                     │
│ [          33          ]    │
│                             │
│ Username:                   │
│ [          user         ]   │
│                             │
│ Password:                   │
│ [  ••••••••••••••••   ]     │
│                             │
│ Gift Codes (Step 4):        │
│ ┌───────────────────────┐   │
│ │[VIP6886] ×            │   │
│ │[VIP666] ×             │   │
│ │[VIP888] ×             │   │
│ └───────────────────────┘   │
│                             │
│ [New code input area ]      │
│ [+ Add]        [↻ Reload]  │
│                             │
│ [💾 Save Configuration  ]   │
│                             │
└─────────────────────────────┘
```

**Elements:**
- 📝 Text input fields (App ID, Username, Password)
- 🏷️ Code tags with remove buttons
- ➕ Add new code input
- 🔘 Buttons: Add, Reload Default, Save

**Styling:**
- White background
- Clean, professional look
- 14px font size
- Blue primary color (#3b82f6)

### 2. Actions Panel (Right Side)

```
┌───────────────────────────┐
│ 🎯 ACTIONS                │
├───────────────────────────┤
│                           │
│  [▶ Run All Steps    ]    │ Green large button
│  [🗑 Clear Outputs  ]     │
│                           │
│  Run Individual Steps:    │
│  ┌─────────────────────┐  │
│  │ Step 1: Auth Headers│  │ Light gray border
│  │ Step 2: Get Servers │  │
│  │ Step 3: Get Chars   │  │
│  │ Step 4: Apply Codes │  │
│  └─────────────────────┘  │
│                           │
└───────────────────────────┘
```

**Elements:**
- 🎬 Run All Steps button (prominent green)
- 🗑️ Clear Outputs button
- 4️⃣ Individual step buttons
- 🔴 Status indicator

**Features:**
- Hover effect on step buttons
- Disabled state during execution
- Clear visual hierarchy

### 3. Step Outputs Panel (Bottom Left)

```
┌─────────────────────────────────────────┐
│ 📊 STEP OUTPUTS                         │
├─────────────────────────────────────────┤
│                                         │
│ ┌──────────────┐  ┌──────────────┐    │
│ │ step1:       │  │ step2:       │    │ Responsive grid
│ │ {            │  │ {            │    │
│ │  "auth":..,  │  │  "idStr":    │    │
│ │  ...         │  │  ...         │    │
│ │ }            │  │ }            │    │
│ └──────────────┘  └──────────────┘    │
│                                         │
│ ┌──────────────┐                       │
│ │ step3: {...} │                       │
│ └──────────────┘                       │
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ step4: [                            ││
│ │   { response... },                  ││
│ │   { response... }                   ││
│ │ ]                                   ││
│ └─────────────────────────────────────┘│
│                                         │
└─────────────────────────────────────────┘
```

**Features:**
- Responsive grid layout
- JSON-formatted output
- Scrollable area
- Auto-update on step completion
- Color-coded borders (success: green, error: red)

### 4. Console Output Panel (Bottom Right)

```
┌────────────────────────────────────────┐
│ 📝 CONSOLE OUTPUT         [Clear]      │
├────────────────────────────────────────┤
│ (Dark background: #1f2937)            │
│                                        │
│ ℹ️ UI ready. Configure and run...     │ White
│ ℹ️ Starting workflow...               │ White
│ ✔ Step 1 completed successfully      │ Green
│ ❌ Step 2 failed: HTTP 400            │ Red
│ ⚠️ Retrying request...                │ Yellow
│ 📡 [GET] https://api.example.com     │ White
│ ✅ Workflow completed!                │ Green
│                                        │
│ [auto-scroll to latest]               │
│                                        │
└────────────────────────────────────────┘
```

**Features:**
- Dark theme for readability
- Color-coded by level
- Monospace font (Courier New)
- Auto-scroll to bottom
- Clear button to reset

**Color Coding:**
- ℹ️ Info: White (#f3f4f6)
- ✅ Success: Green (#86efac)
- ❌ Error: Red (#f87171)
- ⚠️ Warning: Yellow (#fbbf24)

## State Indicators

### Status Dot Colors

```
● Ready   - Green (#10b981)    - System is idle
● Running - Purple (#8b5cf6)   - Workflow executing
● Error   - Red (#ef4444)      - Error occurred
```

## Responsive Breakpoints

### Desktop (1920x1080+)
```
┌─────────────┬─────────────┐
│             │             │
│   Config    │   Actions   │
│             │             │
├─────────────┴─────────────┤
│   Step Outputs            │
├─────────────────────────────┤
│   Console Output          │
└─────────────────────────────┘
```

### Tablet (768x1024)
```
┌─────────────────────────┐
│   Configuration         │
├─────────────────────────┤
│   Actions               │
├─────────────────────────┤
│   Step Outputs          │
├─────────────────────────┤
│   Console Output        │
└─────────────────────────┘
```

### Mobile (375x667)
```
┌────────────────┐
│ Configuration  │
├────────────────┤
│ Actions        │
├────────────────┤
│ Step Outputs   │
├────────────────┤
│ Console        │
└────────────────┘
```

## Color Palette

```
Primary:     #3b82f6 (Blue)
Primary Dark: #1d4ed8
Success:     #10b981 (Green)
Success Dark: #059669
Danger:      #ef4444 (Red)
Secondary:   #8b5cf6 (Purple)
Secondary Dark: #7c3aed
Background:  #f3f4f6 (Light)
Dark BG:     #1f2937 (Console dark)
Text Dark:   #111827
Text Light:  #f3f4f6
Border:      #e5e7eb (Light gray)
```

## User Interactions

### Configuration Flow
```
1. Load page → Load config from API
   ↓
2. Edit fields → Update local state
   ↓
3. Add/remove codes → Update UI
   ↓
4. Click Save → POST to API
   ↓
5. Show confirmation → Console message
```

### Workflow Execution Flow
```
1. Click Run/Step → Disable buttons
   ↓
2. Status → "Running..." with purple dot
   ↓
3. Stream logs → Real-time console update
   ↓
4. Get results → Update outputs panel
   ↓
5. Complete → Status → "Ready" with green dot
   ↓
6. Enable buttons → Ready for next action
```

## Button States

### Normal
```css
background: #3b82f6
color: white
cursor: pointer
opacity: 1
```

### Hover
```css
background: #1d4ed8
box-shadow: 0 10px 15px rgba(0,0,0,0.15)
```

### Disabled
```css
opacity: 0.5
cursor: not-allowed
no hover effect
```

### Active/Pressed
```css
transform: scale(0.98)
box-shadow: inset 0 2px 4px rgba(0,0,0,0.1)
```

## Animation Effects

### Pulse Animation (Status Dot)
```
0%   → opacity: 1
50%  → opacity: 0.5
100% → opacity: 1
Duration: 2 seconds
Repeat: Infinite
```

### Button Hover
```
Transition: 0.3 seconds
Color smoothly transitions
Shadow gradually increases
```

### Auto-scroll
```
Console automatically scrolls to bottom
when new messages arrive
```

## Accessibility Features

✅ Semantic HTML structure
✅ ARIA labels for buttons
✅ Color contrast ratios meet WCAG AA
✅ Keyboard navigation support
✅ Focus indicators on buttons
✅ Error messages are descriptive
✅ Disabled states are visible
✅ Font sizes are readable (14px minimum)

## Typography

```
H1 (Header):     28px, bold, #3b82f6
H2 (Section):    18px, bold, #3b82f6
H3 (Subsection): 14px, bold, #111827
H4 (Item Title): 13px, bold, #3b82f6
Body Text:       14px, regular, #111827
Console:         12px, monospace, #f3f4f6
```

## Spacing Guidelines

```
Container padding:    20px
Section padding:      20px
Element margin:       15px
Button height:        40px
Input height:         36px
Grid gap:             15px
Border radius:        4px
Shadow:               0 4px 6px rgba(0,0,0,0.1)
Shadow Large:         0 10px 15px rgba(0,0,0,0.15)
```

## Form Elements

### Input Field
```
Border: 1px solid #e5e7eb
Padding: 10px
Border-radius: 4px
Font-size: 14px

Focus State:
  Border-color: #3b82f6
  Box-shadow: 0 0 0 3px rgba(59,130,246,0.1)
```

### Code Tag
```
Background: #8b5cf6 (Purple)
Color: White
Padding: 6px 12px
Border-radius: 20px
Font-size: 12px
Display: Inline-flex
Gap: 8px
```

## Icons & Emojis

Used throughout UI for visual communication:
```
🚀 - Rocket (Start)
⚙️  - Settings/Configuration
🎯 - Target (Actions)
▶ - Play (Run)
📊 - Chart (Outputs)
📝 - Note (Console)
💾 - Save (Save button)
🗑️  - Trash (Clear)
↻ - Reload (Reload)
✅ - Success
❌ - Error
⚠️  - Warning
ℹ️  - Info
🔐 - Security/Lock
📡 - Signal/API
```

---

**This visual guide corresponds to the actual Web UI implementation.**
**For interactive experience, run: `npm start` and open http://localhost:3000**
