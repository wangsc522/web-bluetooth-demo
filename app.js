var version = '2'

var log = function (message) {
  console.log(message)
  document.getElementById('log').innerHTML += message + '<br>'
}

log('Version ' + version)

Events().init()
