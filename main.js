'use strict'

const {
  app,
  components,
  BrowserWindow,
  BrowserView,
  dialog,
  ipcMain,
  Menu,
  nativeTheme,
  session,
  shell,
} = require('electron')
const contextMenu = require('electron-context-menu')
const fs = require('fs-extra')
let win
let index
let bv = []
const unzip = require('unzip-crx-3')
const downloadCRX = require('download-crx')
const { ElectronBlocker } = require('@cliqz/adblocker-electron')
const fetch = require('cross-fetch')
const Store = require('electron-store')
const store = new Store()
const path = require('path')
index = 0

const lang = store.get('lang') ? store.get('lang') : 'ja'
let t = JSON.parse(
  fs.readFileSync(`${__dirname}/src/assets/i18n/${lang}.json`, 'utf-8')
)

require('events').EventEmitter.defaultMaxListeners = 5000

contextMenu({
  prepend: (defaultActions, parameters, browserWindow) => [
    {
      label: t['back'],
      click: () => {
        bv[index].webContents.goBack()
      },
    },
    {
      label: t['forward'],
      click: () => {
        bv[index].webContents.goForward()
      },
    },
  ],
})

async function newtab() {
  let browserview = new BrowserView({
    webPreferences: {
      scrollBounce: true,
      preload: `${__dirname}/src/script/preload-browserview.js`,
    },
  })
  if (store.get('adblocker') === null) {
    store.set('adblocker', true)
  }
  if (store.get('suggest') === null) {
    store.set('suggest', true)
  }
  if (store.get('history') === null) {
    store.set('history', [])
  }
  if (store.get('bookmarks') == null) {
    store.set('bookmarks', [])
  }
  if (store.get('adblocker')) {
    ElectronBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
      blocker.enableBlockingInSession(browserview.webContents.session)
    })
    if (store.get('blockList')) {
      try {
        const blocker = await ElectronBlocker.fromLists(
          fetch,
          store.get('blockList')
        )
      } catch (e) {
        console.log(e)
      }
    }
  }
  browserview.webContents
    .executeJavaScript(`document.addEventListener('contextmenu',()=>{
    node.context();
  })`)
  browserview.webContents.on('did-start-loading', () => {
    browserview.webContents
      .executeJavaScript(`document.addEventListener('contextmenu',()=>{
      node.context();
    })`)
  })

  win.on('closed', () => {
    win = null
  })

  browserview.webContents.on('did-start-loading', () => {
    win.webContents.executeJavaScript(
      "document.getElementsByClassName('loading')[0].setAttribute('id','loading')"
    )
    browserview.webContents
      .executeJavaScript(`document.addEventListener('contextmenu',()=>{
      node.context();
    })`)
  })
  browserview.webContents.on('update-target-url', () => {
    browserview.webContents.executeJavaScript(`
          document.addEventListener('fullscreenchange', () => {
          if (document.fullscreenElement) {
            node.setFullscreen()
          } else {
            node.exitFullscreen()
          }
        })`)
    const link = browserview.webContents.getURL()
    if (
      link !== '' &&
      store.get('bookmarks').some((bookmark) => bookmark.includes(link))
    ) {
      win.webContents.executeJavaScript(`
        document.getElementById('fav-icon').src = 'assets/icons/star-fill.svg'
      `)
    } else {
      win.webContents.executeJavaScript(`
        document.getElementById('fav-icon').src = 'assets/icons/star.svg'
      `)
    }
  })
  browserview.webContents.on('did-finish-load', () => {
    win.webContents.executeJavaScript(
      `document.getElementsByClassName('loading')[0].setAttribute('id','loaded')`
    )
    if (
      browserview.webContents
        .getURL()
        .substring(
          browserview.webContents.getURL().indexOf('/') + 2,
          browserview.webContents.getURL().length
        )
        .slice(0, 1) != '/'
    ) {
      win.webContents.executeJavaScript(
        `document.getElementsByTagName('input')[0].value='${browserview.webContents.getURL()}'`
      )
    }
    const title = browserview.webContents.getTitle()
    const subed = title.length > 10 ? title.substring(0, 10) + '...' : title
    win.webContents.executeJavaScript(
      `document.getElementsByTagName('title')[0].innerText='${title} - Reamix';
      document.getElementById('opened').title='${title}';
      document.getElementById('opened').getElementsByTagName('p')[0].innerText='${subed}';
      if (!'${browserview.webContents.getURL()}'.startsWith('file:///')) {
        document.getElementById('opened').getElementsByTagName('img')[0].src='https://www.google.com/s2/favicons?domain=${browserview.webContents.getURL()}&sz=128';
      }`
    )
  })
  browserview.webContents.on('did-stop-loading', () => {
    win.webContents.executeJavaScript(
      "document.getElementsByClassName('loading')[0].removeAttribute('id')"
    )

    if (
      browserview.webContents
        .getURL()
        .substring(
          browserview.webContents.getURL().indexOf('/') + 2,
          browserview.webContents.getURL().length
        )
        .slice(0, 1) != '/'
    ) {
      win.webContents.executeJavaScript(
        `document.getElementsByTagName('input')[0].value='${browserview.webContents.getURL()}'`
      )
    }

    //強制ダークモード(Force-Dark)
    if (store.get('experimental.forcedark')) {
      browserview.webContents.insertCSS(`
        *{
          background-color: #202020!important;
        }
        *{
          color: #bbb!important;
        }
        a{
          color: #7aa7cd!important;
        }`)
    }
    //フォント変更
    if (store.get('experimental.changedfont')) {
      browserview.webContents.insertCSS(`
        body,body>*, *{
          font-family: ${store.get(
            'experimental.changedfont'
          )},'Noto Sans JP'!important;
        }`)
    }
  })

  //when the page title is updated (update the window title and tab title)
  browserview.webContents.on('page-title-updated', (e, t) => {
    win.webContents.executeJavaScript(
      `document.getElementsByTagName('title')[0].innerText='${t} - Reamix';
      document.querySelector('#opened>p').innerText='${t}';`
    )
    const link = browserview.webContents.getURL()
    const webstore = new RegExp(
      /^https?:\/\/chrome.google.com\/webstore\/.+?\/([a-z]{32})(?=[\/#?]|$)/
    )
    if (webstore.test(link)) {
      const extensionsDir = fs.readdirSync(`${__dirname}/src/extensions/`)
      if (extensionsDir.includes(webstore.exec(link)[1])) {
        browserview.webContents.executeJavaScript(`
          const button = '<style>a[aria-label="Reamix から削除"]{border:0;-webkit-border-radius:4px;border-radius:4px;-webkit-box-shadow:none;box-shadow:none;-webkit-box-sizing:border-box;box-sizing:border-box;color:#fff;font:500 14px Google Sans,Arial,sans-serif;height:36px;letter-spacing:.25px;padding:0;text-shadow:none;text-transform:none;user-select:none;padding:0;background-color:#1a73e8;background-image:none;border-color:#2d53af;display:inline-block}a[aria-label="Reamix から削除"]:hover{background:#174ea6;box-shadow:0 2px 1px -1px rgb(26 115 232 / 20%), 0 1px 1px 0 rgb(26 115 232 / 14%), 0 1px 3px 0 rgb(26 115 232 / 12%)}</style><a role="button" id="install" aria-label="Reamix から削除" tabindex="0"><div style="display:inline-block;width:100%;height:100%"><div style="margin:0 24px;align-items:center;display:flex;height:100%;justify-content:center;white-space:nowrap"><div style="max-width:270px;overflow:hidden;max-height:30px" class="webstore-test-button-label">Reamix から削除</div></div></div></div>';
          setTimeout(function(){
            document.querySelector('div[itemtype="http://schema.org/WebApplication"]>div:nth-child(3)>div:nth-of-type(2)').insertAdjacentHTML("afterbegin", button);
            document.getElementById("install").addEventListener('click', function(){
              node.removeExtension(location.href);
            })
          }, 3000);
        `)
      } else {
        browserview.webContents.executeJavaScript(`
          const button = '<style>a[aria-label="Reamix に追加"]{border:0;-webkit-border-radius:4px;border-radius:4px;-webkit-box-shadow:none;box-shadow:none;-webkit-box-sizing:border-box;box-sizing:border-box;color:#fff;font:500 14px Google Sans,Arial,sans-serif;height:36px;letter-spacing:.25px;padding:0;text-shadow:none;text-transform:none;user-select:none;padding:0;background-color:#1a73e8;background-image:none;border-color:#2d53af;display:inline-block}a[aria-label="Reamix に追加"]:hover{background:#174ea6;box-shadow:0 2px 1px -1px rgb(26 115 232 / 20%), 0 1px 1px 0 rgb(26 115 232 / 14%), 0 1px 3px 0 rgb(26 115 232 / 12%)}</style><a role="button" id="install" aria-label="Reamix に追加" tabindex="0"><div style="display:inline-block;width:100%;height:100%"><div style="margin:0 24px;align-items:center;display:flex;height:100%;justify-content:center;white-space:nowrap"><div style="max-width:270px;overflow:hidden;max-height:30px" class="webstore-test-button-label">Reamix に追加</div></div></div></div>';
          setTimeout(function(){
            document.querySelector('div[itemtype="http://schema.org/WebApplication"]>div:nth-child(3)>div:nth-of-type(2)').insertAdjacentHTML("afterbegin", button);
            document.getElementById("install").addEventListener('click', function(){
              node.installExtension(location.href);
            })
          }, 3000);
        `)
      }
    }
  })
  index = bv.length
  bv.push(browserview)
  win.addBrowserView(browserview)
  browserview.setBounds({ x: 40, y: 80, width: 960, height: 620 })
  browserview.setAutoResize({ width: true, height: true })
  browserview.setBackgroundColor('#ffffffff')
  browserview.webContents.loadFile(`${__dirname}/src/pages/home.html`)
  browserview.webContents.executeJavaScript(`
  let page = document.documentElement.innerHTML;
  document.documentElement.innerHTML = "";
  if (node.loadLang()[0]) {
    Object.keys(node.loadLang()[1]).forEach((item) => {
      page = page.replace(
        new RegExp('%' + item + '%', 'g'),
        node.loadLang()[1][item]
      )
      document.documentElement.innerHTML = page
    })
  }
  `)
  if (
    (nativeTheme.shouldUseDarkColors && store.get('theme') === '') ||
    store.get('theme') === 'dark'
  ) {
    win.webContents.executeJavaScript(`
      document.documentElement.classList.add("dark");
    `)
    browserview.webContents.executeJavaScript(`
      document.documentElement.classList.add("dark");
    `)
  }
  win.webContents.executeJavaScript(`
  document.getElementById('search').value='';
  `)
}

async function nw() {
  win = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 400,
    minHeight: 400,
    frame: false,
    transparent: false,
    backgroundColor: '#ffffff',
    title: 'Reamix',
    icon: `${__dirname}/src/image/logo.png`,
    webPreferences: {
      worldSafeExecuteJavaScript: true,
      nodeIntegration: false,
      contextIsolation: true,
      preload: `${__dirname}/src/script/preload.js`,
    },
  })

  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient('reamix', process.execPath, [
        path.resolve(process.argv[1]),
      ])
    }
  } else {
    app.setAsDefaultProtocolClient('reamix')
  }

  if (!app.isPackaged) {
    let devtools = null
    devtools = new BrowserWindow()
    win.webContents.setDevToolsWebContents(devtools.webContents)
    win.webContents.openDevTools({ mode: 'detach' })
  }

  if (fs.existsSync(`${__dirname}/src/extensions/`)) {
    const extensionsDir = fs.readdirSync(`${__dirname}/src/extensions/`)

    for (const extension of extensionsDir) {
      try {
        await session.defaultSession.loadExtension(
          `${__dirname}/src/extensions/${extension}`
        )
      } catch (e) {
        dialog.showErrorBox('Error', `${e}`)
      }
    }
  }

  win.loadFile(`${__dirname}/src/index.html`)
  newtab()
  if (store.get('startup') == true) {
    store.set('startup', false)
  }
}

