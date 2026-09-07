import { BrowserWindow, IpcMainEvent, IpcMainInvokeEvent, ipcMain } from 'electron';
import { mainChannels, type WindowInfo } from '@/common/ipc';
import { openExternalLink } from './security';
import WindowManager from './WindowManager';
import { setDarkTheme, setLanguage } from './appearance';

/*
 * IPC Communications
 * */
export default class IPCs {
  static initialize(): void {
    // Open url via web browser
    ipcMain.on(mainChannels.openExternalLink, async (event: IpcMainEvent, url: string) => {
      await openExternalLink(url);
    });

    // Open a renderer route in a window of its own. Returns the id of the new
    // window, or `null` when the request was refused (feature switched off,
    // window limit reached, route not allowed)
    ipcMain.handle(mainChannels.openWindow, async (event: IpcMainInvokeEvent, path: string) => {
      const childWindow = await WindowManager.open(
        path,
        BrowserWindow.fromWebContents(event.sender),
      );

      return childWindow?.id ?? null;
    });

    // Close the window the request came from. Only windows owned by
    // `WindowManager` are closed, the main window ignores it.
    ipcMain.handle(mainChannels.closeWindow, (event: IpcMainInvokeEvent) =>
      WindowManager.close(BrowserWindow.fromWebContents(event.sender)),
    );

    // State a freshly loaded window needs before the next `msgWindowsUpdated`
    // broadcast reaches it
    ipcMain.handle(mainChannels.requestWindowInfo, (event: IpcMainInvokeEvent): WindowInfo => {
      const senderWindow = BrowserWindow.fromWebContents(event.sender);

      return {
        isChildWindow: WindowManager.isChildWindow(senderWindow),
        childWindowIds: WindowManager.getIds(),
      };
    });

    // A window keeps its own store, so an explicit theme or language choice is
    // reported here and handed to the windows that are already open
    ipcMain.on(mainChannels.setDarkTheme, (event: IpcMainEvent, darkTheme: unknown) => {
      setDarkTheme(darkTheme, BrowserWindow.fromWebContents(event.sender));
    });

    ipcMain.on(mainChannels.setLanguage, (event: IpcMainEvent, language: unknown) => {
      setLanguage(language, BrowserWindow.fromWebContents(event.sender));
    });
  }
}
