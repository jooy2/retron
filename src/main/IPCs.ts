import { BrowserWindow, ipcMain, shell } from 'electron';
import { version } from '../../package.json';

/*
 * IPC Communications
 * */
export default class IPCs {
  static initialize(window: BrowserWindow): void {
    // Get application version
    ipcMain.on('msgRequestGetVersion', () => {
      window.webContents.send('msgReceivedVersion', version);
    });

    // Open url via web browser
    ipcMain.on('msgOpenExternalLink', async (event, url) => {
      await shell.openExternal(url);
    });
  }
}
