const {
  app,
  BrowserWindow,
  BrowserView,
  dialog,
  ipcMain,
  Menu,
  nativeTheme,
} = require('electron')
const contextMenu = require('electron-context-menu')
const fs = require('fs')
let win, setting
var index
var bv = []
let viewY = 66
index = 0

require('events').EventEmitter.defaultMaxListeners = 50

contextMenu({
  prepend: (defaultActions, parameters, browserWindow) => [
    {
      label: '戻る',
      click: () => {
        bv[index].webContents.goBack()
      },
    },
    {
      label: '進む',
      click: () => {
        bv[index].webContents.goForward()
      },
    },
    {
      label: '設定',
      click: () => {
        setting = new BrowserWindow({
          width: 760,
          height: 480,
          minWidth: 300,
          minHeight: 270,
          autoHideMenuBar: true,
          webPreferences: {
            preload: `${__dirname}/src/setting/preload.js`,
            scrollBounce: true,
          },
        })
        setting.loadFile(`${__dirname}/src/setting/index.html`)
      },
    },
  ],
})

//creating new tab function
function newtab() {
  let winSize = win.getSize()
  //create new tab
  let browserview = new BrowserView({
    webPreferences: {
      scrollBounce: true,
      preload: `${__dirname}/src/script/preload-browserview.js`,
    },
  })
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

  //window's behavior
  win.on('closed', () => {
    win = null
  })
  win.on('maximize', () => {
    winSize = win.getContentSize()
    browserview.setBounds({
      x: 0,
      y: viewY,
      width: winSize[0],
      height: winSize[1] - viewY + 3,
    })
  })
  win.on('unmaximize', () => {
    winSize = win.getContentSize()
    browserview.setBounds({
      x: 0,
      y: viewY,
      width: winSize[0],
      height: winSize[1] - viewY,
    })
  })
  win.on('enter-full-screen', () => {
    winSize = win.getContentSize()
    browserview.setBounds({
      x: 0,
      y: viewY,
      width: winSize[0],
      height: winSize[1] - viewY + 2,
    })
  })

  browserview.webContents.on('did-start-loading', () => {
    win.webContents.executeJavaScript(
      "document.getElementsByTagName('yomikomi-bar')[0].setAttribute('id','loading')"
    )
    browserview.webContents
      .executeJavaScript(`document.addEventListener('contextmenu',()=>{
      node.context();
    })`)
  })
  browserview.webContents.on('did-finish-load', () => {
    win.webContents.executeJavaScript(
      `document.getElementsByTagName('yomikomi-bar')[0].setAttribute('id','loaded')`
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
        `document.getElementsByTagName('input')[0].value='${browserview.webContents
          .getURL()
          .substring(
            browserview.webContents.getURL().indexOf('/') + 2,
            browserview.webContents.getURL().length
          )}'`
      )
    }
    win.webContents.executeJavaScript(
      `document.getElementsByTagName('title')[0].innerText='${browserview.webContents.getTitle()} - Reamix';
      document.getElementById('opened').getElementsByTagName('a')[0].innerText='${browserview.webContents.getTitle()}';`
    )
  })
  browserview.webContents.on('did-stop-loading', () => {
    win.webContents.executeJavaScript(
      "document.getElementsByTagName('yomikomi-bar')[0].removeAttribute('id')"
    )

    //ifの条件が糞長いのが気になる。これはただただアドレスバーにURL出力してるだけ。
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
        `document.getElementsByTagName('input')[0].value='${browserview.webContents
          .getURL()
          .substring(
            browserview.webContents.getURL().indexOf('/') + 2,
            browserview.webContents.getURL().length
          )}'`
      )
    }

    //強制ダークモード(Force-Dark)
    if (
      JSON.parse(
        fs.readFileSync(`${__dirname}/src/config/config.mncfg`, 'utf-8')
      ).experiments.forceDark == true
    ) {
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
    if (
      JSON.parse(
        fs.readFileSync(`${__dirname}/src/config/config.mncfg`, 'utf-8')
      ).experiments.fontChange == true
    ) {
      browserview.webContents.insertCSS(`
        body,body>*, *{
          font-family: ${
            JSON.parse(
              fs.readFileSync(`${__dirname}/src/config/config.mncfg`, 'utf-8')
            ).experiments.changedfont
          },'Noto Sans JP'!important;
        }`)
    }
  })

  //when the page title is updated (update the window title and tab title)
  browserview.webContents.on('page-title-updated', (e, t) => {
    win.webContents.executeJavaScript(
      `document.getElementsByTagName('title')[0].innerText='${t} - Reamix';
      document.getElementsByTagName('span')[getCurrent()].getElementsByTagName('a')[0].innerText='${t}';`
    )
  })
  index = bv.length
  bv.push(browserview)
  win.addBrowserView(browserview)
  browserview.setBounds({
    x: 0,
    y: viewY,
    width: winSize[0],
    height: winSize[1] - viewY,
  })
  browserview.setAutoResize({ width: true, height: true })
  browserview.webContents.loadURL(`file://${__dirname}/src/resource/index.html`)
  browserview.webContents.executeJavaScript(`
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
    (nativeTheme.shouldUseDarkColors &&
      JSON.parse(
        fs.readFileSync(`${__dirname}/src/config/config.mncfg`, 'utf-8')
      ).theme === '') ||
    JSON.parse(fs.readFileSync(`${__dirname}/src/config/config.mncfg`, 'utf-8'))
      .theme === 'dark'
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

function nw() {
  //create window
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
  win.loadFile(`${__dirname}/src/index.html`)
  //create tab
  newtab()
  let configObj = JSON.parse(
    fs.readFileSync(`${__dirname}/src/config/config.mncfg`, 'utf-8')
  )
  if (configObj.startup == true) {
    configObj.startup = false
    function exists(path) {
      try {
        fs.readFileSync(path, 'utf-8')
        return true
      } catch (e) {
        return false
      }
    }
    if (exists(`/mncr/applications.mncfg`)) {
      let obj = JSON.parse(fs.readFileSync(`/mncr/applications.mncfg`, 'utf-8'))
      obj.monot = ['v1.0.0-beta.6.2', '6']
      fs.writeFileSync(`/mncr/applications.mncfg`, JSON.stringify(obj))
    } else {
      fs.mkdir('/mncr/', () => {
        return true
      })
      let obj = { monot: ['v1.0.0-beta.6.2', '6'] }
      fs.writeFileSync(`/mncr/applications.mncfg`, JSON.stringify(obj))
    }
    fs.writeFileSync(
      `${__dirname}/src/config/config.mncfg`,
      JSON.stringify(configObj)
    )
  }
}

app.on('ready', nw)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
app.on('activate', () => {
  if (win === null) nw()
})

//ipc channels
ipcMain.on('moveView', (e, link, index) => {
  bv[index].webContents
    .executeJavaScript(`document.addEventListener('contextmenu',()=>{
    node.context();
  })`)
  if (link == '') {
    return true
  } else {
    bv[index].webContents
      .loadURL(link)
      .then(() => {
        win.webContents.executeJavaScript(
          `document.getElementsByTagName('input')[0].value='${bv[
            index
          ].webContents
            .getURL()
            .substring(
              bv[index].webContents.getURL().indexOf('/') + 2,
              bv[index].webContents.getURL().length
            )}'`
        )
      })
      .catch(() => {
        bv[index].webContents
          .loadURL(`file://${__dirname}/src/resource/server-notfound.html`)
          .then(() => {
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
              document.getElementsByTagName('span')[0].innerText='${link.toLowerCase()}';
          var requiredUrl='${link}';
        `)
          })
        console.log(
          "The previous error is normal. It redirected to a page where the server couldn't be found."
        )
      })
  }
})
ipcMain.on('windowClose', () => {
  win.close()
})
ipcMain.on('windowMaximize', () => {
  win.maximize()
})
ipcMain.on('windowMinimize', () => {
  win.minimize()
})
ipcMain.on('windowUnmaximize', () => {
  win.unmaximize()
})
ipcMain.on('windowMaxMin', () => {
  if (win.isMaximized() == true) {
    win.unmaximize()
  } else {
    win.maximize()
  }
})
ipcMain.on('moveViewBlank', (e, index) => {
  bv[index].webContents.loadURL(`file://${__dirname}/src/resource/blank.html`)
})
ipcMain.on('reloadBrowser', (e, index) => {
  bv[index].webContents.reload()
})
ipcMain.on('browserBack', (e, index) => {
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
      `document.getElementsByTagName('input')[0].value='${bv[index].webContents
        .getURL()
        .substring(
          bv[index].webContents.getURL().indexOf('/') + 2,
          bv[index].webContents.getURL().length
        )}'`
    )
  }
})
ipcMain.on('browserGoes', (e, index) => {
  bv[index].webContents.goForward()
})
ipcMain.on('getBrowserUrl', (e, index) => {
  return bv[index].webContents.getURL()
})
ipcMain.on('moveToNewTab', (e, index) => {
  bv[index].webContents.loadURL(`${__dirname}/src/resource/index.html`)
})
ipcMain.on('context', () => {
  menu.popup()
})
ipcMain.on('newtab', () => {
  newtab()
})
ipcMain.on('tabMove', (e, i) => {
  index = i < 0 ? 0 : i
  win.setTopBrowserView(bv[index])
  win.webContents.executeJavaScript(`
     document.getElementById('search').value='${bv[index].webContents
       .getURL()
       .substring(
         bv[index].webContents.getURL().indexOf('/') + 2,
         bv[index].webContents.getURL().length
       )}';
     document.getElementsByTagName('title')[0].innerText='${bv[
       index
     ].webContents.getTitle()} - Reamix';
     `)
})
ipcMain.on('removeTab', (e, i, c) => {
  try {
    console.log('delete', i)
    console.log('current', c)
    win.removeBrowserView(bv[i])
    bv[i].webContents.destroy()
    bv.splice(i, 1)
  } catch (e) {
    return true
  }
})
ipcMain.on('openSettings', () => {
  setting = new BrowserWindow({
    width: 760,
    height: 480,
    minWidth: 300,
    minHeight: 270,
    icon: `${__dirname}/src/image/logo.ico`,
    autoHideMenuBar: true,
    webPreferences: {
      preload: `${__dirname}/src/setting/preload.js`,
      scrollBounce: true,
    },
  })
  setting.loadFile(`${__dirname}/src/setting/index.html`)
  if (
    JSON.parse(fs.readFileSync(`${__dirname}/src/config/config.mncfg`, 'utf-8'))
      .experiments.forceDark == true
  ) {
    setting.webContents.executeJavaScript(
      `document.querySelectorAll('input[type="checkbox"]')[0].checked=true`
    )
  }
})

