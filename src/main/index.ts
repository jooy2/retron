import { app, BrowserWindow, nativeTheme } from 'electron';

import IPCs from './IPCs';
import WindowManager from './WindowManager';
import { appIndexFile, devServerUrl, isDevEnv, preloadFile } from './constants';
import { registerWindowSecurity } from './security';

let mainWindow: BrowserWindow;

const exitApp = (): void => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.hide();
    mainWindow.destroy();
  }
  app.quit();
};

const installDevTron = async () => {
  try {
    const { devtron } = await import('@electron/devtron');
    await devtron.install();
  } catch {
    // Do nothing
  }
};

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 1160,
    height: 600,
    // Keep the window hidden until the first paint is ready to avoid a white flash
    show: false,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#111111' : '#ffffff',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: isDevEnv,
      preload: preloadFile,
    },
  });

  // `BrowserWindow.setMenu` is only supported on Windows and Linux. The macOS
  // application menu is left untouched so that standard shortcuts such as
  // Cmd+Q and Cmd+C keep working.
  if (process.platform !== 'darwin') {
    mainWindow.setMenu(null);
  }

  mainWindow.on('close', (event): void => {
    // Windows opened on top of this one go with it, so that the app is never
    // left running with windows the user cannot get back to the main one from.
    WindowManager.closeAll();

    // On macOS it is conventional to keep the app running after the window is
    // closed, so the default behavior is kept and `activate` re-creates it.
    if (process.platform === 'darwin') {
      return;
    }

    event.preventDefault();
    exitApp();
  });

  // Never let the renderer navigate away from the application itself.
  // Everything that points somewhere else is handed to the default browser.
  registerWindowSecurity(mainWindow);

  mainWindow.webContents.on('did-frame-finish-load', (): void => {
    if (isDevEnv) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.once('ready-to-show', (): void => {
    mainWindow.setAlwaysOnTop(true);
    mainWindow.show();
    mainWindow.focus();
    mainWindow.setAlwaysOnTop(false);
  });

  if (isDevEnv) {
    await mainWindow.loadURL(devServerUrl);
  } else {
    await mainWindow.loadFile(appIndexFile);
  }
};

app.on('ready', async () => {
  // Disable special menus on macOS by uncommenting the following, if necessary
  /*
  if (process.platform === 'darwin') {
    systemPreferences.setUserDefault('NSDisabledDictationMenuItem', 'boolean', true);
    systemPreferences.setUserDefault('NSDisabledCharacterPaletteMenuItem', 'boolean', true);
  }
  */

  if (isDevEnv) {
    await import('./index.dev');
    // Awaited on purpose. Devtron wraps every renderer payload to track it and
    // unwraps it again by patching `ipcMain`, so a handler registered before
    // the patch is in place receives the wrapper object instead of its
    // arguments. `IPCs.initialize()` below has to come second.
    await installDevTron();
  }

  // Initialize IPC Communication. Handlers must be registered only once,
  // otherwise re-creating the window would attach duplicated listeners.
  IPCs.initialize();

  await createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await createWindow();
  }
});
