// ===== CONFIG MANAGEMENT =====
let currentConfig = {};
let defaultCodes = [];

// Load config on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadConfig();
    setupEventListeners();
    setupConsoleInterception();
});

// ===== API CALLS =====

async function loadConfig() {
    try {
        const response = await fetch('/api/config');
        currentConfig = await response.json();
        
        // Store default codes
        defaultCodes = [...currentConfig.items];
        
        // Populate UI
        document.getElementById('appId').value = currentConfig.appId;
        document.getElementById('username').value = currentConfig.credentials.username;
        document.getElementById('password').value = currentConfig.credentials.password;
        
        updateCodesList(currentConfig.items);
    } catch (error) {
        logError(`Failed to load config: ${error.message}`);
    }
}

async function saveConfig() {
    const codes = Array.from(document.querySelectorAll('.code-tag')).map(tag => 
        tag.textContent.trim().replace('×', '').trim()
    ).filter(c => c);

    const config = {
        appId: document.getElementById('appId').value,
        credentials: {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
        },
        items: codes,
    };

    try {
        const response = await fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error);
        }

        currentConfig = config;
        logSuccess('Configuration saved successfully!');
    } catch (error) {
        logError(`Failed to save config: ${error.message}`);
    }
}

async function runWorkflow() {
    await saveConfig(); // Save first
    
    setRunning(true);
    logInfo('Starting workflow...');

    try {
        const response = await fetch('/api/run-workflow', { method: 'POST' });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error);
        }

        const data = await response.json();
        updateOutputs(data.results);
        logSuccess('Workflow completed successfully!');
    } catch (error) {
        logError(`Workflow failed: ${error.message}`);
    } finally {
        setRunning(false);
    }
}

async function runStep(stepNum) {
    // Validate dependencies
    const stepOutputs = await getStepOutputs();
    
    if (stepNum > 1 && !stepOutputs[`step${stepNum - 1}`]) {
        const deps = Array.from({length: stepNum - 1}, (_, i) => i + 1);
        logError(`Step ${stepNum} requires previous steps to be completed first: ${deps.join(', ')}`);
        return;
    }

    setRunning(true);
    logInfo(`Running Step ${stepNum}...`);

    try {
        const response = await fetch(`/api/run-step/${stepNum}`, { method: 'POST' });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error);
        }

        const data = await response.json();
        
        // Update outputs
        const outputs = await getStepOutputs();
        outputs[`step${stepNum}`] = data.result;
        updateOutputs(outputs);
        
        logSuccess(`Step ${stepNum} completed successfully!`);
    } catch (error) {
        logError(`Step ${stepNum} failed: ${error.message}`);
    } finally {
        setRunning(false);
    }
}

async function clearOutputs() {
    try {
        await fetch('/api/clear-outputs', { method: 'POST' });
        updateOutputs({});
        logInfo('Outputs cleared.');
    } catch (error) {
        logError(`Failed to clear outputs: ${error.message}`);
    }
}

async function getStepOutputs() {
    try {
        const response = await fetch('/api/step-outputs');
        return await response.json();
    } catch (error) {
        logError(`Failed to fetch step outputs: ${error.message}`);
        return {};
    }
}

// ===== UI UPDATES =====

function setRunning(running) {
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    const buttons = document.querySelectorAll('.btn');

    if (running) {
        statusDot.className = 'status-dot running';
        statusText.textContent = 'Running...';
        buttons.forEach(btn => btn.disabled = true);
    } else {
        statusDot.className = 'status-dot ready';
        statusText.textContent = 'Ready';
        buttons.forEach(btn => btn.disabled = false);
    }
}

function updateCodesList(codes) {
    const codesList = document.getElementById('codes-list');
    codesList.innerHTML = '';

    codes.forEach((code, index) => {
        const tag = document.createElement('div');
        tag.className = 'code-tag';
        tag.innerHTML = `
            ${code}
            <button class="remove-btn" data-index="${index}">×</button>
        `;
        tag.querySelector('.remove-btn').addEventListener('click', () => removeCode(index));
        codesList.appendChild(tag);
    });
}

function removeCode(index) {
    const codes = Array.from(document.querySelectorAll('.code-tag')).map(tag => 
        tag.textContent.trim().replace('×', '').trim()
    ).filter(c => c);
    
    codes.splice(index, 1);
    updateCodesList(codes);
}

function addCode() {
    const input = document.getElementById('new-code');
    const code = input.value.trim().toUpperCase();

    if (!code) {
        logError('Please enter a code');
        return;
    }

    const codes = Array.from(document.querySelectorAll('.code-tag')).map(tag => 
        tag.textContent.trim().replace('×', '').trim()
    ).filter(c => c);

    if (codes.includes(code)) {
        logError(`Code "${code}" already exists`);
        return;
    }

    codes.push(code);
    updateCodesList(codes);
    input.value = '';
    input.focus();
}

