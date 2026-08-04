import type { MainApi } from './preload/types';

declare global {
  interface Window {
    // API bridge defined in the preload script through `contextBridge`
    mainApi: MainApi;
  }
}
