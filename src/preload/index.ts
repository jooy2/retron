import { contextBridge, ipcRenderer } from 'electron';
import {
  mainChannels,
  rendererChannels,
  type MainApi,
  type MainChannel,
  type MainChannelArgs,
  type MainChannelResult,
  type RendererChannel,
  type RendererListener,
} from '@/common/ipc';

// Whitelists of valid channels used for IPC communication, built from the lists
// shared with the main process in `common/ipc`. The checks stay at runtime: the
// renderer is bundled JavaScript by then, so its types are gone and it can pass
// any string it likes.
// (Send message from Renderer to Main)
const mainAvailChannels = new Set<string>(Object.values(mainChannels));
// (Send message from Main to Renderer)
const rendererAvailChannels = new Set<string>(Object.values(rendererChannels));

const assertMainChannel = (channel: string): void => {
  if (!mainAvailChannels.has(channel)) {
    throw new Error(`Unknown ipc channel name: ${channel}`);
  }
};

const assertRendererChannel = (channel: string): void => {
  if (!rendererAvailChannels.has(channel)) {
    throw new Error(`Unknown ipc channel name: ${channel}`);
  }
};

/*
 * The bridge is generic, and `MainApi` in `common/ipc` is what gives each
 * channel its arguments and its result. Nothing is typed again here.
 * */
const mainApi: MainApi = {
  send<Channel extends MainChannel>(channel: Channel, ...data: MainChannelArgs<Channel>): void {
    assertMainChannel(channel);

    ipcRenderer.send(channel, ...data);
  },
  sendSync<Channel extends MainChannel>(
    channel: Channel,
    ...data: MainChannelArgs<Channel>
  ): Awaited<MainChannelResult<Channel>> {
    assertMainChannel(channel);

    return ipcRenderer.sendSync(channel, ...data);
  },
  on<Channel extends RendererChannel>(
    channel: Channel,
    listener: RendererListener<Channel>,
  ): () => void {
    assertRendererChannel(channel);

    ipcRenderer.on(channel, listener);

    return () => {
      ipcRenderer.off(channel, listener);
    };
  },
  once<Channel extends RendererChannel>(
    channel: Channel,
    listener: RendererListener<Channel>,
  ): () => void {
    assertRendererChannel(channel);

    ipcRenderer.once(channel, listener);

    return () => {
      ipcRenderer.off(channel, listener);
    };
  },
  off<Channel extends RendererChannel>(
    channel: Channel,
    listener: RendererListener<Channel>,
  ): void {
    assertRendererChannel(channel);

    ipcRenderer.off(channel, listener);
  },
  async invoke<Channel extends MainChannel>(
    channel: Channel,
    ...data: MainChannelArgs<Channel>
  ): Promise<Awaited<MainChannelResult<Channel>>> {
    assertMainChannel(channel);

    return ipcRenderer.invoke(channel, ...data);
  },
};

contextBridge.exposeInMainWorld('mainApi', mainApi);
