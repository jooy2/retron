import { app, BrowserWindow } from 'electron';

import { join } from 'path';
import * as electronLocalShortcut from 'electron-localshortcut';
import * as remoteMain from '@electron/remote/main';
import { version } from '../../package.json';

type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };

remoteMain.initialize();

global.APP_VERSION_NAME = version;
global.IS_DEV = !app.isPackaged;

let win;

const createWindow = () => {
  win = new BrowserWindow({
    width: global.IS_DEV ? 1300 : 720,
    height: 540,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: global.IS_DEV,
      preload: join(__dirname, '../preload/index.js'),
    },
  });
  remoteMain.enable(win.webContents);
  win.setMenuBarVisibility(false);

  if (global.IS_DEV) {
    win
      .loadURL('http://localhost:5173')
      .catch((e) => {
        console.log(e);
      })
      .then(() => {
        win.webContents.openDevTools();
      });
  } else {
    win.loadFile(join(__dirname, '../index.html')).catch((e) => {
      console.log(e);
    });
  }

  if (global.IS_DEV) {
    win.on('focus', () => {
      electronLocalShortcut.register(
        win,
        ['CommandOrControl+R', 'CommandOrControl+Shift+R', 'F5'],
        () => {},
      );
    });
  }
  win.on('blur', () => {
    electronLocalShortcut.unregisterAll(win);
  });
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
