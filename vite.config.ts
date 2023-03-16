import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import electronPlugin from 'vite-plugin-electron';
import rendererPlugin from 'vite-plugin-electron-renderer';
import eslintPlugin from 'vite-plugin-eslint';
import reactPlugin from '@vitejs/plugin-react-swc';
import { resolve, dirname } from 'path';
import { rmSync } from 'fs';
import { builtinModules } from 'module';

const isDEV = process.env.NODE_ENV === 'development';

export default defineConfig(() => {
  rmSync('dist', { recursive: true, force: true });

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
      assetsDir: '', // See: https://github.com/electron-vite/electron-vite-vue/issues/287
      outDir: resolve('./dist'),
    },
    plugins: [
      reactPlugin(),
      // Docs: https://github.com/gxmari007/vite-plugin-eslint
      eslintPlugin(),
      // Docs: https://github.com/electron-vite/vite-plugin-electron
      electronPlugin([
        {
          entry: ['src/main/index.ts'],
          onstart: (options) => {
            options.startup();
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
          entry: ['src/preload/index.ts'],
          onstart: (options) => {
            options.reload();
          },
          vite: {
            build: {
              outDir: 'dist/preload',
            },
          },
        },
      ]),
      rendererPlugin(),
    ],
  };
});
