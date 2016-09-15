(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ReactiveVar = Package['reactive-var'].ReactiveVar;

/* Package-scope variables */
var Call, MethodCall;

(function(){

//////////////////////////////////////////////////////////////////////////////////
//                                                                              //
// packages/mnmtanish_call/packages/mnmtanish_call.js                           //
//                                                                              //
//////////////////////////////////////////////////////////////////////////////////
                                                                                //
(function () {

////////////////////////////////////////////////////////////////////////////
//                                                                        //
// packages/mnmtanish:call/lib/call.js                                    //
//                                                                        //
////////////////////////////////////////////////////////////////////////////
                                                                          //
var calls = {};                                                           // 1
var slice = Array.prototype.slice;                                        // 2
                                                                          // 3
                                                                          // 4
Call = function Call (id, name /*, arg1, arg2, ...*/) {                   // 5
  var call = calls[id];                                                   // 6
  if(call) {                                                              // 7
    return call;                                                          // 8
  }                                                                       // 9
                                                                          // 10
  var args = slice.call(arguments, 2);                                    // 11
  call = new MethodCall(id, name, args);                                  // 12
  calls[id] = call;                                                       // 13
  call.update();                                                          // 14
                                                                          // 15
  return call;                                                            // 16
};                                                                        // 17
                                                                          // 18
Call.get = function (id) {                                                // 19
  return calls[id];                                                       // 20
};                                                                        // 21
                                                                          // 22
                                                                          // 23
MethodCall = function MethodCall (id, name, args) {                       // 24
  this._id = id;                                                          // 25
  this._name = name;                                                      // 26
  this._args = args;                                                      // 27
  this._error = new ReactiveVar();                                        // 28
  this._ready = new ReactiveVar();                                        // 29
  this._result = new ReactiveVar();                                       // 30
};                                                                        // 31
                                                                          // 32
MethodCall.prototype.update = function() {                                // 33
  var self = this;                                                        // 34
  self._ready.set(false);                                                 // 35
  Meteor.apply.call(Meteor, this._name, this._args, function (err, res) { // 36
    self._ready.set(true);                                                // 37
    self._error.set(err);                                                 // 38
    self._result.set(res);                                                // 39
  });                                                                     // 40
};                                                                        // 41
                                                                          // 42
MethodCall.prototype.error = function() {                                 // 43
  return this._error.get();                                               // 44
};                                                                        // 45
                                                                          // 46
MethodCall.prototype.ready = function() {                                 // 47
  return this._ready.get();                                               // 48
};                                                                        // 49
                                                                          // 50
MethodCall.prototype.result = function() {                                // 51
  return this._result.get();                                              // 52
};                                                                        // 53
                                                                          // 54
MethodCall.prototype.destroy = function() {                               // 55
  delete calls[this._id];                                                 // 56
};                                                                        // 57
                                                                          // 58
////////////////////////////////////////////////////////////////////////////

}).call(this);

//////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['mnmtanish:call'] = {}, {
  Call: Call
});

})();

//# sourceMappingURL=mnmtanish_call.js.map
