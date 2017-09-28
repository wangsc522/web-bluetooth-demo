function Events () {
  var adapters = {
    'init': function () {
      return init()
    }
  }

  var init = function () {
    $('#readBatteryLevel').on('click', Blue2CA().onReadBatteryLevelButtonClick)
  }

  return adapters
}

window.exports = Events
