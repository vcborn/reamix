'use strict'

each()

async function css() {
  if (await node.getPath()) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = (await node.getPath()) + '/custom.css'
    document.head.appendChild(link)
  }
}
css()

function each() {
  document.querySelectorAll('.tab').forEach((i, item) => {
    i.addEventListener('click', () => {
      if (document.getElementById('opened')) {
        document.getElementById('opened').removeAttribute('id')
      }
      i.setAttribute('id', 'opened')
      node.tabMove(getCurrent())
    })
    i.addEventListener('dragstart', () => {
      if (document.getElementById('opened')) {
        document.getElementById('opened').removeAttribute('id')
      }
      i.setAttribute('id', 'opened')
    })
    i.addEventListener('drop', (e) => {
      let before = getCurrent()
      let open = document.getElementById('opened')
      let rect = i.getBoundingClientRect()
      if (e.clientX - rect.left < i.clientWidth / 2) {
        i.insertAdjacentElement('beforebegin', open)
      } else {
        i.insertAdjacentElement('afterend', open)
      }
      node.moveTab(before, getCurrent())
    })
    i.addEventListener('dragover', (e) => {
      e.preventDefault()
    })
  })
  document.querySelectorAll('.close').forEach((i, item) => {
    i.addEventListener('click', (e) => {
      if (document.querySelectorAll('span.tab').length > 1) {
        let elements = document.querySelectorAll('.tab')
        const element = i.parentNode
        elements = [].slice.call(elements)
        const index = elements.indexOf(element)
        element.remove()
        node.removeTab(index)
        const lasttab = document.querySelector('.tab:last-child')
        node.tabMove(-1)
        setTimeout(() => {
          lasttab.setAttribute('id', 'opened')
          if (
            document.body.clientWidth * 0.8 >
            document.getElementById('opened').clientWidth *
              document.querySelectorAll('.tab').length
          ) {
            for (const tab of document.querySelectorAll('.tab')) {
              tab.removeAttribute('style')
            }
          }
        }, 1)
      }
    })
  })
}

let page = document.body.innerHTML
if (node.loadLang()[0]) {
  Object.keys(node.loadLang()[1]).forEach((item) => {
    page = page.replace(
      new RegExp('%' + item + '%', 'g'),
      node.loadLang()[1][item]
    )
    document.body.innerHTML = page
  })
}

function newtab(title) {
  if (document.getElementById('opened')) {
    document.getElementById('opened').removeAttribute('id')
  }
  document.getElementById('tabs').innerHTML = `
    ${document.getElementById('tabs').innerHTML}
    <span id="opened" class="tab" draggable="true">
      <img id="favicon" src="" />
      <p>${title}</p>
      <a href="#" class="close"><img src="assets/icons/x.svg" class="icon small" /></a>
    </span>
  `
  if (
    document.body.clientWidth * 0.8 <=
    document.getElementById('opened').clientWidth *
      document.querySelectorAll('.tab').length
  ) {
    for (const tab of document.querySelectorAll('.tab')) {
      let sub =
        4 -
        (document.getElementById('opened').clientWidth *
          document.querySelectorAll('.tab').length) /
          ((65000 / (document.querySelectorAll('.tab').length * 100)) * 7.5)
      if (sub <= 1.75) {
        sub = 1.75
      }
      tab.removeAttribute('style')
      tab.style = `padding:0.25rem ${sub}rem;`
    }
  }
  each()
  node.newtab()
}

if (node.loadExtension()) {
  for (const id of node.loadExtension()) {
    const template = document.getElementById('extension')
    const content = template.content
    const clone = document.importNode(content, true)
    clone.getElementById('exicon').src = node.extensionInfo(id)[1]
    clone.getElementById('exicon').alt = node.extensionInfo(id)[0]
    document.getElementById('extensions').appendChild(clone)
  }
}

function saveFav() {
  if (document.getElementById('search').value) {
    const link = document.getElementById('search').value
    const name = document.querySelector('span#opened p').textContent
    node.saveFav(name, link)
    document.getElementById('fav-icon').src = 'assets/icons/star-fill.svg'
  }
}
