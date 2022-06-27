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
      {
        target: 'appx',
        arch: ['x64'],
      },
    ],
    artifactName: '${productName}_${version}_setup.${ext}',
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    deleteAppDataOnUninstall: false,
    uninstallDisplayName: '${productName}',
  },
  portable: {
    artifactName: '${productName}_${version}_portable.${ext}',
  },
  appx: {
    artifactName: '${productName}_${version}_appx.${ext}',
    identityName: '9563VCborn.Reamix',
    applicationId: 'VCborn.Reamix',
    publisherDisplayName: 'VCborn',
    publisher: 'CN=B3A8E69F-3C5C-42C5-ABA9-66E62B6A401D',
    languages: ['JA-JP', 'EN-US', 'ZH-CN'],
  },
  mac: {
    icon: 'src/assets/images/logo.icns',
    target: ['dmg'],
    artifactName: '${productName}_${version}_x86_64.${ext}',
  },
  dmg: {
    background: "src/assets/images/background.tiff",
    window: {
        width: 540,
        height: 380
    }
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
      {
        target: 'snap',
        arch: ['x64'],
      },
    ],
  },
  snap: {
    artifactName: '${productName}_${version}_${arch}.${ext}',
    summary: 'Simple and useful browser made by Electron',
    title: 'Reamix',
    category: 'Utility',
    synopsis: 'Reamix ${version}',
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
