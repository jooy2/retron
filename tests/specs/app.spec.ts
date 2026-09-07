import { test, expect, beforeAll, afterAll, getApp } from '../fixtures';

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

test('Theme and language reach every window', async ({ page, util }) => {
  try {
    const backgroundColor = (target: typeof page) =>
      target.evaluate(() => getComputedStyle(document.body).backgroundColor);

    const openedWindow = getApp().waitForEvent('window');

    await page.getByTestId('btn-open-window').click();

    const childWindow = await openedWindow;

    await childWindow.waitForLoadState('domcontentloaded');
    await expect(
      page.getByTestId('window-count').getByRole('status'),
      'Confirm the new window is counted',
    ).toHaveText('1');
    await expect(
      childWindow.getByTestId('btn-close-window'),
      'Confirm the second screen knows it runs in a window of its own',
    ).toBeVisible();

    // Every window keeps its own store, so this only holds while the main
    // process passes the choice on
    await page.getByTestId('btn-change-theme').click();
    await expect
      .poll(() => backgroundColor(childWindow), {
        message: 'Confirm the theme change reached the other window',
      })
      .toBe(await backgroundColor(page));

    await page.getByTestId('select-language').click();
    await page.getByRole('option', { name: 'Deutsch' }).click();
    await expect(
      childWindow.getByRole('heading').first(),
      'Confirm the language change reached the other window',
    ).toHaveText('Zweiter Bildschirm');

    await childWindow.getByTestId('btn-close-window').click();
    await expect(
      page.getByTestId('window-count').getByRole('status'),
      'Confirm the closed window is no longer counted',
    ).toHaveText('0');
  } catch (error) {
    throw await util.onTestError(error);
  }
});