let obj = JSON.parse(
  fs.readFileSync(`${__dirname}/src/config/config.mncfg`, 'utf-8')
)
let t = JSON.parse(
  fs.readFileSync(`${__dirname}/src/i18n/${obj.lang}.json`, 'utf-8')
)

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
        role: 'reload',
        label: t['restate'],
        accelerator: 'CmdOrCtrl+Alt+R',
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
          dialog.showMessageBox(null, {
            type: 'info',
            icon: './src/image/logo.png',
            title: t['about'],
            message: t['about'],
            detail: `Reamix v1.0.0-beta.6.2
バージョン: 1.0.0-beta.6.2
開発者: VCborn

リポジトリ: https://github.com/vcborn/reamix
公式サイト: https://vcborn.com/services/reamix

Copyright 2021 vcborn.`,
          })
        },
      },
      {
        label: t['settings'],
        accelerator: 'CmdOrCtrl+Alt+S',
        click: () => {
          setting = new BrowserWindow({
            width: 760,
            height: 480,
            minWidth: 300,
            minHeight: 270,
            icon: `${__dirname}/src/image/logo.ico`,
            autoHideMenuBar: true,
            webPreferences: {
              preload: `${__dirname}/src/setting/preload.js`,
              scrollBounce: true,
            },
          })
          setting.loadFile(`${__dirname}/src/setting/index.html`)
          if (
            JSON.parse(
              fs.readFileSync(`${__dirname}/src/config/config.mncfg`, 'utf-8')
            ).experiments.forceDark == true
          ) {
            setting.webContents.executeJavaScript(
              `document.querySelectorAll('input[type="checkbox"]')[0].checked=true`
            )
          }
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
          console.log(index)
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
