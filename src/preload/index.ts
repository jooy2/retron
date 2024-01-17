import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

// Whitelist of valid channels used for IPC communication (Send message from Renderer to Main)
const mainAvailChannels: string[] = ['msgRequestGetVersion', 'msgOpenExternalLink'];
const rendererAvailChannels: string[] = [];

contextBridge.exposeInMainWorld('mainApi', {
  send: (channel: string, ...data: any[]): void => {
    if (mainAvailChannels.includes(channel)) {
      ipcRenderer.send.apply(null, [channel, ...data]);
    } else {
      throw new Error(`Unknown ipc channel name: ${channel}`);
    }
  },
  sendSync: (channel: string, ...data: any[]): any => {
    if (mainAvailChannels.includes(channel)) {
      return ipcRenderer.sendSync.apply(null, [channel, ...data]);
    }

    throw new Error(`Unknown ipc channel name: ${channel}`);
  },
  // eslint-disable-next-line no-unused-vars
  on: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void): void => {
    if (rendererAvailChannels.includes(channel)) {
      ipcRenderer.on(channel, listener);
    } else {
      throw new Error(`Unknown ipc channel name: ${channel}`);
    }
  },
  // eslint-disable-next-line no-unused-vars
  once: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void): void => {
    if (rendererAvailChannels.includes(channel)) {
      ipcRenderer.once(channel, listener);
    } else {
      throw new Error(`Unknown ipc channel name: ${channel}`);
    }
  },
  // eslint-disable-next-line no-unused-vars
  off: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void): void => {
    if (rendererAvailChannels.includes(channel)) {
      ipcRenderer.off(channel, listener);
    } else {
      throw new Error(`Unknown ipc channel name: ${channel}`);
    }
  },
  invoke: async (channel: string, ...data: any[]): Promise<any> => {
    if (mainAvailChannels.includes(channel)) {
      const result = await ipcRenderer.invoke.apply(null, [channel, ...data]);
      return result;
    }
    throw new Error(`Unknown ipc channel name: ${channel}`);
  },
});
