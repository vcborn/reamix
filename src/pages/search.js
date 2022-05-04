'use strict'

function wordSearch(e) {
  const engine =
    document.getElementById('engine').options[
      document.getElementById('engine').selectedIndex
    ].value
  let url = ''
  if (engine === 'google') {
    url = 'https://www.google.com/search?q='
  } else if (engine === 'yahoo-jp') {
    url = 'https://search.yahoo.co.jp/search?p='
  } else if (engine === 'bing') {
    url = 'https://www.bing.com/search?q='
  } else if (engine === 'duckduckgo') {
    url = 'https://duckduckgo.com/?q='
  }
  let word = e.value
  if (window.event.key === 'Enter' && word != null) {
    location.href = url + word
  }
}

function setting() {
  if (document.querySelector('body>div:nth-child(2)').id == '') {
    document.querySelector('body>div:nth-child(2)').setAttribute('id', 'opened')
  } else if (document.querySelector('body>div:nth-child(2)').id == 'opened') {
    document.querySelector('body>div:nth-child(2)').removeAttribute('id')
  }
}
