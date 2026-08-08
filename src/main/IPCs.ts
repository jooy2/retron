import { BrowserWindow, IpcMainEvent, IpcMainInvokeEvent, ipcMain, nativeTheme } from 'electron';
import { mainChannels, rendererChannels, type WindowInfo } from '@/common/ipc';
import { openExternalLink } from './security';
import WindowManager from './WindowManager';
import { version } from '../../package.json';

/*
 * IPC Communications
 * */
export default class IPCs {
  static initialize(): void {
    // Get application version
    ipcMain.on(mainChannels.requestGetVersion, (event: IpcMainEvent) => {
      event.returnValue = version;
    });

    // Get the color scheme the operating system currently asks for
    ipcMain.on(mainChannels.requestGetSystemTheme, (event: IpcMainEvent) => {
      event.returnValue = nativeTheme.shouldUseDarkColors;
    });

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

    // Push the operating system color scheme to every renderer.
    // This is the Main -> Renderer direction of the bridge; the renderer
    // subscribes to it through `window.mainApi.on`.
    nativeTheme.on('updated', () => {
      BrowserWindow.getAllWindows().forEach((browserWindow) => {
        browserWindow.webContents.send(
          rendererChannels.nativeThemeUpdated,
          nativeTheme.shouldUseDarkColors,
        );
      });
    });
  }
}
