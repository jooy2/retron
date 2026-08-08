import { BrowserWindow, nativeTheme, screen } from 'electron';
import {
  FEAT_MULTI_WINDOW,
  appIndexFile,
  childWindowOptions,
  devServerUrl,
  isDevEnv,
  preloadFile,
} from './constants';
import { isAllowedWindowPath, registerWindowSecurity } from './security';
import { rendererChannels } from '@/common/ipc';

/*
 * Child window manager
 *
 * Owns every window opened on top of the main window. The main window itself
 * stays in `index.ts`, so closing a child can never take the app down.
 * Windows are keyed by `BrowserWindow.id`, which Electron never reuses.
 * */
export default class WindowManager {
  // Insertion ordered, so the cascade follows the order windows opened in
  private static childWindows = new Map<number, { window: BrowserWindow; path: string }>();

  /*
   * Opens a renderer route in a window of its own. Resolves with the window, or
   * with `null` when the request was refused.
   * */
  static async open(path: string, parent?: BrowserWindow | null): Promise<BrowserWindow | null> {
    if (!FEAT_MULTI_WINDOW) {
      console.warn(`Multi window is disabled. Ignored open request: ${path}`);

      return null;
    }

    if (!isAllowedWindowPath(path)) {
      console.warn(`Blocked a window open with an unsupported route: ${path}`);

      return null;
    }

    if (!childWindowOptions.allowDuplicatePath) {
      const openedWindow = WindowManager.findByPath(path);

      // Bring the window that already shows this route forward rather than
      // stacking an identical one behind it
      if (openedWindow) {
        openedWindow.focus();

        return openedWindow;
      }
    }

    if (WindowManager.childWindows.size >= childWindowOptions.maxWindows) {
      console.warn(
        `Reached the maximum number of windows (${childWindowOptions.maxWindows}). Ignored open request: ${path}`,
      );

      return null;
    }

    const childWindow = new BrowserWindow({
      width: childWindowOptions.width,
      height: childWindowOptions.height,
      // Keep the window hidden until the first paint is ready to avoid a white flash
      show: false,
      backgroundColor: nativeTheme.shouldUseDarkColors ? '#111111' : '#ffffff',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        devTools: isDevEnv,
        preload: preloadFile,
      },
      ...WindowManager.getCascadeBounds(parent),
    });

    if (process.platform !== 'darwin') {
      childWindow.setMenu(null);
    }

    registerWindowSecurity(childWindow);

    WindowManager.childWindows.set(childWindow.id, { window: childWindow, path });

    // `closed` fires after the window is gone, so the entry cannot be left
    // behind by a close the renderer did not ask for (window button, quit)
    childWindow.on('closed', (): void => {
      WindowManager.childWindows.delete(childWindow.id);
      WindowManager.notifyWindowsUpdated();
    });

    childWindow.once('ready-to-show', (): void => {
      childWindow.show();
      childWindow.focus();
    });

    // Every window loads the same renderer bundle, only the route differs
    if (isDevEnv) {
      await childWindow.loadURL(`${devServerUrl}#${path}`);
    } else {
      await childWindow.loadFile(appIndexFile, { hash: path });
    }

    WindowManager.notifyWindowsUpdated();

    return childWindow;
  }

  /*
   * Closes a window this manager owns. The main window is not one of them, so
   * a component shared by both cannot shut the app down through here.
   * */
  static close(window: BrowserWindow | null): boolean {
    if (!window || !WindowManager.isChildWindow(window)) {
      return false;
    }

    window.close();

    return true;
  }

  static closeAll(): void {
    for (const { window } of [...WindowManager.childWindows.values()]) {
      if (!window.isDestroyed()) {
        window.close();
      }
    }
  }

  static isChildWindow(window: BrowserWindow | null): boolean {
    return window ? WindowManager.childWindows.has(window.id) : false;
  }

  static getIds(): number[] {
    return [...WindowManager.childWindows.keys()];
  }

  private static findByPath(path: string): BrowserWindow | null {
    for (const child of WindowManager.childWindows.values()) {
      if (child.path === path && !child.window.isDestroyed()) {
        return child.window;
      }
    }

    return null;
  }

  /*
   * Offsets a new window from the one that opened it, then keeps it inside the
   * work area of the display that window sits on. Without the clamp a long
   * cascade would walk windows off the bottom right of the screen.
   * */
  private static getCascadeBounds(
    parent?: BrowserWindow | null,
  ): { x: number; y: number } | Record<string, never> {
    if (!parent || parent.isDestroyed()) {
      return {};
    }

    const parentBounds = parent.getBounds();
    const step = WindowManager.childWindows.size + 1;
    const { workArea } = screen.getDisplayMatching(parentBounds);

    return {
      x: Math.max(
        workArea.x,
        Math.min(
          workArea.x + workArea.width - childWindowOptions.width,
          parentBounds.x + childWindowOptions.cascadeOffset.x * step,
        ),
      ),
      y: Math.max(
        workArea.y,
        Math.min(
          workArea.y + workArea.height - childWindowOptions.height,
          parentBounds.y + childWindowOptions.cascadeOffset.y * step,
        ),
      ),
    };
  }

  /*
   * Every window runs the same renderer code, so the window list is pushed to
   * all of them at once instead of only to the one that triggered the change.
   * */
  private static notifyWindowsUpdated(): void {
    const childWindowIds = WindowManager.getIds();

    BrowserWindow.getAllWindows().forEach((browserWindow) => {
      if (!browserWindow.isDestroyed()) {
        browserWindow.webContents.send(rendererChannels.windowsUpdated, childWindowIds);
      }
    });
  }
}
