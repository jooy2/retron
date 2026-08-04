import type { IpcRendererEvent } from 'electron';

/*
 * Channels the renderer may send to the main process.
 * A new channel has to be added here and to `mainAvailChannels` in `index.ts`.
 * */
export type MainChannel =
  | 'msgRequestGetVersion'
  | 'msgRequestGetSystemTheme'
  | 'msgOpenExternalLink';

/*
 * Channels the main process may push to the renderer.
 * A new channel has to be added here and to `rendererAvailChannels` in `index.ts`.
 * */
export type RendererChannel = 'msgNativeThemeUpdated';

export type RendererListener = (event: IpcRendererEvent, ...args: any[]) => void;

/*
 * Shape of the bridge exposed on `window.mainApi` by the preload script.
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
