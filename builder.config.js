/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
module.exports = {
  appId: 'com.vcborn.reamix',
  productName: 'reamix',
  copyright: 'Copyright © 2021 ${author}',
  asar: true,
  directories: {
    output: 'release/${version}',
    buildResources: 'resources',
  },
  files: [
    '!.git',
    '!.dist',
    'node_modules',
    'src',
    'main.js',
    'package-lock.json',
    'package.json',
  ],
  win: {
    icon: 'src/assets/images/logo.ico',
    target: [
      {
        target: 'portable',
        arch: ['x64'],
      },
      {
        target: 'nsis',
        arch: ['x64'],
      },
    ],
    artifactName: '${productName}_${version}_setup.${ext}',
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    deleteAppDataOnUninstall: false,
  },
  portable: {
    artifactName: '${productName}_${version}_portable.${ext}',
  },
  mac: {
    icon: 'src/assets/images/logo.icns',
    target: ['dmg'],
    artifactName: '${productName}_${version}_x86_64.${ext}',
  },
  linux: {
    icon: 'src/assets/images/logo.icns',
    target: [
      { target: 'appImage', arch: ['x64'] },
      {
        target: 'deb',
        arch: ['x64', 'arm64'],
      },
      {
        target: 'rpm',
        arch: ['x64'],
      },
    ],
  },
  appImage: {
    artifactName: '${productName}_${version}_${arch}.${ext}',
    category: 'Utility',
    synopsis: 'Reamix ${version}',
  },
  deb: {
    artifactName: '${productName}_${version}_${arch}.${ext}',
    category: 'Utility',
    synopsis: 'Reamix ${version}',
  },
  rpm: {
    artifactName: '${productName}-${version}.${arch}.${ext}',
    category: 'Utility',
    synopsis: 'Reamix v1.0.0-beta6.2',
  },
}