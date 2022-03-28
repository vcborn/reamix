const { contextBridge } = require('electron')
const fs = require('fs')

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
  changeSearchEngine: (engine) => {
    let text = fs.readFileSync(`${__dirname}/../config/engines.mncfg`, 'utf-8')
    let obj = JSON.parse(text)
    obj.engine = engine
    fs.writeFileSync(
      `${__dirname}/../config/engines.mncfg`,
      JSON.stringify(obj)
    )
  },
  changeTheme: (theme) => {
    let obj = JSON.parse(
      fs.readFileSync(`${__dirname}/../config/config.mncfg`, 'utf-8')
    )
    obj.theme = theme
    fs.writeFileSync(`${__dirname}/../config/config.mncfg`, JSON.stringify(obj))
  },
  changeLang: (lang) => {
    let obj = JSON.parse(
      fs.readFileSync(`${__dirname}/../config/config.mncfg`, 'utf-8')
    )
    obj.lang = lang
    fs.writeFileSync(`${__dirname}/../config/config.mncfg`, JSON.stringify(obj))
  },
  changeExperimentalFunctions: (change, to) => {
    let obj = JSON.parse(
      fs.readFileSync(`${__dirname}/../config/config.mncfg`, 'utf-8')
    )
    /*{ "experiments": { ${change}: ${to} } }*/
    obj.experiments[change] = to
    fs.writeFileSync(`${__dirname}/../config/config.mncfg`, JSON.stringify(obj))
  },
})
