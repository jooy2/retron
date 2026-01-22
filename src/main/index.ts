import { app, BrowserWindow } from 'electron';

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import IPCs from './IPCs';
import { debug } from '../../package.json';

const isDevEnv = process.env.NODE_ENV === 'development';

let mainWindow;
const currentDirName = dirname(fileURLToPath(import.meta.url));

const exitApp = (): void => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.hide();
  }
  mainWindow.destroy();
  app.exit();
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
    width: 720,
    height: 540,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: isDevEnv,
      preload: join(currentDirName, '../preload/index.js'),
    },
  });

  mainWindow.setMenu(null);

  mainWindow.on('close', (event: Event): void => {
    event.preventDefault();
    exitApp();
  });

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
    await mainWindow.loadURL(debug.env.VITE_DEV_SERVER_URL);
  } else {
    await mainWindow.loadFile(join(currentDirName, '../index.html'));
  }

  // Initialize IPC Communication
  IPCs.initialize();
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
    installDevTron();
  }

  await createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
