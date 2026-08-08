import type { MainApi } from './common/ipc';

declare global {
  interface Window {
    // API bridge defined in the preload script through `contextBridge`
    mainApi: MainApi;
  }
}
