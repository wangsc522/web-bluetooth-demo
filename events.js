function Events () {
  var adapters = {
    'init': function () {
      return init()
    }
  }

  var init = function () {
    document.querySelector('#start-demo').addEventListener('click', function (event) {
      event.stopPropagation()
      event.preventDefault()
      if (Utils().isWebBluetoothEnabled()) {
        log('Start ...')
        automaticReconnect()
      }
    })
  }

  return adapters
}

window.exports = Events
