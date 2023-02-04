import { app, BrowserWindow, ipcMain, shell } from 'electron';

import { join } from 'path';
import * as electronLocalShortcut from 'electron-localshortcut';
import { version } from '../../package.json';

type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };

global.IS_DEV = !app.isPackaged;

let mainWindow;

const createWindow = () => {
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
  mainWindow.setMenuBarVisibility(false);

  if (global.IS_DEV) {
    mainWindow
      .loadURL('http://localhost:5173')
      .catch((e) => {
        console.log(e);
      })
      .then(() => {
        mainWindow.webContents.openDevTools();
      });
  } else {
    mainWindow.loadFile(join(__dirname, '../index.html')).catch((e) => {
      console.log(e);
    });
  }

  if (global.IS_DEV) {
    mainWindow.on('focus', () => {
      electronLocalShortcut.register(
        mainWindow,
        ['CommandOrControl+R', 'CommandOrControl+Shift+R', 'F5'],
        () => {},
      );
    });
  }
  mainWindow.on('blur', () => {
    electronLocalShortcut.unregisterAll(mainWindow);
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

/*
 * IPC Communications
 * */
// Get application version
ipcMain.on('msgRequestGetVersion', () => {
  mainWindow.webContents.send('msgReceivedVersion', version);
});

// Open url via web browser
ipcMain.on('msgOpenExternalLink', async (event, url) => {
  await shell.openExternal(url);
});
