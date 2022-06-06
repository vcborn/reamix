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
}
