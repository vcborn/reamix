'use strict'

each()

function each() {
  document.querySelectorAll('.tab').forEach((i, item) => {
    i.addEventListener('click', () => {
      if (document.getElementById('opened')) {
        document.getElementById('opened').removeAttribute('id')
      }
      i.setAttribute('id', 'opened')
      node.tabMove(getCurrent())
    })
  })
  document.querySelectorAll('.close').forEach((i, item) => {
    i.addEventListener('click', (e) => {
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
      }, 1)
    })
  })
}

let page = document.documentElement.innerHTML
if (node.loadLang()[0]) {
  Object.keys(node.loadLang()[1]).forEach((item) => {
    page = page.replace(
      new RegExp('%' + item + '%', 'g'),
      node.loadLang()[1][item]
    )
    document.documentElement.innerHTML = page
  })
}

function newtab(title) {
  if (document.getElementById('opened')) {
    document.getElementById('opened').removeAttribute('id')
  }
  document.getElementById('tabs').innerHTML = `
    ${document.getElementById('tabs').innerHTML}
    <span id="opened" class="tab">
      <p>${title}</p>
      <a href="#" class="close"><img src="assets/icons/x.svg" class="icon small" /></a>
    </span>
  `
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
