import { contextBridge, ipcRenderer } from 'electron';
import {
  mainChannels,
  rendererChannels,
  type MainApi,
  type MainChannel,
  type RendererChannel,
  type RendererListener,
} from '@/common/ipc';

// Whitelists of valid channels used for IPC communication, built from the lists
// shared with the main process in `common/ipc`. The checks stay at runtime: the
// renderer is bundled JavaScript by then, so its types are gone and it can pass
// any string it likes.
// (Send message from Renderer to Main)
const mainAvailChannels: readonly string[] = Object.values(mainChannels);
// (Send message from Main to Renderer)
const rendererAvailChannels: readonly string[] = Object.values(rendererChannels);

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
