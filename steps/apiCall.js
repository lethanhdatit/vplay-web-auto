/**
 * Step 2+: Generic API Call Step
 * Makes HTTP requests (GET, POST, etc.) with header injection and data mapping
 */
export async function apiCall(stepConfig, previousStepOutputs) {
  const {
    enabled = true,
    method = "GET",
    url,
    headers = {},
    queryParams = {},
    body = null,
    responseTransform = null,
    delay = 0,
    retries = 1,
    timeout = 30000,
  } = stepConfig;

  if (!enabled) {
    console.log(`⊘ Step skipped (disabled)`);
    return null;
  }

  // Map data from config or previous outputs
  const finalUrl = interpolateValue(url, previousStepOutputs);
  const finalQueryParams = interpolateObject(queryParams, previousStepOutputs);
  const finalHeaders = interpolateObject(headers, previousStepOutputs);
  const finalBody = body ? interpolateObject(body, previousStepOutputs) : null;

  // Build query string
  const urlWithParams = finalQueryParams && Object.keys(finalQueryParams).length > 0
    ? finalUrl + "?" + new URLSearchParams(finalQueryParams).toString()
    : finalUrl;

  const options = {
    method,
    headers: finalHeaders,
    timeout,
  };

  if (finalBody && (method === "POST" || method === "PUT" || method === "PATCH")) {
    options.body = typeof finalBody === "string" ? finalBody : JSON.stringify(finalBody);
    if (!options.headers["Content-Type"]) {
      options.headers["Content-Type"] = "application/json";
    }
  }

  console.log(`📡 [${method}] ${urlWithParams}`);

  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (delay > 0) {
        await new Promise(r => setTimeout(r, delay));
      }

      const response = await fetch(urlWithParams, options);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      console.log(`✔ Response received (attempt ${attempt}/${retries})`);

      // Apply custom transformation if provided
      if (responseTransform && typeof responseTransform === "function") {
        const transformed = responseTransform(data);
        console.log(`✔ Response transformed`);
        return transformed;
      }

      return data;

    } catch (error) {
      lastError = error;
      console.log(`⚠ Request failed (${attempt}/${retries}): ${error.message}`);
      
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 1000 * attempt)); // Exponential backoff
      }
    }
  }

  throw new Error(`❌ API call failed after ${retries} attempts: ${lastError.message}`);
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

/**
 * Helper: Interpolate object recursively
 */
function interpolateObject(obj, previousStepOutputs) {
  if (!obj || typeof obj !== "object") {
    return obj;
  }

  const result = Array.isArray(obj) ? [] : {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      result[key] = interpolateValue(value, previousStepOutputs);
    } else if (typeof value === "object") {
      result[key] = interpolateObject(value, previousStepOutputs);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Helper: Get nested value from object by path (e.g., "data.0.name")
 */
function getNestedValue(obj, path) {
  return path.split(".").reduce((current, key) => {
    if (current === null || current === undefined) {
      throw new Error(`Cannot access property "${key}" of null/undefined`);
    }
    return current[key];
  }, obj);
}
