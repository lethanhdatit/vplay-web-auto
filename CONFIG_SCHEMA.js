/**
 * Configuration Schema Reference
 * This file documents the structure and options for workflow configuration
 */

export const configSchema = {
  // Global configuration
  browser: {
    description: "Puppeteer browser launch options",
    headless: "boolean - Run browser without GUI",
    slowMo: "number - Slow down actions by Nms (for debugging)",
  },

  startUrl: {
    description: "Initial URL to navigate to",
    type: "string",
    example: "https://giftcode.onlive.vn",
  },

  loginButtonSelector: {
    description: "CSS selector for login button",
    type: "string",
    example: "a[class='btn-dangnhap']",
  },

  credentials: {
    description: "Login credentials",
    username: "string - Login username",
    password: "string - Login password",
  },

  loginSelectors: {
    description: "CSS selectors for login form fields",
    username: "string - Username input selector",
    password: "string - Password input selector",
    rememberMe: "string - Remember me checkbox selector",
    submit: "string - Submit button selector",
  },

  targetApiUrls: {
    description: "Array of API URLs to intercept for header capture",
    type: "string[]",
    example: ["oidc-service/oauth2/me"],
  },

  waitAfterLogin: {
    description: "Milliseconds to wait after login completes",
    type: "number",
    example: 2000,
  },

  appId: {
    description: "Application ID for API calls",
    type: "string",
    example: "33",
  },

  // Workflow steps
  workflow: [
    {
      type: {
        description: "Step type",
        enum: ["getAuthHeaders", "apiCall", "batch", "custom"],
      },
      name: {
        description: "Step display name",
        type: "string",
        example: "Step 1: Get Authentication Headers",
      },
      enabled: {
        description: "Whether step is active",
        type: "boolean",
        default: true,
      },
      onError: {
        description: "Error handling behavior",
        enum: ["stop", "continue", "retry"],
        default: "stop",
      },
      delayAfter: {
        description: "Milliseconds to wait after step completes",
        type: "number",
        default: 0,
      },
    },
    {
      type: "apiCall",
      method: {
        description: "HTTP method",
        enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        default: "GET",
      },
      url: {
        description: "API endpoint URL",
        type: "string",
        example: "https://hub.onlive.vn/webshop-api/apps/servers?appId=${config.appId}",
      },
      headers: {
        description: "Request headers with interpolation support",
        type: "object",
        example: {
          authorization: "${step1.authorization}",
          "x-core-client-id": "${step1['x-core-client-id']}",
        },
      },
      queryParams: {
        description: "Query parameters (for cleaner URLs)",
        type: "object",
        example: { appId: "${config.appId}" },
      },
      body: {
        description: "Request body (for POST/PUT)",
        type: "object|string",
        example: { key: "${step2.value}" },
      },
      responseTransform: {
        description: "Function to transform API response",
        type: "function",
        example: "(data) => data.data[0]",
      },
      delay: {
        description: "Milliseconds to wait before request",
        type: "number",
        default: 0,
      },
      retries: {
        description: "Number of retry attempts",
        type: "number",
        default: 1,
      },
      timeout: {
        description: "Request timeout in milliseconds",
        type: "number",
        default: 30000,
      },
    },
    {
      type: "batch",
      url: {
        description: "API endpoint for batch calls",
        type: "string",
      },
      headers: {
        description: "Request headers",
        type: "object",
      },
      bodyTemplate: {
        description: "Body template with ${item} placeholder",
        type: "object",
        example: {
          code: "${item}",
          serverId: "${step2.idString}",
        },
      },
      items: {
        description: "Array of items to iterate",
        type: "string[]|object[]",
        example: ["CODE1", "CODE2", "CODE3"],
      },
      itemsSource: {
        description: "Alternative: get items from previous step output",
        type: "object",
        example: {
          step: "step2",
          path: "data.0.codes",
        },
      },
      delayBetweenCalls: {
        description: "Milliseconds between batch calls",
        type: "number",
        default: 0,
      },
      parallel: {
        description: "Execute batch calls in parallel",
        type: "boolean",
        default: false,
      },
    },
  ],
};

/**
 * Interpolation Reference
 * 
 * In URLs, headers, body, and other string fields, you can use interpolation:
 * 
 * ${stepN.field}           - Access field from step N output
 * ${stepN['field-name']}   - Access field with special characters
 * ${stepN.nested.value}    - Access nested fields with dot notation
 * ${stepN.data.0.name}     - Access array elements with index
 * ${config.appId}          - Access global config values (future feature)
 * ${item}                  - In batch requests, reference current item
 * ${itemIndex}             - In batch requests, reference item index
 * 
 * Examples:
 * - "${step1.authorization}"
 * - "${step2.idString}"
 * - "${step3.data.characterId}"
 * - "https://api.example.com?id=${step2.id}&code=${item}"
 */

/**
 * Response Transform Examples
 */
export const transformExamples = {
  /**
   * Extract first element from array
   */
  firstElement: (data) => data.data[0],

  /**
   * Find element with highest value
   */
  maxByProperty: (data) => 
    data.data.reduce((max, item) => 
      item.sort > max.sort ? item : max
    ),

  /**
   * Flatten nested structure
   */
  flatten: (data) => ({
    id: data.data.userId,
    name: data.data.user.name,
    email: data.data.user.contact.email,
  }),

  /**
   * Filter and map
   */
  filterMap: (data) =>
    data.data
      .filter(item => item.active)
      .map(item => ({ id: item.id, name: item.name })),

  /**
   * Aggregate results
   */
  aggregate: (data) => ({
    total: data.data.length,
    items: data.data,
    timestamp: new Date().toISOString(),
  }),
};

/**
 * Common API Patterns
 */
export const apiPatterns = {
  /**
   * REST GET with query params
   */
  restGet: {
    method: "GET",
    url: "https://api.example.com/resource?id=${step1.id}",
    headers: {
      "Authorization": "Bearer ${step1.token}",
    },
  },

  /**
   * REST POST with body
   */
  restPost: {
    method: "POST",
    url: "https://api.example.com/resource",
    headers: {
      "Authorization": "Bearer ${step1.token}",
      "Content-Type": "application/json",
    },
    body: {
      name: "${item}",
      parentId: "${step2.id}",
      timestamp: new Date().toISOString(),
    },
  },

  /**
   * Batch requests
   */
  batchRequest: {
    type: "batch",
    method: "POST",
    url: "https://api.example.com/process",
    headers: {
      "Authorization": "Bearer ${step1.token}",
    },
    bodyTemplate: {
      code: "${item}",
      serverId: "${step2.serverId}",
      characterId: "${step3.characterId}",
    },
    items: ["CODE1", "CODE2", "CODE3"],
    delayBetweenCalls: 2000,
    parallel: false,
  },
};
