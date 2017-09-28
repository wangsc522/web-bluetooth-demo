function App () {
  var adapters = {
    'start': function () {
      return start()
    },
    'usermessage': function (message) {
      return usermessage(message)
    }
  }

  var version = '9'

  var usermessage = function (message) {
    console.info(message)
    jQuery('.logtemplate').clone().removeClass('logtemplate').text(message).appendTo('#logwrapper')
  }

  var start = function () {
    App().usermessage('Version ' + version)
    var dateStr = new Date().toString()
    App().usermessage('Date: ' + dateStr)
    Events().init()
  }

  return adapters
}

window.exports = App