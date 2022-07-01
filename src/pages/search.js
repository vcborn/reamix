'use strict'

if (node.getSettings('background')) {
  document.body.style.backgroundImage = `url("${node.getSettings(
    'background'
  )}")`
  document.body.style.backgroundSize = 'cover'
}

async function wordSearch(e) {
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
  const key = new RegExp(
    /^[a-zA-Zぁ-んーァ-ヶーｱ-ﾝﾞﾟ一-龠0-9!"#$%&'()*+-.,/:;<=>?@[\]^_`{|}~ 　]{1}$/
  )
  if (window.event.key === 'Enter' && word != null) {
    location.href = url + word
  } else if (
    (key.test(window.event.key) || window.event.key === 'Backspace') &&
    word != null &&
    !e.isComposing &&
    node.getSettings('suggest')
  ) {
    const count = document.getElementById('suggestions').childNodes
    for (let i = count.length - 1; i > 0; i--) {
      const childNode = document.getElementById('suggestions').childNodes[i]
      childNode.parentNode.removeChild(childNode)
    }

    if (engine === 'google') {
      const parser = new DOMParser()
      const suggest = await fetch(
        `https://clients1.google.com/complete/search?output=toolbar&q=${word}`
      )
      const suggestions = parser.parseFromString(
        await suggest.text(),
        'application/xml'
      )
      const nodes =
        suggestions.documentElement.getElementsByTagName('suggestion')
      for (let i = 0; i < (nodes.length > 5 ? 5 : nodes.length); i++) {
        const text = suggestions.documentElement
          .getElementsByTagName('suggestion')
          [i].getAttribute('data')
        const template = document.getElementById('suggest')
        const content = template.content
        const clone = document.importNode(content, true)
        clone.getElementById('text').innerText = text
        clone.getElementById(
          'link'
        ).href = `https://www.google.com/search?q=${text}`
        document.getElementById('suggestions').appendChild(clone)
      }
    } else if (engine === 'bing') {
      const suggest = await fetch(
        `https://api.bing.com/qsonhs.aspx?mkt=ja-JP&q=${word}`
      )
      const suggestions = (await suggest.json())['AS']['Results'][0][
        'Suggests'
      ].map((obj) => obj.Txt)
      for (
        let i = 0;
        i < (suggestions.length > 5 ? 5 : suggestions.length);
        i++
      ) {
        const text = suggestions[i]
        const template = document.getElementById('suggest')
        const content = template.content
        const clone = document.importNode(content, true)
        clone.getElementById('text').innerText = text
        clone.getElementById(
          'link'
        ).href = `https://www.bing.com/search?q=${text}`
        document.getElementById('suggestions').appendChild(clone)
      }
    } else if (engine === 'yahoo-jp') {
      const suggest = await fetch(
        `https://n-assist-search.yahooapis.jp/SuggestSearchService/V5/webassistSearch?&eappid=bHh.tC2tmbwFomQjckAooTOC6x5ys6w7R3gXULbUAbqEzHo9..iAG5RUgtk7CV7ui5noLQjmw3RaB9pw7vn1Db8fgr4GdNS73YEk6GRiy8kE2AhUcYfRcdqb_q7XUWPoN5WKwr3ziDVtEWNyApS7&query=${word}`
      )
      const suggestions = (await suggest.json())['Result'].map(
        (obj) => obj.Suggest
      )
      for (
        let i = 0;
        i < (suggestions.length > 5 ? 5 : suggestions.length);
        i++
      ) {
        const text = suggestions[i]
        const template = document.getElementById('suggest')
        const content = template.content
        const clone = document.importNode(content, true)
        clone.getElementById('text').innerText = text
        clone.getElementById(
          'link'
        ).href = `https://search.yahoo.co.jp/search?p=${text}`
        document.getElementById('suggestions').appendChild(clone)
      }
    } else {
      const suggest = await fetch(`https://duckduckgo.com/ac/?q=${word}`)
      const suggestions = (await suggest.json()).map((obj) => obj.phrase)
      for (
        let i = 0;
        i < (suggestions.length > 5 ? 5 : suggestions.length);
        i++
      ) {
        const text = suggestions[i]
        const template = document.getElementById('suggest')
        const content = template.content
        const clone = document.importNode(content, true)
        clone.getElementById('text').innerText = text
        clone.getElementById(
          'link'
        ).href = `https://search.yahoo.co.jp/search?p=${text}`
        document.getElementById('suggestions').appendChild(clone)
      }
    }
  }
}

function setting() {
  if (document.querySelector('body>div:nth-child(2)').id == '') {
    document.querySelector('body>div:nth-child(2)').setAttribute('id', 'opened')
  } else if (document.querySelector('body>div:nth-child(2)').id == 'opened') {
    document.querySelector('body>div:nth-child(2)').removeAttribute('id')
  }
}

let i = 0
const child = document.getElementById('suggestions').childNodes
while (i <= child.length) {
  if (child[i].nodeName == '#text') {
    document.getElementById('suggestions').removeChild(child[i])
  }
  i++
}
