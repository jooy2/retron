import { contextBridge, ipcRenderer } from 'electron';
import type { MainApi, MainChannel, RendererChannel, RendererListener } from './types';

// Whitelist of valid channels used for IPC communication (Send message from Renderer to Main)
const mainAvailChannels: MainChannel[] = [
  'msgRequestGetVersion',
  'msgRequestGetSystemTheme',
  'msgOpenExternalLink',
];
// Whitelist of valid channels used for IPC communication (Send message from Main to Renderer)
const rendererAvailChannels: RendererChannel[] = ['msgNativeThemeUpdated'];

const mainApi: MainApi = {
  send: (channel: MainChannel, ...data: any[]): void => {
    if (mainAvailChannels.includes(channel)) {
      ipcRenderer.send.apply(null, [channel, ...data]);
    } else {
      throw new Error(`Unknown ipc channel name: ${channel}`);
    }
  },
  sendSync: (channel: MainChannel, ...data: any[]): any => {
    if (mainAvailChannels.includes(channel)) {
      return ipcRenderer.sendSync.apply(null, [channel, ...data]);
    }

    throw new Error(`Unknown ipc channel name: ${channel}`);
  },
  on: (channel: RendererChannel, listener: RendererListener): (() => void) => {
    if (rendererAvailChannels.includes(channel)) {
      ipcRenderer.on(channel, listener);

      return () => {
        ipcRenderer.off(channel, listener);
      };
    } else {
      throw new Error(`Unknown ipc channel name: ${channel}`);
    }
  },
  once: (channel: RendererChannel, listener: RendererListener): (() => void) => {
    if (rendererAvailChannels.includes(channel)) {
      ipcRenderer.once(channel, listener);

      return () => {
        ipcRenderer.off(channel, listener);
      };
    } else {
      throw new Error(`Unknown ipc channel name: ${channel}`);
    }
  },
  off: (channel: RendererChannel, listener: RendererListener): void => {
    if (rendererAvailChannels.includes(channel)) {
      ipcRenderer.off(channel, listener);
    } else {
      throw new Error(`Unknown ipc channel name: ${channel}`);
    }
  },
  invoke: async (channel: MainChannel, ...data: any[]): Promise<any> => {
    if (mainAvailChannels.includes(channel)) {
      const result = await ipcRenderer.invoke.apply(null, [channel, ...data]);
      return result;
    }
    throw new Error(`Unknown ipc channel name: ${channel}`);
  },
};

contextBridge.exposeInMainWorld('mainApi', mainApi);
