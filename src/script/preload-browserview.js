'use strict'

const { contextBridge, ipcRenderer } = require('electron')
const fs = require('fs-extra')
const Store = require('electron-store')
const store = new Store()

contextBridge.exposeInMainWorld('node', {
  context: () => {
    ipcRenderer.send('context')
  },
  loadTheme: () => {
    const theme = store.get('theme') ? store.get('theme') : 'light'
    return [theme, window.matchMedia('(prefers-color-scheme: dark)').matches]
  },
  loadLang: () => {
    const lang = store.get('lang') ? store.get('lang') : 'ja'
    let langJson = JSON.parse(
      fs.readFileSync(`${__dirname}/../assets/i18n/${lang}.json`, 'utf-8')
    )
    return [lang, langJson]
  },
  getEngineURL: () => {
    let file = fs.readFileSync(`${__dirname}/../config/engines.mncfg`, 'utf-8')
    let obj = JSON.parse(file)
    return obj.values[obj.engine]
  },
  openSettings: () => {
    ipcRenderer.send('openSettings')
  },
  installExtension: (url) => {
    ipcRenderer.send('installExtension', url)
  },
  removeExtension: (url) => {
    ipcRenderer.send('removeExtension', url)
  },
  changeSettings: (key, value) => {
    store.set(key, value)
  },
  getSettings: (key) => {
    return store.get(key)
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
      `${__dirname}/../extensions/${id}/${manifest['icons']['128']}`,
    ]
  },
  removeExtension: (id) => {
    ipcRenderer.send(
      'removeExtension',
      `https://chrome.google.com/webstore/detail/example/${id}`
    )
  },
  load: (name) => {
    return store.get(name).reverse()
  },
  remove: (type, name, link) => {
    let list = store.get(type)
    const newlist = list.filter((n) => n[1] !== link)
    store.set(type, newlist)
  },
  deleteAll: () => {
    store.set('history', [])
  },
})
