(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var _ = Package.underscore._;
var BrowserPolicy = Package['browser-policy-common'].BrowserPolicy;

(function(){

//////////////////////////////////////////////////////////////////////////////////
//                                                                              //
// packages/browser-policy-framing/browser-policy-framing.js                    //
//                                                                              //
//////////////////////////////////////////////////////////////////////////////////
                                                                                //
// By adding this package, you get a default policy where only web pages on the
// same origin as your app can frame your app.
//
// For controlling which origins can frame this app,
// BrowserPolicy.framing.disallow()
// BrowserPolicy.framing.restrictToOrigin(origin)
// BrowserPolicy.framing.allowByAnyOrigin()

var defaultXFrameOptions = "SAMEORIGIN";
var xFrameOptions = defaultXFrameOptions;

BrowserPolicy.framing = {};

_.extend(BrowserPolicy.framing, {
  // Exported for tests and browser-policy-common.
  _constructXFrameOptions: function () {
    return xFrameOptions;
  },
  _reset: function () {
    xFrameOptions = defaultXFrameOptions;
  },

  disallow: function () {
    xFrameOptions = "DENY";
  },
  // ALLOW-FROM not supported in Chrome or Safari.
  restrictToOrigin: function (origin) {
    // Trying to specify two allow-from throws to prevent users from
    // accidentally overwriting an allow-from origin when they think they are
    // adding multiple origins.
    if (xFrameOptions && xFrameOptions.indexOf("ALLOW-FROM") === 0)
      throw new Error("You can only specify one origin that is allowed to" +
                      " frame this app.");
    xFrameOptions = "ALLOW-FROM " + origin;
  },
  allowAll: function () {
    xFrameOptions = null;
  }
});

//////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['browser-policy-framing'] = {};

})();

//# sourceMappingURL=browser-policy-framing.js.map
