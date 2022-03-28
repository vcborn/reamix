/*document.getElementById('custom').addEventListener('click',()=>{
  node.filePopUp();
})
document.getElementById('default').addEventListener('click',()=>{
  node.writeBackgroundDefault();
})*/

if (
  node.loadTheme()[0] === 'dark' ||
  (node.loadTheme()[1] && node.loadTheme()[0] === '')
) {
  document.documentElement.classList.add('dark')
  document
    .getElementById('theme')
    .querySelector("option[value='dark']").selected = true
} else {
  document
    .getElementById('theme')
    .querySelector("option[value='light']").selected = true
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
  document
    .getElementById('lang')
    .querySelector(`option[value='${node.loadLang()[0]}']`).selected = true
}

document.getElementsByTagName('select')[0].addEventListener('change', () => {
  node.changeLang(document.getElementsByTagName('select')[0].value)
})

document.getElementsByTagName('select')[1].addEventListener('change', () => {
  node.changeTheme(document.getElementsByTagName('select')[1].value)
})

document.getElementsByTagName('select')[2].addEventListener('change', () => {
  node.changeSearchEngine(document.getElementsByTagName('select')[2].value)
})

function changeExperimental(arg) {
  node.changeExperimentalFunctions(arg.target.value, arg.target.checked)
}

document
  .getElementsByTagName('input')[0]
  .addEventListener('change', changeExperimental)
document.getElementsByTagName('input')[1].addEventListener('change', (arg) => {
  changeExperimental(arg)
  if (arg.target.checked) {
    document.getElementById('changedfont').removeAttribute('disabled')
  } else {
    document.getElementById('changedfont').setAttribute('disabled', '')
  }
})
document.getElementById('changedfont').addEventListener('input', () => {
  node.changeExperimentalFunctions(
    'changedfont',
    document.getElementById('changedfont').value
  )
})
