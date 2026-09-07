import { BrowserWindow, IpcMainEvent, IpcMainInvokeEvent, ipcMain } from 'electron';
import {
  mainChannels,
  type MainChannel,
  type MainChannelArgs,
  type MainChannelResult,
} from '@/common/ipc';
import { openExternalLink } from './security';
import WindowManager from './WindowManager';
import { setDarkTheme, setLanguage } from './appearance';

/*
 * `ipcMain.on` and `ipcMain.handle`, checked against the contract in
 * `common/ipc`. A handler that reads its arguments wrongly, or answers with the
 * wrong type, is a build error here rather than something the renderer runs
 * into.
 * */
const on = <Channel extends MainChannel>(
  channel: Channel,
  listener: (event: IpcMainEvent, ...args: MainChannelArgs<Channel>) => void,
): void => {
  ipcMain.on(channel, listener);
};

const handle = <Channel extends MainChannel>(
  channel: Channel,
  handler: (
    event: IpcMainInvokeEvent,
    ...args: MainChannelArgs<Channel>
  ) => MainChannelResult<Channel> | Promise<MainChannelResult<Channel>>,
): void => {
  ipcMain.handle(channel, handler);
};

/*
 * IPC Communications
 * */
export default class IPCs {
  static initialize(): void {
    // Open url via web browser
    on(mainChannels.openExternalLink, async (event, url) => {
      await openExternalLink(url);
    });

    // A window keeps its own store, so an explicit theme or language choice is
    // reported here and handed to the windows that are already open
    on(mainChannels.setDarkTheme, (event, darkTheme) => {
      setDarkTheme(darkTheme, BrowserWindow.fromWebContents(event.sender));
    });

    on(mainChannels.setLanguage, (event, language) => {
      setLanguage(language, BrowserWindow.fromWebContents(event.sender));
    });

    // Open a renderer route in a window of its own. Returns the id of the new
    // window, or `null` when the request was refused (feature switched off,
    // window limit reached, route not allowed)
    handle(mainChannels.openWindow, async (event, path) => {
      const childWindow = await WindowManager.open(
        path,
        BrowserWindow.fromWebContents(event.sender),
      );

      return childWindow?.id ?? null;
    });

    // Close the window the request came from. Only windows owned by
    // `WindowManager` are closed, the main window ignores it.
    handle(mainChannels.closeWindow, (event) =>
      WindowManager.close(BrowserWindow.fromWebContents(event.sender)),
    );

    // State a freshly loaded window needs before the next `msgWindowsUpdated`
    // broadcast reaches it
    handle(mainChannels.requestWindowInfo, (event) => {
      const senderWindow = BrowserWindow.fromWebContents(event.sender);

      return {
        isChildWindow: WindowManager.isChildWindow(senderWindow),
        childWindowIds: WindowManager.getIds(),
      };
    });
  }
}
