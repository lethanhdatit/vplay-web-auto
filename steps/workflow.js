import { getAuthHeaders } from "./getAuthHeaders.js";
import { apiCall } from "./apiCall.js";

/**
 * Workflow Engine
 * Executes a sequence of steps with data mapping between them
 */
export async function executeWorkflow(workflow, globalConfig) {
    const results = {
        step1: null, // Will store auth headers
    };

    console.log("\n" + "=".repeat(60));
    console.log("🚀 STARTING WORKFLOW");
    console.log("=".repeat(60) + "\n");

    for (let i = 0; i < workflow.length; i++) {
        const step = workflow[i];
        const stepNum = i + 1;
        const stepKey = `step${stepNum}`;

        try {
            console.log(`\n📍 Step ${stepNum}: ${step.name}`);
            console.log("-".repeat(40));

            if (!step.enabled) {
                console.log(`⊘ Step disabled, skipping...`);
                results[stepKey] = null;
                continue;
            }

            let output;

            if (step.type === "getAuthHeaders") {
                output = await getAuthHeaders(step, globalConfig);
            } else if (step.type === "apiCall") {
                output = await apiCall(step, results);
            } else if (step.type === "batch") {
                // Batch API calls with same config but different data
                output = await executeBatch(step, results);
            } else if (step.type === "custom") {
                // Allow custom step function
                if (typeof step.execute !== "function") {
                    throw new Error(`Custom step must have an execute function`);
                }
                output = await step.execute(step, results);
            } else {
                throw new Error(`Unknown step type: ${step.type}`);
            }

            results[stepKey] = output;
            console.log(`✔ Step ${stepNum} completed successfully`);

        } catch (error) {
            console.error(`❌ Step ${stepNum} failed: ${error.message}`);

            if (step.onError === "continue") {
                console.log(`⚠ Continuing to next step...`);
                results[stepKey] = null;
            } else if (step.onError === "retry") {
                // Could implement retry logic here
                throw error;
            } else {
                throw error;
            }
        }

        // Add delay between steps
        if (step.delayAfter && step.delayAfter > 0) {
            console.log(`⏱ Waiting ${step.delayAfter}ms...`);
            await new Promise(r => setTimeout(r, step.delayAfter));
        }
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ WORKFLOW COMPLETED");
    console.log("=".repeat(60) + "\n");

    return results;
}

/**
 * Execute batch of similar API calls
 * Useful for processing multiple items with the same endpoint
 */
async function executeBatch(stepConfig, previousStepOutputs) {
    const {
        name,
        method = "POST",
        url,
        headers = {},
        bodyTemplate,
        items,
        itemsSource = null,
        delayBetweenCalls = 0,
        parallel = false,
    } = stepConfig;

    // Get items from config or from previous step output
    let batchItems = items;
    if (itemsSource) {
        batchItems = getNestedValue(previousStepOutputs[itemsSource.step], itemsSource.path);
    }

    if (!Array.isArray(batchItems)) {
        throw new Error(`Batch items must be an array`);
    }

    const results = [];

    if (parallel) {
        // Execute all in parallel
        const promises = batchItems.map((item, index) =>
            executeBatchItem(item, index, stepConfig, previousStepOutputs, { method, url, headers, bodyTemplate })
        );
        const parallelResults = await Promise.all(promises);
        results.push(...parallelResults);
    } else {
        // Execute sequentially
        for (let i = 0; i < batchItems.length; i++) {
            const item = batchItems[i];
            const itemResult = await executeBatchItem(item, i, stepConfig, previousStepOutputs, { method, url, headers, bodyTemplate });
            results.push(itemResult);

            if (delayBetweenCalls > 0 && i < batchItems.length - 1) {
                console.log(`⏱ Waiting ${delayBetweenCalls}ms before next batch call...`);
                await new Promise(r => setTimeout(r, delayBetweenCalls));
            }
        }
    }

    return results;
}

/**
 * Execute single batch item
 */
async function executeBatchItem(item, index, stepConfig, previousStepOutputs, apiConfig) {
    const { method, url, headers, bodyTemplate } = apiConfig;

    // Create context for this batch item
    const itemContext = {
        ...previousStepOutputs,
        step4:{
            item: item
        },
        itemIndex: index,
    };

    // Build URL with interpolation
    const finalUrl = interpolateValue(url, itemContext);
    const finalHeaders = interpolateObject(headers, itemContext);
    const finalBody = bodyTemplate ? interpolateObject(bodyTemplate, itemContext) : null;

    console.log(finalUrl);
    console.log(finalBody);

    const options = {
        method,
        headers: finalHeaders,
        timeout: 30000,
    };

    if (finalBody && (method === "POST" || method === "PUT" || method === "PATCH")) {
        options.body = typeof finalBody === "string" ? finalBody : JSON.stringify(finalBody);
        if (!options.headers["Content-Type"]) {
            options.headers["Content-Type"] = "application/json";
        }
    }

    const response = await fetch(finalUrl, options);

    if (!response.ok) {
        const data = await response.json();
        console.error(data);
    } else {
        const data = await response.json();
        return data;
    }
}


/**
 * Normalize bracket notation to dot notation
 * Example:
 *   ["a"]["b"] -> .a.b
 *   ['x-core'] -> .x-core
 *   [0] -> .0
 */
function normalizeFieldPath(rawPath) {
    return rawPath
        // ['key'] or ["key"] -> .key
        .replace(/\[['"]?([^'"\]]+)['"]?\]/g, '.$1')
        // Remove leading "."
        .replace(/^\./, '');
}

/**
 * Updated Regex:
 * - Matches: ${step1.foo.bar}
 * - Matches: ${step1['x-core']}
 * - Matches: ${step1["a"]['b'].c}
 * - Dot after stepN is OPTIONAL
 */
const STEP_REGEX = /\$\{step(\d+)(?:\.?([^}]+))?\}/g;

