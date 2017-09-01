var version = '5'

var log = function (message) {
  console.log(message)
  document.getElementById('log').innerHTML += message + '<br>'
}

log('Version ' + version)

Events().init()
