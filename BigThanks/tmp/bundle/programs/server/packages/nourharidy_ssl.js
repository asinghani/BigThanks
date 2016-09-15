(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;

/* Package-scope variables */
var SSL;

(function(){

/////////////////////////////////////////////////////////////////////////////
//                                                                         //
// packages/nourharidy_ssl/packages/nourharidy_ssl.js                      //
//                                                                         //
/////////////////////////////////////////////////////////////////////////////
                                                                           //
(function () {

///////////////////////////////////////////////////////////////////////
//                                                                   //
// packages/nourharidy:ssl/ssl.js                                    //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
SSL = function(key, cert, port){                                     // 1
	var httpProxy = Npm.require('http-proxy');                          // 2
	var fs = Npm.require('fs');                                         // 3
	if(!port){                                                          // 4
		port = 443;                                                        // 5
	};                                                                  // 6
	httpProxy.createServer({                                            // 7
		target: {                                                          // 8
    		host: 'localhost',                                             // 9
    		port: process.env.PORT                                         // 10
  		},                                                               // 11
  		ssl: {                                                           // 12
    		key: fs.readFileSync(key, 'utf8'),                             // 13
    		cert: fs.readFileSync(cert, 'utf8')                            // 14
 		},                                                                // 15
 		ws: true,                                                         // 16
 		xfwd: true                                                        // 17
 	}).listen(port);                                                   // 18
};                                                                   // 19
                                                                     // 20
///////////////////////////////////////////////////////////////////////

}).call(this);

/////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['nourharidy:ssl'] = {}, {
  SSL: SSL
});

})();

//# sourceMappingURL=nourharidy_ssl.js.map
