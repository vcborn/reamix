var url = node.getEngineURL()

function searchBrowser() {
  let word = document.getElementsByTagName('input')[0].value
  location.href = url + word
}
function wordSearch(e) {
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
