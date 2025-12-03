import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { executeWorkflow, executeSingleStep } from './steps/workflow.js';
import workflowConfig, { CONFIG } from './workflows/giftcode-automation.js';
import { setupEnhancedLogging, getConsoleLogs, clearConsoleLogs } from './utils/logging.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Setup enhanced console logging
setupEnhancedLogging();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store for step outputs
let stepOutputs = {};
let isRunning = false;

// ===== API ENDPOINTS =====

/**
 * GET /api/config - Get current configuration
 */
app.get('/api/config', (req, res) => {
  res.json({
    appId: CONFIG.appId,
    credentials: workflowConfig.credentials,
    items: workflowConfig.workflow[3].items,
  });
});

/**
 * POST /api/config - Update configuration
 */
app.post('/api/config', (req, res) => {
  const { appId, credentials, items } = req.body;

  if (appId !== undefined) {
    workflowConfig.appId = appId;
    // Update URLs that use appId
    const newAppId = appId;
    workflowConfig.workflow[1].url = `https://hub.onlive.vn/webshop-api/apps/servers?appId=${newAppId}`;
    workflowConfig.workflow[2].url = `https://hub.onlive.vn/webshop-api/apps/characters?appId=${newAppId}` + "&serverId=${step2.idString}";
    // Also update bodyTemplate appId for step 4
    if (workflowConfig.workflow[3] && workflowConfig.workflow[3].bodyTemplate) {
      workflowConfig.workflow[3].bodyTemplate.appId = newAppId;
    }
  }

  if (credentials) {
    if (credentials.username) workflowConfig.credentials.username = credentials.username;
    if (credentials.password) workflowConfig.credentials.password = credentials.password;
  }

  if (items && Array.isArray(items)) {
    // Validate no duplicates
    const uniqueItems = [...new Set(items)];
    if (uniqueItems.length !== items.length) {
      return res.status(400).json({ error: 'Duplicate items found' });
    }
    workflowConfig.workflow[3].items = items;
  }

  res.json({ success: true });
});

/**
 * POST /api/run-workflow - Run entire workflow
 */
app.post('/api/run-workflow', async (req, res) => {
  if (isRunning) {
    return res.status(400).json({ error: 'Workflow is already running' });
  }

  isRunning = true;
  stepOutputs = {};

  try {
    const results = await executeWorkflow(workflowConfig.workflow, {
      browser: workflowConfig.browser,
      startUrl: workflowConfig.startUrl,
      loginButtonSelector: workflowConfig.loginButtonSelector,
      credentials: workflowConfig.credentials,
      loginSelectors: workflowConfig.loginSelectors,
      waitAfterLogin: workflowConfig.waitAfterLogin,
      targetApiUrls: workflowConfig.targetApiUrls,
      appId: workflowConfig.appId,
    });

    stepOutputs = results;
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    isRunning = false;
  }
});

/**
 * POST /api/run-step/:stepNum - Run single step
 */
app.post('/api/run-step/:stepNum', async (req, res) => {
  const stepNum = parseInt(req.params.stepNum) - 1;
  const workflow = workflowConfig.workflow;

  if (stepNum < 0 || stepNum >= workflow.length) {
    return res.status(400).json({ error: `Step ${stepNum + 1} does not exist` });
  }

  if (isRunning) {
    return res.status(400).json({ error: 'Workflow is already running' });
  }

  isRunning = true;

  try {
    const result = await executeSingleStep(stepNum, workflow, stepOutputs, {
      browser: workflowConfig.browser,
      startUrl: workflowConfig.startUrl,
      loginButtonSelector: workflowConfig.loginButtonSelector,
      credentials: workflowConfig.credentials,
      loginSelectors: workflowConfig.loginSelectors,
      waitAfterLogin: workflowConfig.waitAfterLogin,
      targetApiUrls: workflowConfig.targetApiUrls,
      appId: workflowConfig.appId,
    });

    stepOutputs[`step${stepNum + 1}`] = result;
    res.json({ success: true, result, stepNum: stepNum + 1 });
  } catch (error) {
    res.status(500).json({ error: error.message, stepNum: stepNum + 1 });
  } finally {
    isRunning = false;
  }
});

/**
 * GET /api/step-outputs - Get all step outputs
 */
app.get('/api/step-outputs', (req, res) => {
  res.json(stepOutputs);
});

/**
 * POST /api/clear-outputs - Clear all step outputs
 */
app.post('/api/clear-outputs', (req, res) => {
  stepOutputs = {};
  res.json({ success: true });
});

/**
 * GET /api/is-running - Check if workflow is running
 */
app.get('/api/is-running', (req, res) => {
  res.json({ running: isRunning });
});

/**
 * GET /api/console-logs - Get server console logs
 */
app.get('/api/console-logs', (req, res) => {
  const logs = getConsoleLogs();
  res.json({ logs });
});

/**
 * POST /api/clear-console-logs - Clear server console logs
 */
app.post('/api/clear-console-logs', (req, res) => {
  clearConsoleLogs();
  res.json({ success: true });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Web UI Server is running at http://localhost:${PORT}`);
  console.log(`📱 Open your browser and navigate to http://localhost:${PORT}\n`);
});
