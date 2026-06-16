/* eslint-disable no-template-curly-in-string */
import type { Configuration } from 'electron-builder';
import dotenv from 'dotenv';
import packageJson from '../../package.json' with { type: 'json' };

dotenv.config();

const config: Configuration = {
  productName: packageJson.name,
  appId: packageJson.appId,
  asar: true,
  extends: null,
  compression: 'maximum',
  artifactName: '${productName} ${version}_${arch}.${ext}',
  copyright: `ⓒ ${new Date().getFullYear()} ${packageJson.author}`,
  directories: {
    buildResources: './buildAssets/installer/',
    output: './release/${version}'
  },
  files: [
    /* A list of files not to be included in the build. */
    /*
      (Required) The files and folders listed below should not be included in the build.
    */
    'dist/**/*',
    '!dist/main/index.dev.js',
    '!docs/**/*',
    '!tests/**/*',
    '!release/**/*'
  ],
  mac: {
    bundleVersion: '1.0',
    hardenedRuntime: true,
    gatekeeperAssess: false,
    notarize: false,
    icon: 'buildAssets/installer/icon.icns',
    type: 'distribution',
    // TODO: Notarize for macOS
    identity: null,
    target: [
      {
        target: 'dmg',
        arch: ['x64', 'arm64', 'universal']
      }
    ]
  },
  dmg: {
    contents: [
      {
        x: 410,
        y: 150,
        type: 'link',
        path: '/Applications'
      },
      {
        x: 130,
        y: 150,
        type: 'file'
      }
    ],
    sign: false
  },
  win: {
    icon: './buildAssets/installer/icon.ico',
    target: [
      {
        target: 'appx',
        arch: 'x64'
      },
      {
        target: 'zip',
        arch: 'x64'
      },
      {
        target: 'portable',
        arch: 'x64'
      },
      {
        target: 'nsis',
        arch: 'x64'
      }
    ]
  },
  portable: {
    artifactName: '${productName} ${version}_${arch} Portable.${ext}'
  },
  nsis: {
    oneClick: true
  },
  linux: {
    executableName: packageJson.name.toLowerCase(),
    icon: 'buildAssets/installer',
    category: 'Utility',
    target: [
      {
        target: 'snap',
        arch: 'x64'
      },
      {
        target: 'deb',
        arch: 'x64'
      },
      {
        target: 'rpm',
        arch: 'x64'
      }
    ]
  }
};

export default config;
