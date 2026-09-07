# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Changes made before this file existed are only recorded in the git history.

## [Unreleased]

### Added

- Type definitions for the `window.mainApi` bridge, so ipc channel names and payloads are checked at compile time
- Pre-typed `useAppDispatch` and `useAppSelector` hooks
- A working Main → Renderer ipc channel (`msgNativeThemeUpdated`)
- The theme now follows the operating system and remembers an explicit choice
- A language switcher on the main screen
- Project structure and ipc guides in the readme
- Lint and code style checks, test result artifacts and a dependabot configuration in CI
- A `src/common` folder for code every process shares, with lint rules that keep it free of process specific APIs

### Changed

- Minimum supported Node.js version is now `22.12.0`, as required by `electron@42` and `vite@8`
- `build:pre` type-checks the main process, the preload script and the tests as well as the renderer
- Closing the window no longer terminates the app on macOS
- Ipc channel names and the `window.mainApi` type moved from `src/preload/types.ts` to `src/common/ipc.ts`, and the preload whitelist is built from them
- The supported language list moved from `src/renderer/i18n.ts` to `src/common/locales.ts`

- `vite.config.ts` is now `vite.config.mts`, so Vite loads it as an ES module instead of warning that its `configLoader` will stop accepting the current form
- `build.chunkSizeWarningLimit` is raised to 1500 kB for the renderer, which is loaded from disk rather than over a network

### Removed

- `pnpm-lock.yaml`, so `package-lock.json` is the only committed lock file. `pnpm-workspace.yaml` stays, so `pnpm i` still builds `electron` and the other packages that need a postinstall script
- `@nabla/vite-plugin-eslint`, which re-ran ESLint on every hot update. The editor and `npm run lint` already report the same problems, so the dev server no longer pays for them
- `eslint-plugin-n`, whose Node.js rules applied to the React renderer as well and had to be turned off one by one
- The `@typescript-eslint/parser` dependency, along with the `parserOptions.parser` and `requireConfigFile` entries it was passed. Both are eslintrc-era settings that flat config ignores, and `typescript-eslint` already supplies the parser
- `vite-plugin-electron-renderer`, which only matters when the renderer uses Node.js APIs. This template keeps `nodeIntegration` off, and the build output is identical without it

### Fixed

- Development-only code and sourcemaps are no longer packaged into release builds
- The development branch of the main process is now removed at build time, so `@electron/devtron` and `electron-extension-installer` no longer leave chunks in `dist/main`. A release build of the main process went from four files and 145 kB to one file of 4.6 kB
- The dev server url is read from `vite-plugin-electron` instead of a hardcoded port
- The renderer content security policy declares a `default-src` baseline
- External links are restricted to http, https and mailto, and in-app navigation is blocked
- Ipc handlers are registered only once
- `npm run format` reports unformatted files instead of printing every file to stdout
