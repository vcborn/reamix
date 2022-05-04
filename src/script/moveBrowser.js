'use strict'

function getCurrent() {
  let el = document.querySelectorAll('.tab')
  el = [].slice.call(el)
  return el.indexOf(document.getElementById('opened'))
}

function moveBrowser() {
  const word = document.getElementById('search').value
  document.activeElement.blur()
  node.moveBrowser(word, getCurrent())
}

function searchEnter(e) {
  const word = e.value
  if (window.event.key === 'Enter' && word != null) {
    document.activeElement.blur()
    node.moveBrowser(word, getCurrent())
  }
}
