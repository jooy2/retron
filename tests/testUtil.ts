import { Page } from 'playwright';
import { TestInfo } from 'playwright/test';

export default class TestUtil {
  page: Page;
  testInfo: TestInfo;
  screenshotPath: string;

  constructor(page: Page, testInfo: TestInfo, screenshotPath: string) {
    this.page = page;
    this.testInfo = testInfo;
    this.screenshotPath = screenshotPath;
  }

  async captureScreenshot(pageInstance: Page, screenshotName: string) {
    if (!pageInstance) {
      return;
    }

    try {
      const screenshotPath = `${this.screenshotPath}/${screenshotName || `unknown_${Date.now()}`}.png`;

      await pageInstance.screenshot({ path: screenshotPath });
    } catch {
      // Do nothing
    }
  }

  async onTestError(error: unknown) {
    const titleLists = [...this.testInfo.titlePath];
    titleLists.shift();
    const title = titleLists.join('-');

    await this.captureScreenshot(this.page, `${title}_${Date.now()}`);

    return error instanceof Error ? error : new Error(String(error));
  }
}
