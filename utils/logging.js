import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Enhanced Server with Enhanced Logging Capture
 * 
 * This module provides utilities to capture console output
 * and send it to the web UI in real-time
 */

// Store for all console messages
let consoleBuffer = [];
const MAX_BUFFER_SIZE = 10000; // Keep last 1000 lines
let isSetup = false; // Prevent multiple setups

/**
 * Setup enhanced console logging
 */
export function setupEnhancedLogging() {
    // Only setup once
    if (isSetup) return;
    isSetup = true;

    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    console.log = (...args) => {
        captureLog('log', args);
        originalLog.apply(console, args);        
    };

    console.error = (...args) => {
        captureLog('error', args);
        originalError.apply(console, args);        
    };

    console.warn = (...args) => {
        captureLog('warn', args);
        originalWarn.apply(console, args);        
    };

    console.info = (...args) => {
        captureLog('info', args);
        originalInfo.apply(console, args);        
    };
}

/**
 * Capture individual log message
 */
function captureLog(type, args) {
    try {
        const message = args.map(arg => {
            if (typeof arg === 'object') {
                try {
                    return JSON.stringify(arg, null, 2);
                } catch (e) {
                    return String(arg);
                }
            }
            return String(arg);
        }).join(' ');

        const logEntry = {
            timestamp: new Date().toISOString(),
            type,
            message
        };

        consoleBuffer.push(logEntry);

        // Keep buffer size manageable
        if (consoleBuffer.length > MAX_BUFFER_SIZE) {
            consoleBuffer = consoleBuffer.slice(-MAX_BUFFER_SIZE);
        }
    } catch (e) {
        // Silently fail if capture fails
    }
}

/**
 * Get all captured logs
 */
export function getConsoleLogs() {
    return consoleBuffer;
}

/**
 * Clear console buffer
 */
export function clearConsoleLogs() {
    consoleBuffer = [];
}

/**
 * Get last N logs
 */
export function getLastLogs(count = 50) {
    return consoleBuffer.slice(-count);
}

/**
 * Export logs to string format
 */
export function exportLogsAsString() {
    return consoleBuffer
        .map(log => `[${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}`)
        .join('\n');
}

// Initialize on import
setupEnhancedLogging();
