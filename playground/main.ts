const appElement = document.getElementById('app')
if (appElement) {
  appElement.innerHTML = '__UNPLUGIN__'
}
else {
  console.error('not found #app element')
}
