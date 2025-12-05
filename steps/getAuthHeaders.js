import puppeteer from "puppeteer";
// Ensure Puppeteer can run inside containers (run as root) by adding
// recommended flags. Merge any user-provided args with safe defaults.
const defaultArgs =
  process.env.NODE_ENV === "production"
    ? [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-zygote",
        "--single-process",
      ]
    : [];

export async function registerAccounts(stepConfig, globalConfig) {
  const {
    browser: browserConfig,
    startUrl,
    loginButtonSelector,
  } = globalConfig;

  const { newAccountFrom, newAccountTo } = stepConfig;

  console.log("newAccountFrom:", newAccountFrom);
  console.log("newAccountTo:", newAccountTo);

  const username = "ltdltd";
  const password = "123456789";
  let results = [];

  const launchArgs =
    browserConfig && browserConfig.args
      ? [...browserConfig.args, ...defaultArgs]
      : defaultArgs;

  const launchOptions = Object.assign({}, browserConfig || {}, {
    args: launchArgs,
  });

  for (let i = Number(newAccountFrom); i <= Number(newAccountTo); i++) {
    const usn = `${username}${i}`;

    console.log(`Running: ${usn}`);

    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    let foundTokens = [];

    try {
      // Monitor all requests to capture Authorization header
      await page.setRequestInterception(true);
      page.on("request", (request) => {
        const url = request.url();

        const headers = request.headers();
        if (headers["authorization"]) {
          foundTokens.push({
            apiUrl: url,
            header: {
              authorization: headers["authorization"],
              "x-core-client-id": headers["x-core-client-id"],
              "x-core-api-version": "v2_onlive", // headers["x-core-api-version"],
              "user-agent": headers["user-agent"],
            },
          });
          console.log("🔐 [FOUND TOKEN] =>", headers["authorization"]);
        }

        request.continue();
      });

      console.log("▶ GO TO START:", startUrl);
      await page.goto(startUrl, { waitUntil: "networkidle2" });

      // Click login button with retry
      console.log("🔎 WAIT FOR LOGIN BUTTON...");
      await clickWithRetry(page, loginButtonSelector);
      await clickWithRetry(page, loginButtonSelector);

      console.log("👉 LOGIN BUTTON CLICKED – WAIT FOR REDIRECT");

      // Fill login form
      await page.waitForSelector("#showRegisterBtn");
      await clickWithRetry(page, "#showRegisterBtn");

      await page.waitForSelector("#reg_uername");
      await page.type("#reg_uername", usn);

      await page.waitForSelector("#reg_password");
      await page.type("#reg_password", password);

      await page.waitForSelector("#reg_rePassword");
      await page.type("#reg_rePassword", password);

      await clickWithRetry(page, "button.btn.btn-primary.dangnhap");
      console.log("🔐 SUBMIT 1");

      await new Promise((r) => setTimeout(r, 2000));

      async function tryToPassCapcha(count, delay1, delay2, delay3) {
        if (foundTokens.length === 0) {

          console.log(`tryToPassCapcha ${count}`);
          await page.waitForSelector("#reg_password");
          await page.type("#reg_password", password);

          await new Promise((r) => setTimeout(r, delay1));

          await clickWithRetry(page, "#reg_agreePolicy");
          await clickWithRetry(page, "#reg_agreePolicy");

          await new Promise((r) => setTimeout(r, delay2));

          await clickWithRetry(page, "button.btn.btn-primary.dangnhap");
          console.log(`🔐 SUBMIT ${count}`);

          await new Promise((r) => setTimeout(r, delay3));
        }
      }

      let limit = 10;
      let count = 1;

      while (foundTokens.length === 0 && limit > 0) {
        await tryToPassCapcha(count, 600, 500, 3000);
        count++;
        limit--;
      }
    } catch (ex) {
      console.error(`Error`, ex);
    } finally {
      await new Promise((r) => setTimeout(r, 3000));
      if (foundTokens.length !== 0) {
        results.push({
          username: usn,
          password: password,
        });
        console.log(`OK, ${usn}`);
      } else {
        console.error(`NOT OK, ${usn}`);
      }
      await browser.close();
    }

    await new Promise((r) => setTimeout(r, 3000));
  }

  return results;
}

/**
 * Step 1: Get Authentication Headers
 * Logs in and captures authorization headers from API requests
 */
export async function getAuthHeaders(stepConfig, globalConfig) {
  const {
    browser: browserConfig,
    startUrl,
    loginButtonSelector,
    credentials,
    loginSelectors,
    waitAfterLogin,
    targetApiUrls,
  } = globalConfig;

  const launchArgs =
    browserConfig && browserConfig.args
      ? [...browserConfig.args, ...defaultArgs]
      : defaultArgs;

  const launchOptions = Object.assign({}, browserConfig || {}, {
    args: launchArgs,
  });

  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();
  let foundTokens = [];

  try {
    // Monitor all requests to capture Authorization header
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      const url = request.url();

      const headers = request.headers();
      if (headers["authorization"]) {
        foundTokens.push({
          apiUrl: url,
          header: {
            authorization: headers["authorization"],
            "x-core-client-id": headers["x-core-client-id"],
            "x-core-api-version": "v2_onlive", // headers["x-core-api-version"],
            "user-agent": headers["user-agent"],
          },
        });
        console.log("🔐 [FOUND TOKEN] =>", headers["authorization"]);
      }

      request.continue();
    });

    console.log("▶ GO TO START:", startUrl);
    await page.goto(startUrl, { waitUntil: "networkidle2" });

    // Click login button with retry
    console.log("🔎 WAIT FOR LOGIN BUTTON...");
    await clickWithRetry(page, loginButtonSelector);
    await clickWithRetry(page, loginButtonSelector);

    console.log("👉 LOGIN BUTTON CLICKED – WAIT FOR REDIRECT");

    // Fill login form
    await page.waitForSelector(loginSelectors.username);
    await page.type(loginSelectors.username, credentials.username);

    await page.waitForSelector(loginSelectors.password);
    await page.type(loginSelectors.password, credentials.password);

    if (loginSelectors.rememberMe) {
      try {
        await page.click(loginSelectors.rememberMe);
      } catch {}
    }

    await page.click(loginSelectors.submit);
    console.log("🔐 SUBMIT LOGIN");

    await new Promise((r) => setTimeout(r, 3000));

    if (foundTokens.length !== 0) {
      return foundTokens[0].header;
    }

    await new Promise((r) => setTimeout(r, waitAfterLogin));

    console.log("➡ FINAL LANDING PAGE:", page.url());

    if (foundTokens.length === 0) {
      throw new Error("❌ No authorization headers found");
    }

    // Return only the first token (most recent)
    const result = foundTokens[0].header;
    console.log("✔ Authentication headers captured successfully");

    return result;
  } finally {
    await browser.close();
  }
}

/**
 * Retry click button
 */
async function clickWithRetry(page, selector, maxRetry = 5) {
  for (let i = 0; i < maxRetry; i++) {
    try {
      await page.waitForSelector(selector, { timeout: 3000 });
      await page.click(selector);
      console.log(`${selector} CLICKED (attempt ${i + 1})`);
      return true;
    } catch (err) {
      console.error(
        `⚠ Cannot click ${selector}, retrying (${i + 1}/${maxRetry})...`,
        err
      );
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw new Error(`❌ Failed to click ${selector} after multiple attempts`);
}