function reloadDefaultCodes() {
    updateCodesList(defaultCodes);
    logInfo('Codes reset to default');
}

async function updateOutputs(outputs) {
    const container = document.getElementById('outputs-container');
    
    if (!outputs || Object.keys(outputs).length === 0) {
        container.innerHTML = '<div class="output-item"><p class="empty-state">No outputs yet.</p></div>';
        return;
    }

    container.innerHTML = '';

    for (const [key, value] of Object.entries(outputs)) {
        if (!value) continue;

        const item = document.createElement('div');
        item.className = 'output-item success';
        
        let displayValue = '';
        if (typeof value === 'object') {
            displayValue = JSON.stringify(value, null, 2);
        } else {
            displayValue = String(value);
        }

        item.innerHTML = `<h4>${key}:</h4><pre>${escapeHtml(displayValue)}</pre>`;
        container.appendChild(item);
    }
}

// ===== CONSOLE INTERCEPTION =====

const consoleLines = [];
let lastServerLogCount = 0;
let serverLogPolling = null;

function setupConsoleInterception() {
    // Keep original console methods but don't intercept for display
    // (we only want to show server logs to avoid duplication)
    
    // Start polling for server logs
    startServerLogPolling();
}

function addConsoleLine(message, type = 'log') {
    const output = document.getElementById('console-output');
    const line = document.createElement('div');
    line.className = `console-output-line ${type}`;
    line.textContent = message;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;

    consoleLines.push({ message, type });
}

// Poll for server-side logs
async function fetchServerLogs() {
    try {
        const response = await fetch('/api/console-logs');
        const data = await response.json();
        const logs = data.logs || [];
        
        // Only add new logs
        if (logs.length > lastServerLogCount) {
            const newLogs = logs.slice(lastServerLogCount);
            newLogs.forEach(log => {
                const timestamp = new Date(log.timestamp).toLocaleTimeString();
                const message = `[${timestamp}] ${log.message}`;
                addConsoleLine(message, log.type);
            });
            lastServerLogCount = logs.length;
        }
    } catch (error) {
        // Silently fail on network errors
    }
}

function startServerLogPolling() {
    // Poll every 500ms for new server logs
    serverLogPolling = setInterval(fetchServerLogs, 500);
}

function stopServerLogPolling() {
    if (serverLogPolling) {
        clearInterval(serverLogPolling);
        serverLogPolling = null;
    }
}

function logInfo(message) {
    // Direct console for browser dev tools, not displayed in UI
    console.log(`ℹ️ ${message}`);
    // Only add to UI if it's important for the user to see
    addConsoleLine(`ℹ️ ${message}`, 'log');
}

function logSuccess(message) {
    console.log(`✅ ${message}`);
    addConsoleLine(`✅ ${message}`, 'log');
}

function logError(message) {
    console.error(`❌ ${message}`);
    addConsoleLine(`❌ ${message}`, 'error');
}

async function clearConsole() {
    // Clear browser-side logs
    document.getElementById('console-output').innerHTML = '';
    consoleLines.length = 0;
    
    // Clear server-side logs
    try {
        await fetch('/api/clear-console-logs', { method: 'POST' });
        lastServerLogCount = 0;
    } catch (error) {
        console.error('Failed to clear server logs:', error);
    }
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ===== EVENT LISTENERS =====

function setupEventListeners() {
    // Config buttons
    document.getElementById('save-config-btn').addEventListener('click', saveConfig);
    document.getElementById('add-code-btn').addEventListener('click', addCode);
    document.getElementById('reload-default-codes-btn').addEventListener('click', reloadDefaultCodes);
    
    // Action buttons
    document.getElementById('run-all-btn').addEventListener('click', runWorkflow);
    document.getElementById('clear-outputs-btn').addEventListener('click', clearOutputs);
    document.getElementById('clear-console-btn').addEventListener('click', clearConsole);

    // Step buttons
    document.querySelectorAll('.btn-step').forEach(btn => {
        btn.addEventListener('click', () => {
            const stepNum = parseInt(btn.dataset.step);
            runStep(stepNum);
        });
    });

    // New code input - Enter key
    document.getElementById('new-code').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addCode();
        }
    });

    // Auto-load outputs on page load
    setTimeout(async () => {
        const outputs = await getStepOutputs();
        updateOutputs(outputs);
    }, 150);

    logInfo('UI ready. Configure and run workflow.');
}
