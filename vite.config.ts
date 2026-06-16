import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import electron, { ElectronSimpleOptions } from 'vite-plugin-electron/simple';
import RendererPlugin from 'vite-plugin-electron-renderer';
import EslintPlugin from '@nabla/vite-plugin-eslint';
import ReactPlugin from '@vitejs/plugin-react-swc';
import { resolve, dirname } from 'path';
import { rmSync } from 'fs';
import { builtinModules } from 'module';

const projectRoot = dirname(fileURLToPath(import.meta.url));
const isDEV = process.env.NODE_ENV === 'development';

export default defineConfig(({ mode }) => {
  process.env = {
    ...(isDEV
      ? {
          ELECTRON_ENABLE_LOGGING: 'true',
        }
      : {}),
    ...process.env,
    ...loadEnv(mode, process.cwd()),
  };

  rmSync(resolve(projectRoot, 'dist'), { recursive: true, force: true });

  const electronPluginConfigs: ElectronSimpleOptions = {
    main: {
      entry: 'src/main/index.ts',
      onstart: ({ startup }) => {
        const debugArgs = ['.', '--inspect=9228', '--remote-debugging-port=9229'];
        startup(debugArgs, { cwd: projectRoot });
      },
      vite: {
        root: resolve(projectRoot),
        base: './',
        build: {
          sourcemap: true,
          assetsDir: '.',
          outDir: resolve(projectRoot, 'dist/main'),
          rolldownOptions: {
            external: ['electron', ...builtinModules],
          },
        },
      },
    },
    preload: {
      input: resolve(projectRoot, 'src/preload/index.ts'),
      vite: {
        build: {
          outDir: resolve(projectRoot, 'dist/preload'),
        },
      },
    },
  };

  return {
    resolve: {
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.mts', '.json', '.scss'],
      alias: {
        '@': resolve(projectRoot, 'src'),
      },
    },
    base: './',
    root: resolve(projectRoot, 'src/renderer'),
    publicDir: resolve(projectRoot, 'src/renderer/public'),
    clearScreen: false,
    build: {
      sourcemap: isDEV,
      minify: !isDEV,
      outDir: resolve(projectRoot, 'dist'),
    },
    plugins: [
      ReactPlugin(),
      // Docs: https://github.com/nabla/vite-plugin-eslint
      EslintPlugin(),
      // Docs: https://github.com/electron-vite/vite-plugin-electron
      electron(electronPluginConfigs),
      RendererPlugin(),
    ],
  };
});
