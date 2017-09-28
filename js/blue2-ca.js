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

  /*
  <option value="alert_notification">alert_notification</option>
    <option value="automation_io">automation_io</option>
    <option value="battery_service">battery_service</option>
    <option value="blood_pressure">blood_pressure</option>
    <option value="body_composition">body_composition</option>
    <option value="bond_management">bond_management</option>
    <option value="continuous_glucose_monitoring">continuous_glucose_monitoring</option>
    <option value="current_time">current_time</option>
    <option value="cycling_power">cycling_power</option>
    <option value="cycling_speed_and_cadence">cycling_speed_and_cadence</option>
    <option value="device_information">device_information</option>
    <option value="environmental_sensing">environmental_sensing</option>
    <option value="generic_access">generic_access</option>
    <option value="generic_attribute">generic_attribute</option>
    <option value="glucose">glucose</option>
    <option value="health_thermometer">health_thermometer</option>
    <option value="heart_rate">heart_rate</option>
    <option value="human_interface_device">human_interface_device (blacklisted)</option>
    <option value="immediate_alert">immediate_alert</option>
    <option value="indoor_positioning">indoor_positioning</option>
    <option value="internet_protocol_support">internet_protocol_support</option>
    <option value="link_loss">link_loss</option>
    <option value="location_and_navigation">location_and_navigation</option>
    <option value="next_dst_change">next_dst_change</option>
    <option value="phone_alert_status">phone_alert_status</option>
    <option value="pulse_oximeter">pulse_oximeter</option>
    <option value="reference_time_update">reference_time_update</option>
    <option value="running_speed_and_cadence">running_speed_and_cadence</option>
    <option value="scan_parameters">scan_parameters</option>
    <option value="tx_power">tx_power</option>
    <option value="user_data">user_data</option>
    <option value="weight_scale">weight_scale</option>
  */
  function test () {
    App().log('Requesting any Bluetooth Device...')
    var blue2TempService = 'f2b32c77-ea68-464b-9cd7-a22cbffb98bd'
    navigator.bluetooth.requestDevice({
      // filters: [],
      acceptAllDevices: true,
      optionalServices: [blue2TempService]})
    .then(device => {
      App().log('Connecting to GATT Server...')
      return device.gatt.connect()
    })
    .then(server => {
      App().log('Getting Device Information Service...')
      return server.getPrimaryService(blue2TempService)
    })
    .then(service => {
      App().log('Getting Device Information Characteristics...')
      return service.getCharacteristics()
    })
    .then(characteristics => {
      let queue = Promise.resolve()
      let decoder = new TextDecoder('utf-8')
      // DODC HERE
      // file:///C:/Users/Admin/Dropbox/Pongolabs%20-%20Team/Projects/Clients/MartinBrower-QIP/170516%20Bluetooth%20probes/Bluetooth%20Wand%20API-1.pdf
      characteristics.forEach(characteristic => {
        queue = queue.then(_ => characteristic.readValue()).then(value => {
          App().log('>> Characteristic: ' + characteristic.uuid + ' value: ' + decoder.decode(value))
        })
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
