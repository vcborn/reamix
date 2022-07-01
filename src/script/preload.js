'use strict'

const { contextBridge, ipcRenderer } = require('electron')
const fs = require('fs-extra')
const Store = require('electron-store')
const store = new Store()

contextBridge.exposeInMainWorld('node', {
  loadLang: () => {
    const lang = store.get('lang') ? store.get('lang') : 'ja'
    let langJson = JSON.parse(
      fs.readFileSync(`${__dirname}/../assets/i18n/${lang}.json`, 'utf-8')
    )
    return [lang, langJson]
  },
  winClose: () => {
    //Close window
    ipcRenderer.invoke('windowClose')
  },
  winMinimize: () => {
    //Minimize Window
    ipcRenderer.invoke('windowMinimize')
  },
  winMaximize: () => {
    //Maximize Window
    ipcRenderer.invoke('windowMaximize')
  },
  winUnmaximize: () => {
    //Unmaximize Window
    ipcRenderer.invoke('windowUnmaximize')
  },
  maxMin: () => {
    //Maximize or Minimize Window
    ipcRenderer.invoke('windowMaxMin')
  },
  moveBrowser: (word, index) => {
    //Page navigation
    const value = store.get('engine') ? store.get('engine') : 'google'
    const engines = {
      google: 'https://www.google.co.jp/search?q=',
      'yahoo-jp': 'https://search.yahoo.co.jp/search?p=',
      bing: 'https://www.bing.com/search?q=',
      duckduckgo: 'https://duckduckgo.com/?q=',
    }
    const engine = engines[value]

    if (
      word.toLowerCase().substring(0, 6) === 'http:/' ||
      word.toLowerCase().substring(0, 7) === 'https:/'
    ) {
      if (word.indexOf(' ') === -1) {
        ipcRenderer.invoke('moveView', word, index)
      } else {
        ipcRenderer.invoke('moveView', engine + word, index)
      }
    } else if (word.indexOf(' ') === -1 && word.indexOf('.') != -1) {
      ipcRenderer.invoke('moveView', `http://${word}`, index)
    } else if (
      word.toLowerCase() === 'reamix://settings' ||
      word.toLowerCase() === 'reamix://about' ||
      word.toLowerCase() === 'reamix://extensions' ||
      word.toLowerCase() === 'reamix://favorites' ||
      word.toLowerCase() === 'reamix://history' ||
      word.toLowerCase() === 'reamix://downloads'
    ) {
      ipcRenderer.invoke('moveView', word, index)
    } else {
      ipcRenderer.invoke('moveView', engine + word, index)
    }
  },
  moveToNewTab: (index) => {
    //move to new tab
    ipcRenderer.invoke('moveToNewTab', index)
  },
  reloadBrowser: (index) => {
    //reload current BrowserView
    ipcRenderer.invoke('reloadBrowser', index)
  },
  backBrowser: (index) => {
    //back current BrowserView
    ipcRenderer.invoke('browserBack', index)
  },
  goBrowser: (index) => {
    //go current BrowserView
    ipcRenderer.invoke('browserGoes', index)
  },
  dirName: () => {
    return __dirname
  },
  open: (name) => {
    ipcRenderer.invoke('open', name)
  },
  newtab: () => {
    //create new tab
    ipcRenderer.invoke('newtab')
  },
  moveTab: (before, after) => {
    ipcRenderer.invoke('moveTab', before, after)
  },
  tabMove: (index) => {
    //move tab
    ipcRenderer.invoke('tabMove', index)
  },
  removeTab: (index) => {
    //remove tab
    ipcRenderer.invoke('removeTab', index)
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
  saveFav: (name, link) => {
    ipcRenderer.invoke('saveFav', name, link)
  },
})
