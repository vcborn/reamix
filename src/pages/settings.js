'use strict'

const changeSelect = (key, e) => {
  const value = e.options[e.selectedIndex].value
  node.changeSettings(key, value)
}

const changeHome = () => {
  const value = document.getElementById('home').value
  node.changeSettings('home', value)
}

const changeBG = () => {
  const value = document.getElementById('background').value
  node.changeSettings('background', value)
}

const changeCheckbox = (key, e) => {
  const value = e.checked
  node.changeSettings(key, value)
}

window.onload = function () {
  const lang = node.getSettings('lang') ? node.getSettings('lang') : 'ja'
  document
    .getElementById('lang')
    .querySelector(`option[value='${lang}']`)
    .setAttribute('selected', 'selected')
  if (node.getSettings('adblocker')) {
    document.getElementById('adblock').setAttribute('checked', 'true')
  }
  if (node.getSettings('suggest')) {
    document.getElementById('suggest').setAttribute('checked', 'true')
  }
  const list = node.getSettings('blockList')
    ? node.getSettings('blockList').join('\n')
    : ''
  document.getElementById('blockList').textContent = list

  window.setTimeout(function () {
    document.getElementById('home').value = node.getSettings('home')
    document.getElementById('background').value = node.getSettings('background')
  }, 100)
}

const restartBrowser = () => {
  node.restart()
}

const changeList = () => {
  const blocker = document.getElementById('blockList').value.split(/\r\n|\n/)
  node.setBlockList(blocker)
}

async function css() {
  if (await node.getPath()) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = (await node.getPath()) + '/custom_setting.css'
    document.head.appendChild(link)
  }
}
css()
