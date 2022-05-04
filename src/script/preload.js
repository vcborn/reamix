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
    ipcRenderer.send('windowClose')
  },
  winMinimize: () => {
    //Minimize Window
    ipcRenderer.send('windowMinimize')
  },
  winMaximize: () => {
    //Maximize Window
    ipcRenderer.send('windowMaximize')
  },
  winUnmaximize: () => {
    //Unmaximize Window
    ipcRenderer.send('windowUnmaximize')
  },
  maxMin: () => {
    //Maximize or Minimize Window
    ipcRenderer.send('windowMaxMin')
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
      word.toLowerCase().substring(0, 6) == 'http:/' ||
      word.toLowerCase().substring(0, 7) == 'https:/'
    ) {
      if (word.indexOf(' ') == -1) {
        ipcRenderer.send('moveView', word, index)
      } else {
        ipcRenderer.send('moveView', engine + word, index)
      }
    } else if (word.indexOf(' ') == -1 && word.indexOf('.') != -1) {
      ipcRenderer.send('moveView', `http://${word}`, index)
    } else if (
      word.toLowerCase() === 'reamix://settings' ||
      word.toLowerCase() === 'reamix://about' ||
      word.toLowerCase() === 'reamix://extensions'
    ) {
      ipcRenderer.send('moveView', word, index)
    } else {
      ipcRenderer.send('moveView', engine + word, index)
    }
  },
  moveToNewTab: (index) => {
    //move to new tab
    ipcRenderer.send('moveToNewTab', index)
  },
  reloadBrowser: (index) => {
    //reload current BrowserView
    ipcRenderer.send('reloadBrowser', index)
  },
  backBrowser: (index) => {
    //back current BrowserView
    ipcRenderer.send('browserBack', index)
  },
  goBrowser: (index) => {
    //go current BrowserView
    ipcRenderer.send('browserGoes', index)
  },
  dirName: () => {
    return __dirname
  },
  openSettings: () => {
    //open options (settings) window
    ipcRenderer.send('openSettings')
  },
  openExtensions: () => {
    ipcRenderer.send('openExtensions')
  },
  newtab: () => {
    //create new tab
    ipcRenderer.send('newtab')
  },
  tabMove: (index) => {
    //move tab
    ipcRenderer.send('tabMove', index)
  },
  removeTab: (index) => {
    //remove tab
    ipcRenderer.send('removeTab', index)
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
  loadHistory: () => {
    return store.get('history')
  },
  loadFavorites: () => {
    return store.get('favorites')
  },
})
