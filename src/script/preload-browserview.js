const { contextBridge, ipcRenderer } = require('electron')
const fs = require('fs')

contextBridge.exposeInMainWorld('node', {
  context: () => {
    ipcRenderer.send('context')
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
  getEngineURL: () => {
    let file = fs.readFileSync(`${__dirname}/../config/engines.mncfg`, 'utf-8')
    let obj = JSON.parse(file)
    return obj.values[obj.engine]
  },
  openSettings: () => {
    ipcRenderer.send('openSettings')
  },
})
