import puppeteer from "puppeteer";
import config from "./config.js";

/**
 * Retry click button
 * @param {puppeteer.Page} page 
 * @param {string} selector 
 * @param {number} maxRetry 
 */
async function clickLoginButtonWithRetry(page, selector, maxRetry = 5) {
    for (let i = 0; i < maxRetry; i++) {
        try {
            await page.waitForSelector(selector, { timeout: 3000 });
            await page.click(selector);
            console.log(`✔ LOGIN BUTTON CLICKED (attempt ${i + 1})`);
            return true;
        } catch (err) {
            console.log(`⚠ Cannot click login button, retrying (${i + 1}/${maxRetry})...`);
            await new Promise(r => setTimeout(r, 1000));
        }
    }
    throw new Error("❌ Failed to click login button after multiple attempts");
}

async function run() {
    const browser = await puppeteer.launch(config.browser);
    const page = await browser.newPage();

    let foundTokens = [];

    /**
     * Monitor all requests to capture Authorization header
     */
    await page.setRequestInterception(true);
    page.on("request", (request) => {
        const url = request.url();

        // Detect API calls
        if (config.targetApiUrls.some(api => url.includes(api))) {
            const headers = request.headers();
            if (headers["authorization"]) {
                foundTokens.push({
                    apiUrl: url,
                    header: {
                        "authorization": headers["authorization"],
                        "x-core-client-id": headers["x-core-client-id"],
                        "x-core-api-version": headers["x-core-api-version"],
                        "user-agent": headers["user-agent"],
                    }
                });
                console.log("🔐 [FOUND TOKEN] =>", headers["authorization"]);
            }
        }

        request.continue();
    });

    console.log("▶ GO TO START:", config.startUrl);
    await page.goto(config.startUrl, { waitUntil: "networkidle2" });

    /**
     * Click login button with retry
     */
    console.log("🔎 WAIT FOR LOGIN BUTTON...");

    await clickLoginButtonWithRetry(page, config.loginButtonSelector);
    await clickLoginButtonWithRetry(page, config.loginButtonSelector);

    console.log("👉 LOGIN BUTTON CLICKED – WAIT FOR REDIRECT");

    /**
     * Fill login form
     */
    await page.waitForSelector(config.loginSelectors.username);
    await page.type(config.loginSelectors.username, config.credentials.username);

    await page.waitForSelector(config.loginSelectors.password);
    await page.type(config.loginSelectors.password, config.credentials.password);

    if (config.loginSelectors.rememberMe) {
        try {
            await page.click(config.loginSelectors.rememberMe);
        } catch { }
    }

    await page.click(config.loginSelectors.submit);
    console.log("🔐 SUBMIT LOGIN");

    /**
     * Follow multi-step redirect chain until landing page loaded
     */
    await page.waitForNavigation({ waitUntil: "networkidle2" });
    await new Promise(r => setTimeout(r, config.waitAfterLogin));

    console.log("➡ FINAL LANDING PAGE:", page.url());

    console.log("\n🎯 FINAL RESULT:");
    console.log(foundTokens);

    await browser.close();
    return foundTokens;
}

run().catch(err => console.error("❌ ERROR:", err));
