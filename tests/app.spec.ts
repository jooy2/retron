import { Page, _electron as electron } from 'playwright';
import { ElectronApplication } from 'playwright-core';
import { test, expect } from '@playwright/test';

let appWindow: Page;
let appElectron: ElectronApplication;

function waiting(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), milliseconds);
  });
}

function isElementVisible(selector: string, waitingMilliseconds = 100) {
  return new Promise((resolve) => {
    setTimeout(async () => {
      expect(await appWindow.isVisible(selector), `Confirm selector '${selector}' is visible`).toBe(
        true,
      );
      resolve(true);
    }, waitingMilliseconds);
  });
}

test.beforeAll(async () => {
  // Open Electron app from build directory
  appElectron = await electron.launch({ args: ['dist/main/index.js'] });
  appWindow = await appElectron.firstWindow();

  await appWindow.waitForEvent('load');
});

test('Environment check', async () => {
  const isPackaged = await appElectron.evaluate(async ({ app }) => app.isPackaged);

  expect(isPackaged, 'Confirm that is in development mode').toBe(false);
});

test('Document element check', async () => {
  await isElementVisible('#main-logo');
  await isElementVisible('#btn-change-theme');
});

test('Counter button click check', async () => {
  await appWindow.click('#btn-counter', { clickCount: 10, delay: 50 });

  const counterValueElement = await appWindow.$('#counter-value strong');

  expect(
    await appWindow.evaluate((element) => element.innerHTML, counterValueElement),
    'Confirm counter value is same',
  ).toBe('10');
});

test.afterAll(async () => {
  await waiting(3000);
  await appElectron.close();
});
