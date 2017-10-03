function Events () {
  var adapters = {
    'init': function () {
      return init()
    }
  }

  var init = function () {
    jQuery('#test').on('click', Blue2CA().run)
  }

  return adapters
}

window.exports = Events
