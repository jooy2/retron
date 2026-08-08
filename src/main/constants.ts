import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { debug } from '../../package.json';

/*
 * Values the main process modules share.
 *
 * This is main process only, unlike `src/common`: it reaches for Node.js
 * builtins and resolves paths inside the packaged app, neither of which the
 * renderer can do.
 * */

export const isDevEnv = process.env.NODE_ENV === 'development';

// `vite-plugin-electron` injects the address the dev server actually bound to.
// The value in `package.json` is only a fallback for a manually started server.
export const devServerUrl = process.env.VITE_DEV_SERVER_URL || debug.env.VITE_DEV_SERVER_URL;

const currentDirName = dirname(fileURLToPath(import.meta.url));

// Both are resolved from `dist/main`, where this file ends up after the build
export const preloadFile = join(currentDirName, '../preload/index.js');
export const appIndexFile = join(currentDirName, '../index.html');

/* ------------------------------------------------------
 * Feature switches
 * ------------------------------------------------------ */

// Lets the renderer open extra windows on top of the main window through
// `WindowManager`. While it is `false`, every open request is refused and
// logged, whatever `childWindowOptions` below says.
export const FEAT_MULTI_WINDOW = true;

export interface ChildWindowOptions {
  width: number;
  height: number;
  maxWindows: number;
  cascadeOffset: { x: number; y: number };
  allowDuplicatePath: boolean;
}

// Size and placement of the windows opened by `WindowManager`.
// Only used while `FEAT_MULTI_WINDOW` is enabled.
export const childWindowOptions: ChildWindowOptions = {
  width: 1160,
  height: 600,
  // Upper bound on windows open at the same time, the main window aside
  maxWindows: 5,
  // Each window is placed down and to the right of the one that opened it
  cascadeOffset: { x: 32, y: 32 },
  // false, to focus the window already showing a route instead of opening
  // a second one for the same path
  allowDuplicatePath: true,
};
