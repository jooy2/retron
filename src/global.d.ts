import type { MainApi } from './common/ipc';

declare global {
  interface Window {
    // API bridge defined in the preload script through `contextBridge`
    mainApi: MainApi;
  }

  // Replaced with the `package.json` version at build time, see `vite.config.mts`
  const __APP_VERSION__: string;
}
