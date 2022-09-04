const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const electronLocalShortcut = require('electron-localshortcut');
const Store = require('electron-store');
const remoteMain = require('@electron/remote/main');
const { version } = require('../../package.json');
const schema = require('./config/store.json');
const config = require('./config/base.json');

remoteMain.initialize();

global.APP_VERSION_NAME = version;
const winConfig = config.window;

const isDev = !app.isPackaged;
const store = new Store({ schema });
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
    width: isDev ? winConfig.devWidth : winConfig.width,
    height: winConfig.height,
    webPreferences: {
      nodeIntegration: winConfig.nodeIntegration,
      devTools: isDev && winConfig.devShowDevTools,
      enableRemoteModule: true,
      contextIsolation: false,
    },
  });
  remoteMain.enable(win.webContents);
  win.setMenuBarVisibility(winConfig.showMenuBar);

  if (isDev) {
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
  if (restart) restartApp();
});
