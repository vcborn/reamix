if (
  node.loadTheme()[0] === 'dark' ||
  (node.loadTheme()[1] && node.loadTheme()[0] === '')
) {
  document.documentElement.classList.add('dark')
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
