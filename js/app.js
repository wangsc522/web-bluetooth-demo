function App () {
  var adapters = {
    'start': function () {
      return start()
    },
    'log': function (message) {
      return log(message)
    }
  }

  var version = '0.0.1'

  var log = function (message) {
    console.log(message)
    jQuery('.logtemplate').clone().removeClass('logtemplate').text(message).appendTo('#logwrapper')
  }

  var start = function () {
    App().log('Version ' + version)
    var dateStr = new Date().toString()
    App().log('Date: ' + dateStr)
    Events().init()
  }

  return adapters
}

window.exports = App
