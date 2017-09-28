function Events () {
  var adapters = {
    'init': function () {
      return init()
    }
  }

  var init = function () {
    jQuery('#readBatteryLevel').on('click', Blue2CA().onReadBatteryLevelButtonClick)
  }

  return adapters
}

window.exports = Events
