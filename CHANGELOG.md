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

### Changed

- Minimum supported Node.js version is now `22.12.0`, as required by `electron@42` and `vite@8`
- `build:pre` type-checks the main process, the preload script and the tests as well as the renderer
- Closing the window no longer terminates the app on macOS

### Fixed

- Development-only code and sourcemaps are no longer packaged into release builds
- The dev server url is read from `vite-plugin-electron` instead of a hardcoded port
- The renderer content security policy declares a `default-src` baseline
- External links are restricted to http, https and mailto, and in-app navigation is blocked
- Ipc handlers are registered only once
- `npm run format` reports unformatted files instead of printing every file to stdout
