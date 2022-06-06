'use strict'

const { contextBridge, ipcRenderer } = require('electron')
const fs = require('fs-extra')
const Store = require('electron-store')
const store = new Store()

contextBridge.exposeInMainWorld('node', {
  context: () => {
    ipcRenderer.invoke('context')
  },
  loadTheme: () => {
    if (window.location.href.includes('file:///')) {
      const theme = store.get('theme') ? store.get('theme') : 'light'
      return [theme, window.matchMedia('(prefers-color-scheme: dark)').matches]
    } else {
      return false
    }
  },
  loadLang: () => {
    if (window.location.href.includes('file:///')) {
      const lang = store.get('lang') ? store.get('lang') : 'ja'
      let langJson = JSON.parse(
        fs.readFileSync(`${__dirname}/../assets/i18n/${lang}.json`, 'utf-8')
      )
      return [lang, langJson]
    } else {
      return false
    }
  },
  openSettings: () => {
    if (window.location.href.includes('file:///')) {
      ipcRenderer.invoke('openSettings')
    } else {
      return false
    }
  },
  installExtension: (url) => {
    if (window.location.href.includes('https://chrome.google.com')) {
      ipcRenderer.invoke('installExtension', url)
    }
  },
  removeExtension: (url) => {
    if (
      window.location.href.includes('https://chrome.google.com') ||
      window.location.href.includes('file:///')
    ) {
      ipcRenderer.invoke('removeExtension', url)
    }
  },
  changeSettings: (key, value) => {
    if (window.location.href.includes('file:///')) {
      store.set(key, value)
    }
  },
  getSettings: (key) => {
    if (window.location.href.includes('file:///')) {
      return store.get(key)
    }
  },
  loadExtension: () => {
    if (window.location.href.includes('file:///')) {
      if (fs.existsSync(`${__dirname}/../extensions/`)) {
        const extensionsDir = fs.readdirSync(`${__dirname}/../extensions/`)
        return extensionsDir
      }
      return []
    }
  },
  extensionInfo: (id) => {
    if (window.location.href.includes('file:///')) {
      let manifest = JSON.parse(
        fs.readFileSync(
          `${__dirname}/../extensions/${id}/manifest.json`,
          'utf-8'
        )
      )
      return [
        manifest['name'],
        `${__dirname}/../extensions/${id}/${manifest['icons']['128']}`,
      ]
    }
  },
  load: (name) => {
    if (window.location.href.includes('file:///')) {
      return store.get(name).reverse()
    }
  },
  remove: (type, name, link) => {
    if (window.location.href.includes('file:///')) {
      let list = store.get(type)
      const newlist = list.filter((n) => n[1] !== link)
      store.set(type, newlist)
    }
  },
  deleteAll: () => {
    if (window.location.href.includes('file:///')) {
      store.set('history', [])
    }
  },
  restart: () => {
    ipcRenderer.invoke("restart")
  },
  setBlockList: (list) => {
    ipcRenderer.invoke("setBlockList", list)
  },
})
