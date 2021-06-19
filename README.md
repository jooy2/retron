![retron-logo](https://user-images.githubusercontent.com/48266008/122630475-0095fe80-d0ff-11eb-9a45-de362a380933.png)

### Electron + React Template

This is a skeleton project for easily creating React-based Electron projects. It comes with several useful modules, including React.

# Components
 - **React 17.x**
   - redux (Global state management)
   
 - **Electron 13**
   - electron-builder (Package builder)
   - electron-store (Local storage)
   
 - **i18n + i18next**
   - i18next (Multilingual translation)

 - **ESLint 7.x**
   - eslint (Code syntax checking)
   - eslint-plugin-react-hooks

# Install
Clone this repo using below command.
```shell
$ git clone https://github.com/leejooy96/retron <PROJECT_NAME>
```

Then, install the dependency module.
```shell
$ npm i
```

You can test your project in the development environment using the following command:
```shell
$ npm run dev
```

# Build
Retron can build targeting Windows 7, 8.1, 10 or later, macOS 14.x or later, and major Linux distributions.

### Windows
```shell
$ npm run build:win
```

### macOS
```shell
$ npm run build:mac
```

### Linux
```shell
$ npm run build:linux
```

# Contribute
You can report issues on Github Issue. You can also request a pull to fix bugs and add frequently used features.



# License
Copyright © 2021 Jooyeon Lee Released under the MIT license.
