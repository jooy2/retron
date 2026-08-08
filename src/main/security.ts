import { BrowserWindow, shell } from 'electron';

/*
 * Guards for everything the renderer can ask the main process to open.
 * The renderer is untrusted by design, so a url or a route coming from it is
 * validated here instead of being handed straight to the operating system.
 * */

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
 * Routes a window may be opened on. The renderer picks the path, so it is kept
 * to a plain hash route: no protocol, no host, no `..` traversal that could
 * escape the bundled index and reach another file.
 * */
const allowedWindowPath = /^\/[\w\-/]*$/;

export const isAllowedWindowPath = (path: string): boolean => allowedWindowPath.test(path);

/*
 * Keeps a window pinned to the application itself. Anything that tries to
 * navigate elsewhere, or to spawn a window of its own, is handed to the default
 * browser instead of being rendered with the privileges of the app.
 *
 * Every window goes through this, the main one and the ones `WindowManager`
 * opens alike.
 * */
export const registerWindowSecurity = (window: BrowserWindow): void => {
  const isInternalUrl = (url: string): boolean => {
    try {
      const target = new URL(url);
      const current = new URL(window.webContents.getURL());

      return target.protocol === current.protocol && target.host === current.host;
    } catch {
      return false;
    }
  };

  window.webContents.setWindowOpenHandler(({ url }) => {
    void openExternalLink(url);

    return { action: 'deny' };
  });

  window.webContents.on('will-navigate', (event, url): void => {
    if (isInternalUrl(url)) {
      return;
    }

    event.preventDefault();
    void openExternalLink(url);
  });
};
