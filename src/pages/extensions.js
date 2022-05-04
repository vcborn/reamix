'use strict'

if (node.loadExtension()) {
  for (const id of node.loadExtension()) {
    const template = document.getElementById('extension')
    const content = template.content
    const clone = document.importNode(content, true)
    clone.getElementById('icon').src = node.extensionInfo(id)[1]
    clone.getElementById('name').innerText = node.extensionInfo(id)[0]
    document.getElementById('list').appendChild(clone)
  }
}

function removeExtension(e) {
  let elements = document.querySelectorAll('#list>#col')
  const element = e.parentNode
  elements = [].slice.call(elements)
  let index = elements.indexOf(element) === -1 ? 0 : elements.indexOf(element)
  document.querySelectorAll('#list>#col')[index].remove()
  node.removeExtension(node.loadExtension()[index])
}
