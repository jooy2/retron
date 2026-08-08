import type { IpcRendererEvent } from 'electron';

/*
 * The IPC contract, shared by the three processes.
 *
 * The channel a renderer calls, the whitelist the preload checks it against and
 * the handler the main process registers are the same string, so it is written
 * once here instead of three times.
 *
 * Everything under `src/common` is bundled into the main, preload and renderer
 * builds alike. Anything only one of them can run has to stay out: no Node.js
 * builtins, no `electron` runtime import, no DOM globals. Type-only imports are
 * erased at build time, so they are fine. ESLint enforces this, see the
 * `src/common` block in `eslint.config.ts`.
 *
 * Each process gets its own copy of this code, so a value exported here is not
 * shared between them. Keep it to constants, types and pure functions.
 * */

/*
 * Channels the renderer may send to the main process.
 * Adding an entry here is enough, the preload whitelist follows it.
 * */
export const mainChannels = {
  requestGetVersion: 'msgRequestGetVersion',
  requestGetSystemTheme: 'msgRequestGetSystemTheme',
  openExternalLink: 'msgOpenExternalLink',
} as const;

/*
 * Channels the main process may push to the renderer.
 * */
export const rendererChannels = {
  nativeThemeUpdated: 'msgNativeThemeUpdated',
} as const;

export type MainChannel = (typeof mainChannels)[keyof typeof mainChannels];

export type RendererChannel = (typeof rendererChannels)[keyof typeof rendererChannels];

export type RendererListener = (event: IpcRendererEvent, ...args: any[]) => void;

/*
 * Shape of the bridge exposed on `window.mainApi` by the preload script.
 * The preload implements it and the renderer calls it, so a channel that is not
 * on the lists above is a build error rather than a thrown error at runtime.
 * */
export interface MainApi {
  /* Renderer -> Main, fire and forget */
  send: (channel: MainChannel, ...data: any[]) => void;
  /* Renderer -> Main, blocks the renderer until the main process replies */
  sendSync: (channel: MainChannel, ...data: any[]) => any;
  /* Main -> Renderer, returns the function that detaches the listener */
  on: (channel: RendererChannel, listener: RendererListener) => () => void;
  once: (channel: RendererChannel, listener: RendererListener) => () => void;
  off: (channel: RendererChannel, listener: RendererListener) => void;
  /* Renderer -> Main, resolves with the value returned by `ipcMain.handle` */
  invoke: (channel: MainChannel, ...data: any[]) => Promise<any>;
}
