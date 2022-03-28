//get current tab number
function getCurrent() {
  //source: https://lab.syncer.jp/Web/JavaScript/Snippet/54/
  let el = document.getElementsByTagName('span')
  el = [].slice.call(el)
  return el.indexOf(document.getElementById('opened'))
}

function moveBrowser() {
  let word = document.getElementsByTagName('input')[0].value
  document.activeElement.blur()
  node.moveBrowser(word, getCurrent())
}

function searchEnter(e) {
  let word = e.value
  //press enter
  if (window.event.key === 'Enter' && word != null) {
    //<span#opened>
    document.activeElement.blur()
    node.moveBrowser(word, getCurrent())
  }
}
