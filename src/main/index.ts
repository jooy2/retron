import { app, BrowserWindow, ipcMain } from 'electron';

import path from 'path';
import * as electronLocalShortcut from 'electron-localshortcut';
import * as remoteMain from '@electron/remote/main';
import ElectronStore from 'electron-store';
import { version } from '../../package.json';
import mainStoreSchema from './schema';
import config from './config/base.json';

type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };

remoteMain.initialize();

global.APP_VERSION_NAME = version;
global.IS_DEV = !app.isPackaged;

const winConfig = config.window;
const schema = mainStoreSchema as DeepWriteable<typeof mainStoreSchema>;
const store = new ElectronStore({ schema });
let win;

const createWindow = () => {
  const additionalConfig = {
    ...winConfig.minWidth ? { minWidth: winConfig.minWidth } : {},
    ...winConfig.minHeight ? { minHeight: winConfig.minHeight } : {},
    ...winConfig.resizable ? { resizable: winConfig.resizable } : {},
    ...winConfig.alwaysOnTop ? { alwaysOnTop: winConfig.alwaysOnTop } : {},
  };

  win = new BrowserWindow({
    ...additionalConfig,
    width: global.IS_DEV ? winConfig.devWidth : winConfig.width,
    height: winConfig.height,
    webPreferences: {
      nodeIntegration: winConfig.nodeIntegration,
      devTools: global.IS_DEV && winConfig.devShowDevTools,
      contextIsolation: false,
    },
  });
  remoteMain.enable(win.webContents);
  win.setMenuBarVisibility(winConfig.showMenuBar);

  if (global.IS_DEV) {
    win.loadURL(winConfig.devLoadUrl)
      .catch(e => {
        console.log(e);
      })
      .then(() => {
        if (winConfig.devShowDevTools) {
          win.webContents.openDevTools();
        }
      });
  } else {
    win.loadFile(path.join(__dirname, '../index.html')).catch(e => {
      console.log(e);
    });
  }

  if (winConfig.userRefresh) {
    win.on('focus', () => {
      electronLocalShortcut.register(win, ['CommandOrControl+R', 'CommandOrControl+Shift+R', 'F5'], () => {
      });
    });
  }
  win.on('blur', () => {
    electronLocalShortcut.unregisterAll(win);
  });
};

const restartApp = () => {
  app.relaunch();
  app.exit();
};

app.whenReady().then(() => {
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

ipcMain.on('getAppConfig', () => {
  win.webContents.send('receiveAppConfig', store.store);
});

ipcMain.on('setAppConfig', (event, args) => {
  store.set(args);
});

ipcMain.on('restartApp', () => {
  restartApp();
});

ipcMain.on('resetAppConfig', (event, restart = false) => {
  store.clear();
  if (restart) {
    restartApp();
  }
});
