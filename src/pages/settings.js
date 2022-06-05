'use strict'

const changeSelect = (key, e) => {
  const value = e.options[e.selectedIndex].value
  node.changeSettings(key, value)
}

const changeHome = () => {
  const value = document.getElementById('home').value
  node.changeSettings('home', value)
}

const changeCheckbox = (key, e) => {
  const value = e.checked
  console.log(key, e.checked)
  node.changeSettings(key, value)
}

window.onload = function () {
  const lang = node.getSettings('lang') ? node.getSettings('lang') : 'ja'
  const adblocker = node.getSettings('adblocker')
  document
    .getElementById('lang')
    .querySelector(`option[value='${lang}']`)
    .setAttribute('selected', 'selected')
  if (adblocker) {
    document.getElementById('adblock').setAttribute('checked', 'true')
  }
  const list = node.getSettings("blockList") ? node.getSettings("blockList").join('\n') : "";
  document.getElementById("blockList").value = list;
}

const restartBrowser = () => {
  node.restart()
}

const changeList = () => {
  const blocker = document.getElementById("blockList").value.split(/\r\n|\n/);
  node.setBlockList(blocker)
};