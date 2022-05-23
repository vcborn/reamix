'use strict'

if (document.getElementById('extension') && node.loadExtension()) {
  for (const id of node.loadExtension()) {
    const template = document.getElementById('extension')
    const content = template.content
    const clone = document.importNode(content, true)
    clone.getElementById('icon').src = node.extensionInfo(id)[1]
    clone.getElementById('name').innerText = node.extensionInfo(id)[0]
    document.getElementById('list').appendChild(clone)
  }
} else if (document.getElementById('bookmarks') && node.load('bookmarks')) {
  for (const bookmark of node.load('bookmarks')) {
    const template = document.getElementById('bookmarks')
    const content = template.content
    const clone = document.importNode(content, true)
    clone.getElementById('name').innerText = bookmark[0]
    clone.getElementById('link-text').innerText = bookmark[1]
    clone.getElementById('link').href = bookmark[1]
    document.getElementById('list').appendChild(clone)
  }
} else if (document.getElementById('history') && node.load('history')) {
  for (const row of node.load('history')) {
    const template = document.getElementById('history')
    const content = template.content
    const clone = document.importNode(content, true)
    clone.getElementById('name').innerText = row[0]
    clone.getElementById('link-text').innerText = row[1]
    clone.getElementById('link').href = row[1]
    document.getElementById('list').appendChild(clone)
  }
}

function remove(e, name) {
  if (name === 'extension') {
    let elements = document.querySelectorAll('#list>#col')
    const element = e.parentNode
    elements = [].slice.call(elements)
    let index = elements.indexOf(element) === -1 ? 0 : elements.indexOf(element)
    document.querySelectorAll('#list>#col')[index].remove()
    node.removeExtension(node.loadExtension()[index])
  } else if (name === 'bookmarks') {
    e.parentNode.remove()
    node.remove(
      name,
      e.parentNode.querySelector('#link #name').innerText,
      e.parentNode.querySelector('#link #link-text').innerText
    )
  } else if (name === 'history') {
    e.parentNode.remove()
    node.remove(
      name,
      e.parentNode.querySelector('#link #name').innerText,
      e.parentNode.querySelector('#link #link-text').innerText
    )
  }
}

function deleteAll() {
  while (document.getElementById('list').firstChild) {
    document
      .getElementById('list')
      .removeChild(document.getElementById('list').firstChild)
  }
  node.deleteAll()
}
