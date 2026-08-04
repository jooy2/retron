import { BrowserWindow, IpcMainEvent, ipcMain, nativeTheme, shell } from 'electron';
import { version } from '../../package.json';

const allowedExternalProtocols = ['http:', 'https:', 'mailto:'];

/*
 * Open a url with the default handler of the operating system.
 * Anything that reaches the main process from the renderer has to be treated as
 * untrusted input, so only a known set of protocols is forwarded to the shell.
 * */
export const openExternalLink = async (url: string): Promise<void> => {
  try {
    const { protocol } = new URL(url);

    if (!allowedExternalProtocols.includes(protocol)) {
      throw new Error(`Blocked an external link with a disallowed protocol: ${protocol}`);
    }

    await shell.openExternal(url);
  } catch (error) {
    console.error(`Failed to open the external link "${url}":`, error);
  }
};

/*
 * IPC Communications
 * */
export default class IPCs {
  static initialize(): void {
    // Get application version
    ipcMain.on('msgRequestGetVersion', (event: IpcMainEvent) => {
      event.returnValue = version;
    });

    // Get the color scheme the operating system currently asks for
    ipcMain.on('msgRequestGetSystemTheme', (event: IpcMainEvent) => {
      event.returnValue = nativeTheme.shouldUseDarkColors;
    });

    // Open url via web browser
    ipcMain.on('msgOpenExternalLink', async (event: IpcMainEvent, url: string) => {
      await openExternalLink(url);
    });

    // Push the operating system color scheme to every renderer.
    // This is the Main -> Renderer direction of the bridge; the renderer
    // subscribes to it through `window.mainApi.on`.
    nativeTheme.on('updated', () => {
      BrowserWindow.getAllWindows().forEach((browserWindow) => {
        browserWindow.webContents.send('msgNativeThemeUpdated', nativeTheme.shouldUseDarkColors);
      });
    });
  }
}
