/**
 * Blue2 Cooper Atkins Adapter
 */
 /* global TextDecoder */
function Blue2CA () {
  var adapters = {
    'init': function () {
      return init()
    },
    'test': function () {
      return test()
    }
  }

  function test () {
    App().log('Requesting bluetooth device...')
    var blue2TempService = 'f2b32c77-ea68-464b-9cd7-a22cbffb98bd'
    var blue2TempASCIICharacteristic = '78544003-4394-4fc2-8cfd-be6a00aa701b'
    navigator.bluetooth.requestDevice({
      // filters: [],
      acceptAllDevices: true,
      optionalServices: [blue2TempService]})
    .then(device => {
      App().log('Connecting to device ...')
      return device.gatt.connect()
    })
    .then(server => {
      App().log('Getting device service...')
      return server.getPrimaryService(blue2TempService)
    })
    .then(service => {
      App().log('Getting device characteristics...')
      return service.getCharacteristics()
    })
    .then(characteristics => {
      let queue = Promise.resolve()
      let decoder = new TextDecoder('utf-8')
      // DODC HERE
      // file:///C:/Users/Admin/Dropbox/Pongolabs%20-%20Team/Projects/Clients/MartinBrower-QIP/170516%20Bluetooth%20probes/Bluetooth%20Wand%20API-1.pdf
      characteristics.forEach(characteristic => {
        if (characteristic && characteristic.uuid && characteristic.uuid === blue2TempASCIICharacteristic) {
          queue = queue.then(_ => characteristic.readValue()).then(value => {
            value = decoder.decode(value)
            value = value.replace(/[^A-Z0-9.]+/g, ' ')

            App().log('Raw value: ' + value)

            if (value.indexOf(' ') === -1) {
              App().log('Temperature characteristic value not found!')
              return
            }
            var valueArr = value.split(' ')
            if (valueArr.length !== 2) {
              App().log('>> Temperature characteristic format invalid!')
              return
            }
            var temp = valueArr[0]
            var scale = valueArr[1] // F or C
            if (scale === 'F') {
              temp = (temp - 32) * 5 / 9
              temp = Math.round(temp * 100) / 100
              scale = 'C'
            }

            App().log('Temperature: ' + temp + ' ' + scale)
          })
        }
      })
      return queue
    })
    .catch(error => {
      App().log('Argh! ' + error)
    })
  }

  var bluetoothDevice
  var batteryLevelCharacteristic

  var init = function () { }

  var onReadBatteryLevelButtonClick = function () {
    return (bluetoothDevice ? Promise.resolve() : requestDevice())
    .then(connectDeviceAndCacheCharacteristics)
    .then(_ => {
      App().log('Reading Battery Level...')
      return batteryLevelCharacteristic.readValue()
    })
    .catch(error => {
      App().log('Argh! ' + error)
    })
  }

  var requestDevice = function () {
    App().log('Requesting any Bluetooth Device...')
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

    App().log('Connecting to GATT Server...')
    return bluetoothDevice.gatt.connect()
    .then(server => {
      var servicename = 'device_information'
      App().log('Getting Services for' + servicename)
      return server.getPrimaryService(servicename)
    })
    .then(services => {
      App().log('Getting Characteristics...')
      let queue = Promise.resolve()
      services.forEach(service => {
        queue = queue.then(_ => service.getCharacteristics().then(characteristics => {
          App().log('> Service: ' + service.uuid)
          characteristics.forEach(characteristic => {
            App().log('>> Characteristic: ' + characteristic.uuid + ' ' + getSupportedProperties(characteristic))
          })
        }))
      })
      return queue
    })
    .catch(error => {
      App().log(error)
    })
  }

  /* Utils */
  var getSupportedProperties = function (characteristic) {
    let supportedProperties = []
    for (const p in characteristic.properties) {
      if (characteristic.properties[p] === true) {
        supportedProperties.push(p.toUpperCase())
      }
    }
    return '[' + supportedProperties.join(', ') + ']'
  }

  /* This function will be called when `readValue` resolves and
   * characteristic value changes since `characteristicvaluechanged` event
   * listener has been added. */
  var handleBatteryLevelChanged = function (event) {
    let batteryLevel = event.target.value.getUint8(0)
    App().log('> Battery Level is ' + batteryLevel + '%')
  }

  var onStartNotificationsButtonClick = function () {
    App().log('Starting Battery Level Notifications...')
    batteryLevelCharacteristic.startNotifications()
    .then(_ => {
      App().log('> Notifications started')
      document.querySelector('#startNotifications').disabled = true
      document.querySelector('#stopNotifications').disabled = false
    })
    .catch(error => {
      App().log('Argh! ' + error)
    })
  }

  var onStopNotificationsButtonClick = function () {
    App().log('Stopping Battery Level Notifications...')
    batteryLevelCharacteristic.stopNotifications()
    .then(_ => {
      App().log('> Notifications stopped')
      document.querySelector('#startNotifications').disabled = false
      document.querySelector('#stopNotifications').disabled = true
    })
    .catch(error => {
      App().log('Argh! ' + error)
    })
  }

  var onResetButtonClick = function () {
    if (batteryLevelCharacteristic) {
      batteryLevelCharacteristic.removeEventListener('characteristicvaluechanged', handleBatteryLevelChanged)
      batteryLevelCharacteristic = null
    }
    // Note that it doesn't disconnect device.
    bluetoothDevice = null
    App().log('> Bluetooth Device reset')
  }

  var onDisconnected = function () {
    App().log('> Bluetooth Device disconnected')
    connectDeviceAndCacheCharacteristics()
    .catch(error => {
      App().log('Argh! ' + error)
    })
  }

  return adapters
}

window.exports = Blue2CA
