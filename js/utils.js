function Utils () {
  var adapters = {
    'isWebBluetoothEnabled': function () {
      return isWebBluetoothEnabled()
    }
  }

  var isWebBluetoothEnabled = function () {
    if (navigator.bluetooth) {
      return true
    } else {
      log('Web Bluetooth API is not available. Please check your Chrome version is greater than 60, and device type is Android.')
      return false
    }
  }

  return adapters
}

window.exports = Utils
