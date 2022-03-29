const { contextBridge, ipcRenderer } = require('electron')
const fs = require('fs-extra')

contextBridge.exposeInMainWorld('node', {
  loadTheme: () => {
    let obj = JSON.parse(
      fs.readFileSync(`${__dirname}/../config/config.mncfg`, 'utf-8')
    )
    return [
      obj.theme,
      window.matchMedia('(prefers-color-scheme: dark)').matches,
    ]
  },
  loadLang: () => {
    let obj = JSON.parse(
      fs.readFileSync(`${__dirname}/../config/config.mncfg`, 'utf-8')
    )
    let langJson = JSON.parse(
      fs.readFileSync(`${__dirname}/../i18n/${obj.lang}.json`, 'utf-8')
    )
    return [obj.lang, langJson]
  },
  loadExtension: () => {
    if (fs.existsSync(`${__dirname}/../extensions/`)) {
      const extensionsDir = fs.readdirSync(`${__dirname}/../extensions/`)
      return extensionsDir
    }
    return []
  },
  extensionInfo: (id) => {
    let manifest = JSON.parse(
      fs.readFileSync(`${__dirname}/../extensions/${id}/manifest.json`, 'utf-8')
    )
    return [
      manifest['name'],
      `${__dirname}/../extensions/${id}/${manifest['icons']['32']}`,
    ]
  },
  removeExtension: (id) => {
    ipcRenderer.send(
      'removeExtension',
      `https://chrome.google.com/webstore/detail/example/${id}`
    )
  },
})
