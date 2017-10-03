/* global jQuery, App */
// Load app once page fully loaded.
jQuery(function () {
  App().start()
})

if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '')
  }
}