/**
 * Interpolate single value
 * Supports:
 *   - static values
 *   - ${stepN.field}
 *   - ${stepN['key']}
 *   - ${stepN["a"][0].b}
 *   - ${stepN}  (→ trả toàn bộ object)
 */
function interpolateValue(value, previousStepOutputs) {
    if (typeof value !== "string") {
        return value;
    }

    return value.replace(STEP_REGEX, (match, stepNum, rawPath) => {
        const stepKey = `step${stepNum}`;
        const stepOutput = previousStepOutputs[stepKey];

        if (!stepOutput) {
            throw new Error(`Step ${stepNum} output not found`);
        }

        // Trường hợp ${step1} → return full object
        if (!rawPath) {
            return stepOutput;
        }

        // Chuẩn hóa path
        const normalizedPath = normalizeFieldPath(rawPath);

        // Lấy giá trị lồng nhau
        const result = getNestedValue(stepOutput, normalizedPath);

        return result;
    });
}


function interpolateObject(obj, context) {
    if (!obj || typeof obj !== "object") {
        return obj;
    }

    const result = Array.isArray(obj) ? [] : {};

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "string") {
            result[key] = interpolateValue(value, context);
        } else if (typeof value === "object") {
            result[key] = interpolateObject(value, context);
        } else {
            result[key] = value;
        }
    }

    return result;
}

function getNestedValue(obj, path) {
    return path.split(".").reduce((current, key) => {
        if (current === null || current === undefined) {
            throw new Error(`Cannot access property "${key}" of null/undefined`);
        }
        return current[key];
    }, obj);
}

/**
 * Execute a single step independently
 * Used for individual step execution in web UI
 */
export async function executeSingleStep(stepIndex, workflow, previousStepOutputs, globalConfig) {
    const step = workflow[stepIndex];
    const stepNum = stepIndex + 1;
    const stepKey = `step${stepNum}`;

    console.log(`\n📍 Step ${stepNum}: ${step.name}`);
    console.log("-".repeat(40));

    if (!step.enabled) {
        console.log(`⊘ Step disabled, skipping...`);
        return null;
    }

    let output;

    if (step.type === "getAuthHeaders") {
        output = await getAuthHeaders(step, globalConfig);
    } else if (step.type === "apiCall") {
        output = await apiCall(step, previousStepOutputs);
    } else if (step.type === "batch") {
        output = await executeBatch(step, previousStepOutputs);
    } else if (step.type === "custom") {
        if (typeof step.execute !== "function") {
            throw new Error(`Custom step must have an execute function`);
        }
        output = await step.execute(step, previousStepOutputs);
    } else {
        throw new Error(`Unknown step type: ${step.type}`);
    }

    console.log(`✔ Step ${stepNum} completed successfully`);

    return output;
}
