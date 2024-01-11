import { IpcMainEvent, ipcMain, shell } from 'electron';
import { version } from '../../package.json';

/*
 * IPC Communications
 * */
export default class IPCs {
  static initialize(): void {
    // Get application version
    ipcMain.on('msgRequestGetVersion', (event: IpcMainEvent) => {
      event.returnValue = version;
    });

    // Open url via web browser
    ipcMain.on('msgOpenExternalLink', async (event: IpcMainEvent, url: string) => {
      await shell.openExternal(url);
    });
  }
}