app.whenReady().then(async () => {
  await components.whenReady()
  nw()
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
app.on('activate', () => {
  if (win === null) nw()
})

//ipc channels
ipcMain.handle('moveView', (e, link, index) => {
  let history = store.get('history') ? store.get('history') : []
  bv[index].webContents
    .executeJavaScript(`document.addEventListener('contextmenu',()=>{
    node.context();
  })`)
  if (link === '') {
    return true
  } else if (link === 'reamix://settings') {
    openPage('settings')
  } else if (link === 'reamix://about') {
    openPage('about')
  } else if (link === 'reamix://extensions') {
    openPage('extensions')
  } else if (link === 'reamix://favorites') {
    openPage('favorites')
  } else if (link === 'reamix://history') {
    openPage('history')
  } else if (link === 'reamix://downloads') {
    openPage('downloads')
  } else {
    // ユーザーエージェントの置き換え
    const currentUA = win.webContents.getUserAgent()
    const chromeUA = currentUA
      .replace(/reamix\/.*?.[0-9]\s/g, '')
      .replace(/Electron\/.*?.[0-9]\s/g, '')
    bv[index].webContents
      .loadURL(link, { userAgent: chromeUA })
      .then(() => {
        win.webContents.executeJavaScript(
          `document.getElementsByTagName('input')[0].value='${bv[
            index
          ].webContents.getURL()};'`
        )
        history.push([
          bv[index].webContents.getTitle(),
          bv[index].webContents.getURL(),
        ])
        store.set('history', history)
        const webstore = new RegExp(
          /^https?:\/\/chrome.google.com\/webstore\/.+?\/([a-z]{32})(?=[\/#?]|$)/
        )
        if (webstore.test(link)) {
          const extensionsDir = fs.readdirSync(`${__dirname}/src/extensions/`)
          if (extensionsDir.includes(webstore.exec(link)[1])) {
            bv[index].webContents.executeJavaScript(`
              const button = '<style>a[aria-label="Reamix から削除"]{border:0;-webkit-border-radius:4px;border-radius:4px;-webkit-box-shadow:none;box-shadow:none;-webkit-box-sizing:border-box;box-sizing:border-box;color:#fff;font:500 14px Google Sans,Arial,sans-serif;height:36px;letter-spacing:.25px;padding:0;text-shadow:none;text-transform:none;user-select:none;padding:0;background-color:#1a73e8;background-image:none;border-color:#2d53af;display:inline-block}a[aria-label="Reamix から削除"]:hover{background:#174ea6;box-shadow:0 2px 1px -1px rgb(26 115 232 / 20%), 0 1px 1px 0 rgb(26 115 232 / 14%), 0 1px 3px 0 rgb(26 115 232 / 12%)}</style><a role="button" id="install" aria-label="Reamix から削除" tabindex="0"><div style="display:inline-block;width:100%;height:100%"><div style="margin:0 24px;align-items:center;display:flex;height:100%;justify-content:center;white-space:nowrap"><div style="max-width:270px;overflow:hidden;max-height:30px" class="webstore-test-button-label">Reamix から削除</div></div></div></div>';
              setTimeout(function(){
                document.querySelector('div[itemtype="http://schema.org/WebApplication"]>div:nth-child(3)>div:nth-of-type(2)').insertAdjacentHTML("afterbegin", button);
                document.getElementById("install").addEventListener('click', function(){
                  node.removeExtension(location.href);
                })
              }, 1000);
            `)
          } else {
            bv[index].webContents.executeJavaScript(`
              const button = '<style>a[aria-label="Reamix に追加"]{border:0;-webkit-border-radius:4px;border-radius:4px;-webkit-box-shadow:none;box-shadow:none;-webkit-box-sizing:border-box;box-sizing:border-box;color:#fff;font:500 14px Google Sans,Arial,sans-serif;height:36px;letter-spacing:.25px;padding:0;text-shadow:none;text-transform:none;user-select:none;padding:0;background-color:#1a73e8;background-image:none;border-color:#2d53af;display:inline-block}a[aria-label="Reamix に追加"]:hover{background:#174ea6;box-shadow:0 2px 1px -1px rgb(26 115 232 / 20%), 0 1px 1px 0 rgb(26 115 232 / 14%), 0 1px 3px 0 rgb(26 115 232 / 12%)}</style><a role="button" id="install" aria-label="Reamix に追加" tabindex="0"><div style="display:inline-block;width:100%;height:100%"><div style="margin:0 24px;align-items:center;display:flex;height:100%;justify-content:center;white-space:nowrap"><div style="max-width:270px;overflow:hidden;max-height:30px" class="webstore-test-button-label">Reamix に追加</div></div></div></div>';
              setTimeout(function(){
                document.querySelector('div[itemtype="http://schema.org/WebApplication"]>div:nth-child(3)>div:nth-of-type(2)').insertAdjacentHTML("afterbegin", button);
                document.getElementById("install").addEventListener('click', function(){
                  node.installExtension(location.href);
                })
              }, 1000);
            `)
          }
        }
      })
      .catch((e) => {
        console.log(e)
        bv[index].webContents
          .loadFile(`${__dirname}/src/pages/notfound.html`)
          .then(() => {
            bv[index].webContents.executeJavaScript(`
              let page = document.documentElement.innerHTML;
              document.documentElement.innerHTML = "";
              if (node.loadLang()[0]) {
                Object.keys(node.loadLang()[1]).forEach((item) => {
                  page = page.replace(
                    new RegExp('%' + item + '%', 'g'),
                    node.loadLang()[1][item]
                  )
                  document.documentElement.innerHTML = page
                })
              }
              document.getElementsByTagName('span')[0].innerText='${link.toLowerCase()}';
          var requiredUrl='${link}';
        `)
            if (
              (nativeTheme.shouldUseDarkColors && store.get('theme') === '') ||
              store.get('theme') === 'dark'
            ) {
              bv[index].webContents.executeJavaScript(`
            document.documentElement.classList.add("dark");
          `)
            }
          })
        console.log(
          "The previous error is normal. It redirected to a page where the server couldn't be found."
        )
      })
  }
  if (
    link !== '' &&
    store.get('bookmarks').some((bookmark) => bookmark.includes(link))
  ) {
    win.webContents.executeJavaScript(`
      document.getElementById('fav-icon').src = 'assets/icons/star-fill.svg'
    `)
  } else {
    win.webContents.executeJavaScript(`
      document.getElementById('fav-icon').src = 'assets/icons/star.svg'
    `)
  }
})
ipcMain.handle('windowClose', () => {
  ipcMain.removeAllListeners()
  win.close()
})
ipcMain.handle('setFullscreen', () => {
  const { screen } = require('electron')
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.size
  win.webContents.insertCSS('html{display: none}')
  bv[index].setBounds({ x: 0, y: 0, width: width, height: height })
})
ipcMain.handle('exitFullscreen', () => {
  win.webContents.insertCSS('html{display: block}')
  bv[index].setBounds({ x: 40, y: 80, width: 960, height: 620 })
  win.setSize(1000, 700)
})
ipcMain.handle('windowMaximize', () => {
  win.maximize()
})
ipcMain.handle('windowMinimize', () => {
  win.minimize()
})
ipcMain.handle('windowUnmaximize', () => {
  win.unmaximize()
})
ipcMain.handle('installExtension', (e, url) => {
  const pattern =
    /^https?:\/\/chrome.google.com\/webstore\/.+?\/([a-z]{32})(?=[\/#?]|$)/
  const id = pattern.exec(url)
  downloadCRX
    .download(url, `${__dirname}/src/extensions/`, id[1])
    .then((filePath) => {
      unzip(filePath).then(async () => {
        await session.defaultSession.loadExtension(
          `${__dirname}/src/extensions/${id[1]}`,
          { allowFileAccess: true }
        )
        fs.unlinkSync(`${__dirname}/src/extensions/${id[1]}.crx`)
        dialog.showMessageBox(null, {
          type: 'info',
          icon: './src/image/logo.png',
          title: t['extensions'],
          message: t['success_install'],
        })
      })
    })
})
ipcMain.handle('removeExtension', (e, url) => {
  const pattern =
    /^https?:\/\/chrome.google.com\/webstore\/.+?\/([a-z]{32})(?=[\/#?]|$)/
  const id = pattern.exec(url)
  fs.remove(`${__dirname}/src/extensions/${id[1]}`, (err) => {
    if (err) throw err
    dialog.showMessageBox(null, {
      type: 'info',
      icon: './src/image/logo.png',
      title: t['extensions'],
      message: t['success_remove'],
    })
  })
})
ipcMain.handle('windowMaxMin', () => {
  if (win.isMaximized() == true) {
    win.unmaximize()
  } else {
    win.maximize()
  }
})
ipcMain.handle('moveViewBlank', (e, index) => {
  bv[index].webContents.loadURL(`file://${__dirname}/src/resource/blank.html`)
})
ipcMain.handle('reloadBrowser', (e, index) => {
  bv[index].webContents.reload()
  bv[index].webContents.executeJavaScript(`
  let page = document.documentElement.innerHTML;
  if (node.loadLang()[0]) {
    Object.keys(node.loadLang()[1]).forEach((item) => {
      page = page.replace(
        new RegExp('%' + item + '%', 'g'),
        node.loadLang()[1][item]
      )
      document.documentElement.innerHTML = page
    })
  }
  `)
  if (
    (nativeTheme.shouldUseDarkColors && store.get('theme') === '') ||
    store.get('theme') === 'dark'
  ) {
    win.webContents.executeJavaScript(`
      document.documentElement.classList.add("dark");
    `)
    bv[index].webContents.executeJavaScript(`
      document.documentElement.classList.add("dark");
    `)
  }
})
ipcMain.handle('browserBack', (e, index) => {
  bv[index].webContents.goBack()
  if (
    bv[index].webContents
      .getURL()
      .substring(
        bv[index].webContents.getURL().indexOf('/') + 2,
        bv[index].webContents.getURL().length
      )
      .slice(0, 1) != '/'
  ) {
    win.webContents.executeJavaScript(
      `document.getElementsByTagName('input')[0].value='${bv[
        index
      ].webContents.getURL()}'`
    )
  }
})
ipcMain.handle('browserGoes', (e, index) => {
  bv[index].webContents.goForward()
})
ipcMain.handle('getBrowserUrl', (e, index) => {
  return bv[index].webContents.getURL()
})
ipcMain.handle('openCustomCSS', () => {
  shell.openPath(path.join(__dirname, 'src/assets/styles/custom.css'))
})
ipcMain.handle('openCustomSettingCSS', () => {
  shell.openPath(path.join(__dirname, 'src/assets/styles/custom_setting.css'))
})
ipcMain.handle('moveToNewTab', (e, index) => {
  bv[index].webContents.loadFile(`${__dirname}/src/pages/home.html`)
  bv[index].webContents.executeJavaScript(`
  let page = document.documentElement.innerHTML;
  document.documentElement.innerHTML = "";
  if (node.loadLang()[0]) {
    Object.keys(node.loadLang()[1]).forEach((item) => {
      page = page.replace(
        new RegExp('%' + item + '%', 'g'),
        node.loadLang()[1][item]
      )
      document.documentElement.innerHTML = page
    })
  }
  `)
  win.webContents.executeJavaScript(`
    document.getElementById('search').value = "";
    document.getElementById('fav-icon').src = 'assets/icons/star.svg'
  `)
  if (
    (nativeTheme.shouldUseDarkColors && store.get('theme') === '') ||
    store.get('theme') === 'dark'
  ) {
    bv[index].webContents.executeJavaScript(`
      document.documentElement.classList.add("dark");
    `)
  }
})
ipcMain.handle('context', () => {
  menu.popup()
})
ipcMain.handle('newtab', () => {
  newtab()
})
ipcMain.handle('tabMove', (e, i) => {
  index = i < 0 ? bv.length - 1 : i
  win.setTopBrowserView(bv[index])
  win.webContents.executeJavaScript(`
    if ('${bv[index].webContents.getURL()}'.includes('https')) {
      document.getElementById('search').value='${bv[
        index
      ].webContents.getURL()}';
    } else {
        document.getElementById('search').value='';
    }
    document.getElementsByTagName('title')[0].innerText='${bv[
      index
    ].webContents.getTitle()} - Reamix';
    `)
})
ipcMain.handle('moveTab', (e, before, after) => {
  if (before > after) {
    let current = bv[before]
    for (let i = 0; i < before - after; i++) {
      bv[before - i] = bv[before - i - 1]
    }
    bv[after] = current
  } else if (after > before) {
    let current = bv[before]
    for (let i = 0; i < after - before; i++) {
      bv[before + i] = bv[before + i + 1]
    }
    bv[after] = current
  }
})
ipcMain.handle('removeTab', (e, i) => {
  try {
    win.removeBrowserView(bv[i])
    bv[i].webContents.forcefullyCrashRenderer()
    bv.splice(i, 1)
  } catch (e) {
    return true
  }
})
ipcMain.handle('open', (e, name) => {
  openPage(name)
  if (
    store
      .get('bookmarks')
      .some((bookmark) => bookmark.includes(`reamix://${name}`))
  ) {
    win.webContents.executeJavaScript(`
      document.getElementById('fav-icon').src = 'assets/icons/star-fill.svg'
    `)
  } else {
    win.webContents.executeJavaScript(`
      document.getElementById('fav-icon').src = 'assets/icons/star.svg'
    `)
  }
})
ipcMain.handle('saveFav', (e, name, link) => {
  const list = [name, link]
  let fav = store.get('bookmarks')
  fav.push(list)
  store.set('bookmarks', fav)
})
ipcMain.handle('restart', () => {
  app.relaunch()
  app.exit()
})
ipcMain.handle('setBlockList', (e, list) => {
  store.set('blockList', list)
})

const openPage = (name) => {
  bv[index].webContents.loadFile(`${__dirname}/src/pages/${name}.html`)
  bv[index].webContents.executeJavaScript(`
  let page = document.documentElement.innerHTML;
  document.documentElement.innerHTML = "";
  if (node.loadLang()[0]) {
    Object.keys(node.loadLang()[1]).forEach((item) => {
      page = page.replace(
        new RegExp('%' + item + '%', 'g'),
        node.loadLang()[1][item]
      )
      document.documentElement.innerHTML = page
    })
  }
  `)
  win.webContents.executeJavaScript(`
    document.getElementById('search').value = "reamix://${name}"
  `)
  if (
    (nativeTheme.shouldUseDarkColors && store.get('theme') === '') ||
    store.get('theme') === 'dark'
  ) {
    bv[index].webContents.executeJavaScript(`
      document.documentElement.classList.add("dark");
    `)
  }
}

let menu = Menu.buildFromTemplate([
  {
    label: t['view'],
    submenu: [
      {
        type: 'separator',
      },
      {
        role: 'togglefullscreen',
        accelerator: 'F11',
        label: t['fullscreen'],
      },
      {
        role: 'hide',
        label: t['hide'],
      },
      {
        role: 'hideothers',
        label: t['hide_others'],
      },
      {
        label: t['quit'],
        role: 'quit',
        accelerator: 'CmdOrCtrl+Q',
      },
    ],
  },
  {
    label: t['move'],
    submenu: [
      {
        label: t['reload'],
        accelerator: 'CmdOrCtrl+R',
        click: () => {
          bv[index].webContents.reload()
        },
      },
      {
        label: t['back'],
        accelerator: 'CmdOrCtrl+Alt+Z',
        click: () => {
          bv[index].webContents.goBack()
        },
      },
      {
        label: t['forward'],
        accelerator: 'CmdOrCtrl+Alt+X',
        click: () => {
          bv[index].webContents.goForward()
        },
      },
      {
        label: t['close_tab'],
        accelerator: 'CmdOrCtrl+W',
        click: () => {
          win.webContents.executeJavaScript(`
            if (document.querySelectorAll('span.tab').length > 1) {
              let elements = document.querySelectorAll('.tab')
              const element = document.getElementById('opened')
              elements = [].slice.call(elements)
              const index = elements.indexOf(element)
              element.remove()
              node.removeTab(index)
              const lasttab = document.querySelector('.tab:last-child')
              node.tabMove(-1)
              setTimeout(() => {
                lasttab.setAttribute('id', 'opened')
              }, 1)
            } else {
              node.winClose()
            }
          `)
        },
      },
    ],
  },
  {
    label: t['edit'],
    submenu: [
      {
        label: t['cut'],
        role: 'cut',
      },
      {
        label: t['copy'],
        role: 'copy',
      },
      {
        label: t['paste'],
        role: 'paste',
      },
    ],
  },
  {
    label: t['window'],
    submenu: [
      {
        label: t['about'],
        accelerator: 'CmdOrCtrl+Alt+A',
        click: () => {
          openPage('about')
        },
      },
      {
        label: t['settings'],
        accelerator: 'CmdOrCtrl+Alt+S',
        click: () => {
          openPage('settings')
        },
      },
      {
        label: t['extensions'],
        accelerator: 'CmdOrCtrl+Alt+E',
        click: () => {
          openPage('extensions')
        },
      },
    ],
  },
  {
    label: t['dev'],
    submenu: [
      {
        label: t['dev_tools'],
        accelerator: 'F12',
        click: () => {
          bv[index].webContents.toggleDevTools()
        },
      },
      {
        label: t['reamix_dev_tools'],
        accelerator: 'Alt+F12',
        click: () => {
          win.webContents.toggleDevTools()
        },
      },
    ],
  },
])
Menu.setApplicationMenu(menu)
