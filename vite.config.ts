import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import ElectronPlugin, { ElectronOptions } from 'vite-plugin-electron';
import RendererPlugin from 'vite-plugin-electron-renderer';
import EslintPlugin from 'vite-plugin-eslint';
import ReactPlugin from '@vitejs/plugin-react-swc';
import MillionPlugin from 'million/compiler';
import { resolve, dirname } from 'path';
import { rmSync } from 'fs';
import { builtinModules } from 'module';

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

  rmSync('dist', { recursive: true, force: true });

  const electronPluginConfigs: ElectronOptions[] = [
    {
      entry: 'src/main/index.ts',
      onstart: ({ startup }) => {
        startup();
      },
      vite: {
        build: {
          assetsDir: '.',
          outDir: 'dist/main',
          rollupOptions: {
            external: ['electron', ...builtinModules],
          },
        },
      },
    },
    {
      entry: 'src/preload/index.ts',
      onstart: ({ reload }) => {
        reload();
      },
      vite: {
        build: {
          outDir: 'dist/preload',
        },
      },
    },
  ];

  if (isDEV) {
    electronPluginConfigs.push({
      entry: 'src/main/index.dev.ts',
      vite: {
        build: {
          outDir: 'dist/main',
        },
      },
    });
  }

  return {
    resolve: {
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.scss'],
      alias: {
        '@': resolve(dirname(fileURLToPath(import.meta.url)), 'src'),
      },
    },
    base: './',
    root: resolve('./src/renderer'),
    publicDir: resolve('./src/renderer/public'),
    build: {
      sourcemap: isDEV,
      minify: !isDEV,
      outDir: resolve('./dist'),
    },
    plugins: [
      MillionPlugin.vite({ auto: true }),
      ReactPlugin(),
      // Docs: https://github.com/gxmari007/vite-plugin-eslint
      EslintPlugin(),
      // Docs: https://github.com/electron-vite/vite-plugin-electron
      ElectronPlugin(electronPluginConfigs),
      RendererPlugin(),
    ],
  };
});
