import { app, BrowserWindow, systemPreferences } from 'electron';

import { join } from 'path';
import IPCs from './IPCs';

type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };

global.IS_DEV = process.env.NODE_ENV === 'development';

let mainWindow;

const exitApp = (): void => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.hide();
  }
  mainWindow.destroy();
  app.exit();
};

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: global.IS_DEV ? 1300 : 720,
    height: 540,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: global.IS_DEV,
      preload: join(__dirname, '../preload/index.js'),
    },
  });

  mainWindow.setMenu(null);

  mainWindow.on('close', (event: Event): void => {
    event.preventDefault();
    exitApp();
  });

  mainWindow.webContents.on('did-frame-finish-load', (): void => {
    if (global.IS_DEV) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.once('ready-to-show', (): void => {
    mainWindow.setAlwaysOnTop(true);
    mainWindow.show();
    mainWindow.focus();
    mainWindow.setAlwaysOnTop(false);
  });

  if (global.IS_DEV) {
    await mainWindow.loadURL('http://localhost:5173');
  } else {
    await mainWindow.loadFile(join(__dirname, '../index.html'));
  }

  // Initialize IPC Communication
  IPCs.initialize(mainWindow);
};

app.whenReady().then(() => {
  if (process.platform === 'darwin') {
    systemPreferences.setUserDefault('NSDisabledDictationMenuItem', 'boolean', true);
    systemPreferences.setUserDefault('NSDisabledCharacterPaletteMenuItem', 'boolean', true);
  }

  createWindow();
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
