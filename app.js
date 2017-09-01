var version = '0.0.1'

var log = function (message) {
  console.log(message)
  document.getElementById('log').innerHTML += message + '<br>'
}

log('Version ' + version)

Events().init()
