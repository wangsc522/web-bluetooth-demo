function Events () {
  var adapters = {
    'init': function () {
      return init()
    }
  }

  var init = function () {
    jQuery('#readBatteryLevel').on('click', Blue2CA().onReadBatteryLevelButtonClick)
    jQuery('#startNotifications').on('click', Blue2CA().onStartNotificationsButtonClick)
    jQuery('#stopNotifications').on('click', Blue2CA().onStopNotificationsButtonClick)
    jQuery('#reset').on('click', Blue2CA().onResetButtonClick)
  }

  return adapters
}

window.exports = Events
