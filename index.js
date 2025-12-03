import { executeWorkflow } from "./steps/workflow.js";
import workflowConfig from "./workflows/giftcode-automation.js";

async function main() {
  try {
    const results = await executeWorkflow(
      workflowConfig.workflow,
      {
        browser: workflowConfig.browser,
        startUrl: workflowConfig.startUrl,
        loginButtonSelector: workflowConfig.loginButtonSelector,
        credentials: workflowConfig.credentials,
        loginSelectors: workflowConfig.loginSelectors,
        waitAfterLogin: workflowConfig.waitAfterLogin,
        targetApiUrls: workflowConfig.targetApiUrls,
        appId: workflowConfig.appId,
      }
    );

    console.log("\n📊 WORKFLOW RESULTS:");
    console.log(JSON.stringify(results, null, 2));

  } catch (error) {
    console.error("\n💥 WORKFLOW FAILED:");
    console.error(error);
    process.exit(1);
  }
}

main();
