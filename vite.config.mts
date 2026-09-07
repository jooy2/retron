import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import electron, { ElectronSimpleOptions } from 'vite-plugin-electron/simple';
import ReactPlugin from '@vitejs/plugin-react-swc';
import { resolve, dirname } from 'path';
import { rmSync } from 'fs';
import { builtinModules } from 'module';

const projectRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command, mode }) => {
  // `NODE_ENV` is not set yet while this config file is being evaluated,
  // so the Vite command is used to detect the development environment.
  const isDEV = command === 'serve';

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
        // The alias is declared per build. Each Electron process is bundled on
        // its own, so the renderer one below does not reach this build.
        resolve: {
          alias: {
            '@': resolve(projectRoot, 'src'),
          },
        },
        // `isDevEnv` in `src/main/constants.ts` is derived from this, so
        // replacing it at build time lets the bundler drop the development
        // branch of `app.on('ready')` along with everything it reaches for.
        define: {
          'process.env.NODE_ENV': JSON.stringify(isDEV ? 'development' : 'production'),
        },
        build: {
          sourcemap: isDEV,
          assetsDir: '.',
          outDir: resolve(projectRoot, 'dist/main'),
          rolldownOptions: {
            // The two development tools are devDependencies, so they are never
            // packaged and never resolved from a release build. Leaving them
            // external keeps their code out of `dist` instead of emitting
            // chunks that only the development branch could have loaded.
            external: [
              'electron',
              '@electron/devtron',
              'electron-extension-installer',
              ...builtinModules,
            ],
          },
        },
      },
    },
    preload: {
      input: resolve(projectRoot, 'src/preload/index.ts'),
      vite: {
        resolve: {
          alias: {
            '@': resolve(projectRoot, 'src'),
          },
        },
        build: {
          outDir: resolve(projectRoot, 'dist/preload'),
        },
      },
    },
  };

  return {
    // Renderer alias. `src/common` sits outside the renderer `root` below, so
    // it is reached through `@` rather than a relative path out of the root.
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
      // The renderer is loaded from disk rather than over a network, so the
      // default 500 kB warning does not describe a cost this app pays.
      chunkSizeWarningLimit: 1500,
    },
    plugins: [
      ReactPlugin(),
      // Docs: https://github.com/electron-vite/vite-plugin-electron
      electron(electronPluginConfigs),
    ],
  };
});
