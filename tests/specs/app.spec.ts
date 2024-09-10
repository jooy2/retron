import { test, expect, beforeAll, afterAll } from '../fixtures.mts';

test.beforeAll(beforeAll);
test.afterAll(afterAll);

test('Document element check', async ({ page, util }) => {
  try {
    await expect(
      page.getByTestId('main-logo').first(),
      'Confirm main logo is visible',
    ).toBeVisible();
    await expect(
      page.getByTestId('btn-change-theme').first(),
      'Confirm change theme is visible',
    ).toBeVisible();

    await util.captureScreenshot(page, 'result');
  } catch (error) {
    throw await util.onTestError(error);
  }
});

test('Counter button click check', async ({ page, util }) => {
  try {
    await page.getByTestId('btn-counter').click({ clickCount: 10, delay: 50 });

    const counterValueElement = await page
      .getByTestId('counter-value')
      .getByRole('status')
      .innerHTML();

    expect(counterValueElement, 'Confirm counter value is same').toBe('10');
  } catch (error) {
    throw await util.onTestError(error);
  }
});
