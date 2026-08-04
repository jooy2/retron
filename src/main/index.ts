import { app, BrowserWindow, nativeTheme } from 'electron';

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import IPCs from './IPCs';
import { debug } from '../../package.json';

const isDevEnv = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow;
const currentDirName = dirname(fileURLToPath(import.meta.url));

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
    width: 720,
    height: 540,
    // Keep the window hidden until the first paint is ready to avoid a white flash
    show: false,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#111111' : '#ffffff',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: isDevEnv,
      preload: join(currentDirName, '../preload/index.js'),
    },
  });

  // `BrowserWindow.setMenu` is only supported on Windows and Linux. The macOS
  // application menu is left untouched so that standard shortcuts such as
  // Cmd+Q and Cmd+C keep working.
  if (process.platform !== 'darwin') {
    mainWindow.setMenu(null);
  }

  mainWindow.on('close', (event): void => {
    // On macOS it is conventional to keep the app running after the window is
    // closed, so the default behavior is kept and `activate` re-creates it.
    if (process.platform === 'darwin') {
      return;
    }

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
