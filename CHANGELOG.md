# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Changes made before this file existed are only recorded in the git history.

## [Unreleased]

### Added

- Type definitions for the `window.mainApi` bridge, so ipc channel names and payloads are checked at compile time
- `MainChannelSignatures` and `RendererChannelSignatures` in `src/common/ipc.ts`, which give every channel its arguments and its result. `invoke` resolves with the declared type instead of `any`, and `src/main/IPCs.ts` is checked against the same contract through its own `on` and `handle` helpers
- Pre-typed `useAppDispatch` and `useAppSelector` hooks
- A working Main → Renderer ipc channel (`msgWindowsUpdated`)
- The theme now follows the operating system and remembers an explicit choice
- A language switcher on the main screen
- Project structure and ipc guides in the readme
- An end-to-end test that opens a second window and checks that a theme and a language change reach it
- Lint and code style checks, test result artifacts and a dependabot configuration in CI
- A `src/common` folder for code every process shares, with lint rules that keep it free of process specific APIs
- `src/common/theme.ts`, so the background the main process paints before the page exists and the one Material UI uses cannot drift apart

### Changed

- Minimum supported Node.js version is now `22.12.0`, as required by `electron@42` and `vite@8`
- `build:pre` type-checks the main process, the preload script and the tests as well as the renderer
- Closing the window no longer terminates the app on macOS
- Ipc channel names and the `window.mainApi` type moved from `src/preload/types.ts` to `src/common/ipc.ts`, and the preload whitelist is built from them
- The supported language list moved from `src/renderer/i18n.ts` to `src/common/locales.ts`
- `vite.config.ts` is now `vite.config.mts`, so Vite loads it as an ES module instead of warning that its `configLoader` will stop accepting the current form
- `build.chunkSizeWarningLimit` is raised to 1500 kB for the renderer, which is loaded from disk rather than over a network
- Translations are bundled into the renderer build instead of being fetched at runtime, and moved from `src/renderer/public/locales` to `src/renderer/locales`. The first render no longer shows the raw translation keys, and every language is now type-checked against `en`
- The renderer content security policy no longer allows `file:` in `connect-src`, which only the translation requests needed
- Every window is created from one `sharedWebPreferences` object in `src/main/constants.ts`, which now states `sandbox: true` and turns the spellchecker off
- The renderer no longer blocks on `sendSync` at startup. The app version is replaced at build time by `__APP_VERSION__`, and the operating system color scheme is read with `window.matchMedia` instead of being asked for and then relayed by the main process

### Removed

- The `msgRequestGetVersion`, `msgRequestGetSystemTheme` and `msgNativeThemeUpdated` ipc channels, none of which the renderer needs any more
- `i18next-http-backend`. All five languages together are under 4 kB, so bundling them costs less than loading them
- `pnpm-lock.yaml`, so `package-lock.json` is the only committed lock file. `pnpm-workspace.yaml` stays, so `pnpm i` still builds `electron` and the other packages that need a postinstall script
- `@nabla/vite-plugin-eslint`, which re-ran ESLint on every hot update. The editor and `npm run lint` already report the same problems, so the dev server no longer pays for them
- `eslint-plugin-n`, whose Node.js rules applied to the React renderer as well and had to be turned off one by one
- The `@typescript-eslint/parser` dependency, along with the `parserOptions.parser` and `requireConfigFile` entries it was passed. Both are eslintrc-era settings that flat config ignores, and `typescript-eslint` already supplies the parser
- `vite-plugin-electron-renderer`, which only matters when the renderer uses Node.js APIs. This template keeps `nodeIntegration` off, and the build output is identical without it

### Fixed

- `useWindowInfo` opens one ipc subscription and sends one `msgRequestWindowInfo` per window instead of one per component that calls it, and a broadcast that arrives while that request is in flight is no longer overwritten by the answer

- Changing the theme or the language now reaches every open window instead of only the one it was changed in. `src/main/appearance.ts` passes the choice on, and paints a window opened later with the theme already in use
- Development-only code and sourcemaps are no longer packaged into release builds
- The development branch of the main process is now removed at build time, so `@electron/devtron` and `electron-extension-installer` no longer leave chunks in `dist/main`. A release build of the main process went from four files and 145 kB to one file of 4.6 kB
- The dev server url is read from `vite-plugin-electron` instead of a hardcoded port
- The renderer content security policy declares a `default-src` baseline
- External links are restricted to http, https and mailto, and in-app navigation is blocked
- Ipc handlers are registered only once
- A window whose route fails to load is destroyed instead of being left registered and blank, and the failure no longer rejects the renderer's `msgOpenWindow` call
- The devtools open once when the window is ready instead of on every frame load
- `npm run format` reports unformatted files instead of printing every file to stdout
