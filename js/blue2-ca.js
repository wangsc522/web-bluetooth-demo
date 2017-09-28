/**
 * Blue2 Cooper Atkins Adapter
 */
function Blue2CA () {
  var adapters = {
    'init': function () {
      return init()
    },
    'onReadBatteryLevelButtonClick': function () {
      return onReadBatteryLevelButtonClick()
    }
  }

  var bluetoothDevice
  var batteryLevelCharacteristic

  var init = function () { }

  var onReadBatteryLevelButtonClick = function () {
    return (bluetoothDevice ? Promise.resolve() : requestDevice())
    .then(connectDeviceAndCacheCharacteristics)
    .then(_ => {
      console.log('Reading Battery Level...')
      return batteryLevelCharacteristic.readValue()
    })
    .catch(error => {
      console.log('Argh! ' + error)
    })
  }

  var requestDevice = function () {
    console.log('Requesting any Bluetooth Device...')
    return navigator.bluetooth.requestDevice({
     // filters: [...] <- Prefer filters to save energy & show relevant devices.
      acceptAllDevices: true,
      optionalServices: ['battery_service']})
    .then(device => {
      bluetoothDevice = device
      bluetoothDevice.addEventListener('gattserverdisconnected', onDisconnected)
    })
  }

  var connectDeviceAndCacheCharacteristics = function () {
    if (!BLEUtils().isWebBluetoothEnabled()) {
      return Promise.resolve()
    }
    if (bluetoothDevice.gatt.connected && batteryLevelCharacteristic) {
      return Promise.resolve()
    }

    console.log('Connecting to GATT Server...')
    return bluetoothDevice.gatt.connect()
    .then(server => {
      console.log('Getting Battery Service...')
      return server.getPrimaryService('battery_service')
    })
    .then(service => {
      console.log('Getting Battery Level Characteristic...')
      return service.getCharacteristic('battery_level')
    })
    .then(characteristic => {
      batteryLevelCharacteristic = characteristic
      batteryLevelCharacteristic.addEventListener('characteristicvaluechanged', handleBatteryLevelChanged)
      document.querySelector('#startNotifications').disabled = false
      document.querySelector('#stopNotifications').disabled = true
    })
  }

  /* This function will be called when `readValue` resolves and
   * characteristic value changes since `characteristicvaluechanged` event
   * listener has been added. */
  var handleBatteryLevelChanged = function (event) {
    let batteryLevel = event.target.value.getUint8(0)
    console.log('> Battery Level is ' + batteryLevel + '%')
  }

  var onStartNotificationsButtonClick = function () {
    console.log('Starting Battery Level Notifications...')
    batteryLevelCharacteristic.startNotifications()
    .then(_ => {
      console.log('> Notifications started')
      document.querySelector('#startNotifications').disabled = true
      document.querySelector('#stopNotifications').disabled = false
    })
    .catch(error => {
      console.log('Argh! ' + error)
    })
  }

  var onStopNotificationsButtonClick = function () {
    console.log('Stopping Battery Level Notifications...')
    batteryLevelCharacteristic.stopNotifications()
    .then(_ => {
      console.log('> Notifications stopped')
      document.querySelector('#startNotifications').disabled = false
      document.querySelector('#stopNotifications').disabled = true
    })
    .catch(error => {
      console.log('Argh! ' + error)
    })
  }

  var onResetButtonClick = function () {
    if (batteryLevelCharacteristic) {
      batteryLevelCharacteristic.removeEventListener('characteristicvaluechanged', handleBatteryLevelChanged)
      batteryLevelCharacteristic = null
    }
    // Note that it doesn't disconnect device.
    bluetoothDevice = null
    console.log('> Bluetooth Device reset')
  }

  var onDisconnected = function () {
    console.log('> Bluetooth Device disconnected')
    connectDeviceAndCacheCharacteristics()
    .catch(error => {
      console.log('Argh! ' + error)
    })
  }

  return adapters
}

window.exports = Blue2CA
