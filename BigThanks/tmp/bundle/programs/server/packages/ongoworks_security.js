(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var _ = Package.underscore._;
var LocalCollection = Package.minimongo.LocalCollection;
var Minimongo = Package.minimongo.Minimongo;
var Random = Package.random.Random;
var EJSON = Package.ejson.EJSON;
var ECMAScript = Package.ecmascript.ECMAScript;
var MongoID = Package['mongo-id'].MongoID;
var meteorInstall = Package.modules.meteorInstall;
var Buffer = Package.modules.Buffer;
var process = Package.modules.process;
var Symbol = Package['ecmascript-runtime'].Symbol;
var Map = Package['ecmascript-runtime'].Map;
var Set = Package['ecmascript-runtime'].Set;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var rulesByCollection, addFuncForAll, ensureCreated, ensureDefaultAllow, getRulesForCollectionAndType, getCollectionName, Security;

var require = meteorInstall({"node_modules":{"meteor":{"ongoworks:security":{"lib":{"server":{"utility.js":function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/ongoworks_security/lib/server/utility.js                                                                 //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
/* global _, rulesByCollection:true, addFuncForAll:true, ensureCreated:true, ensureDefaultAllow:true */              //
                                                                                                                     //
rulesByCollection = {};                                                                                              // 3
                                                                                                                     //
var created = {                                                                                                      // 5
  allow: {                                                                                                           // 6
    insert: {},                                                                                                      // 7
    update: {},                                                                                                      // 8
    remove: {},                                                                                                      // 9
    download: {} // for use with CollectionFS packages                                                               // 10
  },                                                                                                                 // 6
  deny: {                                                                                                            // 12
    insert: {},                                                                                                      // 13
    update: {},                                                                                                      // 14
    remove: {},                                                                                                      // 15
    download: {} // for use with CollectionFS packages                                                               // 16
  }                                                                                                                  // 12
};                                                                                                                   // 5
                                                                                                                     //
/**                                                                                                                  //
 * Adds the given function as an allow or deny function for all specified collections and types.                     //
 * @param {Array(Mongo.Collection)} collections Array of Mongo.Collection instances                                  //
 * @param {String}                  allowOrDeny "allow" or "deny"                                                    //
 * @param {Array(String)}           types       Array of types ("insert", "update", "remove")                        //
 * @param {Array(String)|null}      fetch       `fetch` property to use                                              //
 * @param {Function}                func        The function                                                         //
 */                                                                                                                  //
addFuncForAll = function addFuncForAll(collections, allowOrDeny, types, fetch, func) {                               // 28
  // We always disable transformation, but we transform for specific                                                 //
  // rules upon running our deny function if requested.                                                              //
  var rules = { transform: null };                                                                                   // 31
  if (_.isArray(fetch)) {                                                                                            // 32
    rules.fetch = fetch;                                                                                             // 33
  }                                                                                                                  // 34
  _.each(types, function (t) {                                                                                       // 35
    rules[t] = func;                                                                                                 // 36
  });                                                                                                                // 37
  _.each(collections, function (c) {                                                                                 // 38
    c[allowOrDeny](rules);                                                                                           // 39
  });                                                                                                                // 40
};                                                                                                                   // 41
                                                                                                                     //
/**                                                                                                                  //
 * Creates the allow or deny function for the given collections if not already created. This ensures that this package only ever creates up to one allow and one deny per collection.
 * @param   {String}                  allowOrDeny "allow" or "deny"                                                  //
 * @param   {Array(Mongo.Collection)} collections An array of collections                                            //
 * @param   {Array(String)}           types       An array of types ("insert", "update", "remove")                   //
 * @param   {Array(String)|null}      fetch       `fetch` property to use                                            //
 * @param   {Function}                func        The function                                                       //
 */                                                                                                                  //
ensureCreated = function ensureCreated(allowOrDeny, collections, types, fetch, func) {                               // 51
  _.each(types, function (t) {                                                                                       // 52
    // Ignore "read"                                                                                                 //
    if (!_.contains(['insert', 'update', 'remove', 'download'], t)) return;                                          // 54
                                                                                                                     //
    collections = _.reject(collections, function (c) {                                                               // 56
      return _.has(created[allowOrDeny][t], getCollectionName(c));                                                   // 57
    });                                                                                                              // 58
    addFuncForAll(collections, allowOrDeny, [t], null, func);                                                        // 59
    // mark that we've defined function for collection-type combo                                                    //
    _.each(collections, function (c) {                                                                               // 61
      created[allowOrDeny][t][getCollectionName(c)] = true;                                                          // 62
    });                                                                                                              // 63
  });                                                                                                                // 64
};                                                                                                                   // 65
                                                                                                                     //
/**                                                                                                                  //
 * Sets up default allow functions for the collections and types.                                                    //
 * @param   {Array(Mongo.Collection)} collections Array of Mongo.Collection instances                                //
 * @param   {Array(String)}           types       Array of types ("insert", "update", "remove")                      //
 */                                                                                                                  //
ensureDefaultAllow = function ensureDefaultAllow(collections, types) {                                               // 72
  ensureCreated("allow", collections, types, [], function () {                                                       // 73
    return true;                                                                                                     // 74
  });                                                                                                                // 75
};                                                                                                                   // 76
                                                                                                                     //
/**                                                                                                                  //
 * Return only those rules that apply to the given collection and operation type                                     //
 */                                                                                                                  //
getRulesForCollectionAndType = function getRulesForCollectionAndType(collectionName, type) {                         // 81
  var rules = rulesByCollection[collectionName] || [];                                                               // 82
  return _.select(rules, function (rule) {                                                                           // 83
    return _.contains(rule._types, type);                                                                            // 84
  });                                                                                                                // 85
};                                                                                                                   // 86
                                                                                                                     //
getCollectionName = function getCollectionName(collection) {                                                         // 88
  // CollectionFS has underlying collection on `files` property                                                      //
  return collection._name || collection.files && collection.files._name;                                             // 90
};                                                                                                                   // 91
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"Security.js":function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/ongoworks_security/lib/server/Security.js                                                                //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
// The `Security` object is exported and provides the package API                                                    //
Security = {                                                                                                         // 2
  // Putting these on the exported object allows package users to override if necessary                              //
  errorMessages: {                                                                                                   // 4
    multipleCan: 'You may not combine more than one insert, update, or remove on a Security.can chain',              // 5
    notAllowed: 'Action not allowed',                                                                                // 6
    requiresDefinition: 'Security.defineMethod requires a "definition" argument',                                    // 7
    requiresAllow: 'Security.defineMethod requires an "allow" function',                                             // 8
    collectionsArg: 'The collections argument must be a Mongo.Collection instance or an array of them',              // 9
    noCollectionOrType: 'At a minimum, you must call permit and collections methods for a security rule.'            // 10
  },                                                                                                                 // 4
  // the starting point of the chain                                                                                 //
  permit: function permit(types) {                                                                                   // 13
    return new Security.Rule(types);                                                                                 // 14
  },                                                                                                                 // 15
  can: function can(userId) {                                                                                        // 16
    return new Security.Check(userId);                                                                               // 17
  },                                                                                                                 // 18
  defineMethod: function securityDefineMethod(name, definition) {                                                    // 19
    // Check whether a rule with the given name already exists; can't overwrite                                      //
    if (Security.Rule.prototype[name]) {                                                                             // 21
      throw new Error('A security method with the name "' + name + '" has already been defined');                    // 22
    }                                                                                                                // 23
    if (!definition) throw new Error(Security.errorMessages.requiresDefinition);                                     // 24
    // If "deny" is used, convert to "allow" for backwards compatibility                                             //
    if (definition.deny) {                                                                                           // 26
      definition.allow = function () {                                                                               // 27
        return !definition.deny.apply(definition, arguments);                                                        // 28
      };                                                                                                             // 29
    }                                                                                                                // 30
    // Make sure the definition argument is an object that has an `allow` property                                   //
    if (!definition.allow) throw new Error(Security.errorMessages.requiresAllow);                                    // 32
    // Wrap transform, if provided                                                                                   //
    if (definition.transform) {                                                                                      // 34
      definition.transform = LocalCollection.wrapTransform(definition.transform);                                    // 35
    }                                                                                                                // 36
    Security.Rule.prototype[name] = function (arg) {                                                                 // 37
      this._restrictions.push({                                                                                      // 38
        definition: definition,                                                                                      // 39
        arg: arg                                                                                                     // 40
      });                                                                                                            // 38
      return this;                                                                                                   // 42
    };                                                                                                               // 43
  }                                                                                                                  // 44
};                                                                                                                   // 2
                                                                                                                     //
Mongo.Collection.prototype.permit = function (types) {                                                               // 47
  return Security.permit(types).collections(this);                                                                   // 48
};                                                                                                                   // 49
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"Security.Rule.js":["babel-runtime/helpers/toConsumableArray","babel-runtime/helpers/classCallCheck",function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/ongoworks_security/lib/server/Security.Rule.js                                                           //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
var _toConsumableArray;module.import('babel-runtime/helpers/toConsumableArray',{"default":function(v){_toConsumableArray=v}});var _classCallCheck;module.import('babel-runtime/helpers/classCallCheck',{"default":function(v){_classCallCheck=v}});
                                                                                                                     //
Security.Rule = function () {                                                                                        // 1
  function _class(types) {                                                                                           // 2
    _classCallCheck(this, _class);                                                                                   // 2
                                                                                                                     //
    if (!_.isArray(types)) types = [types];                                                                          // 3
    this._types = types;                                                                                             // 4
    this._restrictions = [];                                                                                         // 5
  }                                                                                                                  // 6
                                                                                                                     //
  _class.prototype.collections = function collections(_collections) {                                                // 1
    var _this = this;                                                                                                // 8
                                                                                                                     //
    // Make sure the `collections` argument is either a `Mongo.Collection` instance or                               //
    // an array of them. If it's a single collection, convert it to a one-item array.                                //
    if (!_.isArray(_collections)) _collections = [_collections];                                                     // 11
                                                                                                                     //
    // Keep list keyed by collection name                                                                            //
    _.each(_collections, function (collection) {                                                                     // 14
      if (!(collection instanceof Mongo.Collection) &&                                                               // 15
      // CollectionFS has underlying collection on `files` property                                                  //
      !(collection.files instanceof Mongo.Collection)) {                                                             // 17
        throw new Error(Security.errorMessages.collectionsArg);                                                      // 18
      }                                                                                                              // 19
      // CollectionFS has underlying collection on `files` property                                                  //
      var collectionName = getCollectionName(collection);                                                            // 21
      rulesByCollection[collectionName] = rulesByCollection[collectionName] || [];                                   // 22
      rulesByCollection[collectionName].push(_this);                                                                 // 23
    });                                                                                                              // 24
                                                                                                                     //
    this._collections = _collections;                                                                                // 26
                                                                                                                     //
    return this;                                                                                                     // 28
  };                                                                                                                 // 29
                                                                                                                     //
  _class.prototype.combinedFetch = function combinedFetch() {                                                        // 1
    // We need a combined `fetch` array. The `fetch` is optional and can be either an array                          //
    // or a function that takes the argument passed to the restriction method and returns an array.                  //
    var fetch = [];                                                                                                  // 34
    _.every(this._restrictions, function (restriction) {                                                             // 35
      if (_.isArray(restriction.definition.fetch)) {                                                                 // 36
        fetch = _.union(fetch, restriction.definition.fetch);                                                        // 37
      } else if (typeof restriction.definition.fetch === "function") {                                               // 38
        fetch = _.union(fetch, restriction.definition.fetch(restriction.arg));                                       // 39
      } else if (!restriction.definition.hasOwnProperty('fetch')) {                                                  // 40
        // If `fetch` property isn't present, we should fetch the full doc.                                          //
        fetch = null;                                                                                                // 42
        return false; // Exit loop                                                                                   // 43
      }                                                                                                              // 44
      return true;                                                                                                   // 45
    });                                                                                                              // 46
    return fetch;                                                                                                    // 47
  };                                                                                                                 // 48
                                                                                                                     //
  _class.prototype.allowInClientCode = function allowInClientCode() {                                                // 1
    if (!this._collections || !this._types) throw new Error(Security.errorMessages.noCollectionOrType);              // 51
    ensureSecureDeny(this._collections, this._types);                                                                // 52
  };                                                                                                                 // 53
                                                                                                                     //
  _class.prototype.allow = function allow(type, collection, userId, doc, modifier) {                                 // 1
    for (var _len = arguments.length, args = Array(_len > 5 ? _len - 5 : 0), _key = 5; _key < _len; _key++) {        // 55
      args[_key - 5] = arguments[_key];                                                                              // 55
    }                                                                                                                // 55
                                                                                                                     //
    var fields = void 0;                                                                                             // 56
    if (type === 'update') fields = computeChangedFieldsFromModifier(modifier);                                      // 57
                                                                                                                     //
    // Loop through all defined restrictions. Restrictions are additive for this chained                             //
    // rule, so if any allow function returns false, this function should return false.                              //
    return _.every(this._restrictions, function (restriction) {                                                      // 61
      var _restriction$definiti;                                                                                     // 61
                                                                                                                     //
      // Clone the doc in case we need to transform it. Transformations                                              //
      // should apply to only the one restriction.                                                                   //
      var loopDoc = _.clone(doc);                                                                                    // 64
                                                                                                                     //
      // If transform is a function, apply that                                                                      //
      var transform = restriction.definition.transform;                                                              // 67
      if (transform !== null) {                                                                                      // 68
        transform = transform || collection._transform;                                                              // 69
        if (typeof transform === 'function') {                                                                       // 70
          var addedRandomId = false;                                                                                 // 71
          if (type === 'insert' && !loopDoc._id) {                                                                   // 72
            // The wrapped transform requires an _id, but we                                                         //
            // don't have access to the generatedId from Meteor API,                                                 //
            // so we'll fudge one and then remove it.                                                                //
            loopDoc._id = Random.id();                                                                               // 76
            addedRandomId = true;                                                                                    // 77
          }                                                                                                          // 78
          loopDoc = transform(loopDoc);                                                                              // 79
          if (addedRandomId) delete loopDoc._id;                                                                     // 80
        }                                                                                                            // 81
      }                                                                                                              // 82
                                                                                                                     //
      return (_restriction$definiti = restriction.definition).allow.apply(_restriction$definiti, [type, restriction.arg, userId, loopDoc, fields, modifier].concat(args));
    });                                                                                                              // 85
  };                                                                                                                 // 86
                                                                                                                     //
  return _class;                                                                                                     // 1
}();                                                                                                                 // 1
                                                                                                                     //
function ensureSecureDeny(collections, types) {                                                                      // 89
  // If we haven't yet done so, set up a default, permissive `allow` function for all of                             //
  // the given collections and types. We control all security through `deny` functions only, but                     //
  // there must first be at least one `allow` function for each collection or all writes                             //
  // will be denied.                                                                                                 //
  ensureDefaultAllow(collections, types);                                                                            // 94
                                                                                                                     //
  _.each(types, function (t) {                                                                                       // 96
    _.each(collections, function (collection) {                                                                      // 97
      ensureCreated('deny', [collection], [t], null, function () {                                                   // 98
        var _Security$can;                                                                                           // 98
                                                                                                                     //
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {                 // 98
          args[_key2] = arguments[_key2];                                                                            // 98
        }                                                                                                            // 98
                                                                                                                     //
        var userId = args.shift();                                                                                   // 99
                                                                                                                     //
        // If type is update, remove the `fields` argument. We will create our own                                   //
        // for consistency.                                                                                          //
        if (t === 'update') args = [args[0], args[2]];                                                               // 103
                                                                                                                     //
        return !(_Security$can = Security.can(userId))[t].apply(_Security$can, _toConsumableArray(args))['for'](collection).check();
      });                                                                                                            // 106
    });                                                                                                              // 107
  });                                                                                                                // 108
}                                                                                                                    // 109
                                                                                                                     //
function computeChangedFieldsFromModifier(modifier) {                                                                // 111
  var fields = [];                                                                                                   // 112
  // This is the same logic Meteor's mongo package uses in                                                           //
  // https://github.com/meteor/meteor/blob/devel/packages/mongo/collection.js                                        //
  _.each(modifier, function (params) {                                                                               // 115
    _.each(_.keys(params), function (field) {                                                                        // 116
      // treat dotted fields as if they are replacing their                                                          //
      // top-level part                                                                                              //
      if (field.indexOf('.') !== -1) field = field.substring(0, field.indexOf('.'));                                 // 119
                                                                                                                     //
      // record the field we are trying to change                                                                    //
      if (!_.contains(fields, field)) fields.push(field);                                                            // 123
    });                                                                                                              // 125
  });                                                                                                                // 126
  return fields;                                                                                                     // 127
}                                                                                                                    // 128
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"Security.Check.js":["babel-runtime/helpers/toConsumableArray","babel-runtime/helpers/classCallCheck",function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/ongoworks_security/lib/server/Security.Check.js                                                          //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
var _toConsumableArray;module.import('babel-runtime/helpers/toConsumableArray',{"default":function(v){_toConsumableArray=v}});var _classCallCheck;module.import('babel-runtime/helpers/classCallCheck',{"default":function(v){_classCallCheck=v}});
                                                                                                                     //
Security.Check = function () {                                                                                       // 1
  function _class(userId) {                                                                                          // 2
    _classCallCheck(this, _class);                                                                                   // 2
                                                                                                                     //
    this.userId = userId || null;                                                                                    // 3
  }                                                                                                                  // 4
                                                                                                                     //
  _class.prototype['for'] = function _for(collection) {                                                              // 1
    this.collection = collection;                                                                                    // 7
    this.collectionName = getCollectionName(collection);                                                             // 8
    return this;                                                                                                     // 9
  };                                                                                                                 // 10
                                                                                                                     //
  _class.prototype.insert = function insert(doc) {                                                                   // 1
    if (this.type) throw new Error(Security.errorMessages.multipleCan);                                              // 13
    this.type = 'insert';                                                                                            // 14
    this.doc = doc;                                                                                                  // 15
                                                                                                                     //
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {        // 12
      args[_key - 1] = arguments[_key];                                                                              // 12
    }                                                                                                                // 12
                                                                                                                     //
    this.args = args;                                                                                                // 16
    return this;                                                                                                     // 17
  };                                                                                                                 // 18
                                                                                                                     //
  _class.prototype.update = function update(doc, modifier) {                                                         // 1
    if (this.type) throw new Error(Security.errorMessages.multipleCan);                                              // 21
    this.type = 'update';                                                                                            // 22
    this.doc = doc;                                                                                                  // 23
    this.modifier = modifier;                                                                                        // 24
                                                                                                                     //
    for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
      args[_key2 - 2] = arguments[_key2];                                                                            // 20
    }                                                                                                                // 20
                                                                                                                     //
    this.args = args;                                                                                                // 25
    return this;                                                                                                     // 26
  };                                                                                                                 // 27
                                                                                                                     //
  _class.prototype.remove = function remove(doc) {                                                                   // 1
    if (this.type) throw new Error(Security.errorMessages.multipleCan);                                              // 30
    this.type = 'remove';                                                                                            // 31
    this.doc = doc;                                                                                                  // 32
                                                                                                                     //
    for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      args[_key3 - 1] = arguments[_key3];                                                                            // 29
    }                                                                                                                // 29
                                                                                                                     //
    this.args = args;                                                                                                // 33
    return this;                                                                                                     // 34
  };                                                                                                                 // 35
                                                                                                                     //
  _class.prototype.read = function read(doc) {                                                                       // 1
    if (this.type) throw new Error(Security.errorMessages.multipleCan);                                              // 38
    this.type = 'read';                                                                                              // 39
    this.doc = doc;                                                                                                  // 40
                                                                                                                     //
    for (var _len4 = arguments.length, args = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
      args[_key4 - 1] = arguments[_key4];                                                                            // 37
    }                                                                                                                // 37
                                                                                                                     //
    this.args = args;                                                                                                // 41
    return this;                                                                                                     // 42
  };                                                                                                                 // 43
                                                                                                                     //
  // EXAMPLES:                                                                                                       //
  // Security.can(userId).insert(doc).for(MyCollection).check()                                                      //
  // Security.can(userId).update(id, modifier).for(MyCollection).check()                                             //
  // Security.can(userId).remove(id).for(MyCollection).check()                                                       //
                                                                                                                     //
                                                                                                                     //
  _class.prototype.check = function check() {                                                                        // 1
    var _this = this;                                                                                                // 49
                                                                                                                     //
    // Select only those rules that apply to this operation type                                                     //
    var rules = getRulesForCollectionAndType(this.collectionName, this.type);                                        // 51
                                                                                                                     //
    // If this.doc is an ID, we will look up the doc, fetching only the fields needed.                               //
    // To find out which fields are needed, we will combine all the `fetch` arrays from                              //
    // all the restrictions in all the rules.                                                                        //
    if (typeof this.doc === 'string' || this.doc instanceof MongoID.ObjectID) {                                      // 56
      (function () {                                                                                                 // 56
        var fields = {};                                                                                             // 57
        _.every(rules, function (rule) {                                                                             // 58
          var fetch = rule.combinedFetch();                                                                          // 59
          if (fetch === null) {                                                                                      // 60
            fields = null;                                                                                           // 61
            return false; // Exit loop                                                                               // 62
          }                                                                                                          // 63
          rule.combinedFetch().forEach(function (field) {                                                            // 64
            fields[field] = 1;                                                                                       // 65
          });                                                                                                        // 66
          return true;                                                                                               // 67
        });                                                                                                          // 68
                                                                                                                     //
        var options = {};                                                                                            // 70
        if (fields) {                                                                                                // 71
          if (_.isEmpty(fields)) {                                                                                   // 72
            options = { _id: 1 };                                                                                    // 73
          } else {                                                                                                   // 74
            options = { fields: fields };                                                                            // 75
          }                                                                                                          // 76
        }                                                                                                            // 77
        _this.doc = _this.collection.findOne(_this.doc, options);                                                    // 78
      })();                                                                                                          // 56
    }                                                                                                                // 79
                                                                                                                     //
    // Loop through all defined rules for this collection. There is an OR relationship among                         //
    // all rules for the collection, so if any "allow" function DO return true, we allow.                            //
    return _.any(rules, function (rule) {                                                                            // 83
      return rule.allow.apply(rule, [_this.type, _this.collection, _this.userId, _this.doc, _this.modifier].concat(_toConsumableArray(_this.args)));
    });                                                                                                              // 83
  };                                                                                                                 // 84
                                                                                                                     //
  // EXAMPLES:                                                                                                       //
  // Security.can(userId).insert(doc).for(MyCollection).throw()                                                      //
  // Security.can(userId).update(id, modifier).for(MyCollection).throw()                                             //
  // Security.can(userId).remove(id).for(MyCollection).throw()                                                       //
                                                                                                                     //
                                                                                                                     //
  _class.prototype['throw'] = function _throw() {                                                                    // 1
    if (!this.check()) throw new Meteor.Error('access-denied', Security.errorMessages.notAllowed);                   // 91
  };                                                                                                                 // 92
                                                                                                                     //
  return _class;                                                                                                     // 1
}();                                                                                                                 // 1
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}]},"builtInRules.js":function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/ongoworks_security/lib/builtInRules.js                                                                   //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
/*                                                                                                                   //
 * This file defines built-in restriction methods                                                                    //
 */                                                                                                                  //
                                                                                                                     //
/*                                                                                                                   //
 * No one                                                                                                            //
 */                                                                                                                  //
                                                                                                                     //
Security.defineMethod("never", {                                                                                     // 9
  fetch: [],                                                                                                         // 10
  transform: null,                                                                                                   // 11
  allow: function allow() {                                                                                          // 12
    return false;                                                                                                    // 13
  }                                                                                                                  // 14
});                                                                                                                  // 9
                                                                                                                     //
/*                                                                                                                   //
 * Logged In                                                                                                         //
 */                                                                                                                  //
                                                                                                                     //
Security.defineMethod("ifLoggedIn", {                                                                                // 21
  fetch: [],                                                                                                         // 22
  transform: null,                                                                                                   // 23
  allow: function allow(type, arg, userId) {                                                                         // 24
    return !!userId;                                                                                                 // 25
  }                                                                                                                  // 26
});                                                                                                                  // 21
                                                                                                                     //
/*                                                                                                                   //
 * Specific User ID                                                                                                  //
 */                                                                                                                  //
                                                                                                                     //
Security.defineMethod("ifHasUserId", {                                                                               // 33
  fetch: [],                                                                                                         // 34
  transform: null,                                                                                                   // 35
  allow: function allow(type, arg, userId) {                                                                         // 36
    return userId === arg;                                                                                           // 37
  }                                                                                                                  // 38
});                                                                                                                  // 33
                                                                                                                     //
/*                                                                                                                   //
 * Specific Roles                                                                                                    //
 */                                                                                                                  //
                                                                                                                     //
/*                                                                                                                   //
 * alanning:roles support                                                                                            //
 */                                                                                                                  //
if (Package && Package["alanning:roles"]) {                                                                          // 48
                                                                                                                     //
  var Roles = Package["alanning:roles"].Roles;                                                                       // 50
                                                                                                                     //
  Security.defineMethod("ifHasRole", {                                                                               // 52
    fetch: [],                                                                                                       // 53
    transform: null,                                                                                                 // 54
    allow: function allow(type, arg, userId) {                                                                       // 55
      if (!arg) throw new Error('ifHasRole security rule method requires an argument');                              // 56
      if (arg.role) {                                                                                                // 57
        return Roles.userIsInRole(userId, arg.role, arg.group);                                                      // 58
      } else {                                                                                                       // 59
        return Roles.userIsInRole(userId, arg);                                                                      // 60
      }                                                                                                              // 61
    }                                                                                                                // 62
  });                                                                                                                // 52
}                                                                                                                    // 65
                                                                                                                     //
/*                                                                                                                   //
 * nicolaslopezj:roles support                                                                                       //
 * Note: doesn't support groups                                                                                      //
 */                                                                                                                  //
if (Package && Package["nicolaslopezj:roles"]) {                                                                     // 71
                                                                                                                     //
  var Roles = Package["nicolaslopezj:roles"].Roles;                                                                  // 73
                                                                                                                     //
  Security.defineMethod("ifHasRole", {                                                                               // 75
    fetch: [],                                                                                                       // 76
    transform: null,                                                                                                 // 77
    allow: function allow(type, arg, userId) {                                                                       // 78
      if (!arg) throw new Error('ifHasRole security rule method requires an argument');                              // 79
      return Roles.userHasRole(userId, arg);                                                                         // 80
    }                                                                                                                // 81
  });                                                                                                                // 75
}                                                                                                                    // 84
                                                                                                                     //
/*                                                                                                                   //
 * Specific Properties                                                                                               //
 */                                                                                                                  //
                                                                                                                     //
Security.defineMethod("onlyProps", {                                                                                 // 90
  fetch: [],                                                                                                         // 91
  transform: null,                                                                                                   // 92
  allow: function allow(type, arg, userId, doc, fieldNames) {                                                        // 93
    if (!_.isArray(arg)) arg = [arg];                                                                                // 94
                                                                                                                     //
    fieldNames = fieldNames || _.keys(doc);                                                                          // 96
                                                                                                                     //
    return _.every(fieldNames, function (fieldName) {                                                                // 98
      return _.contains(arg, fieldName);                                                                             // 99
    });                                                                                                              // 100
  }                                                                                                                  // 101
});                                                                                                                  // 90
                                                                                                                     //
Security.defineMethod("exceptProps", {                                                                               // 104
  fetch: [],                                                                                                         // 105
  transform: null,                                                                                                   // 106
  allow: function allow(type, arg, userId, doc, fieldNames) {                                                        // 107
    if (!_.isArray(arg)) arg = [arg];                                                                                // 108
                                                                                                                     //
    fieldNames = fieldNames || _.keys(doc);                                                                          // 110
                                                                                                                     //
    return !_.any(fieldNames, function (fieldName) {                                                                 // 112
      return _.contains(arg, fieldName);                                                                             // 113
    });                                                                                                              // 114
  }                                                                                                                  // 115
});                                                                                                                  // 104
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}},{"extensions":[".js",".json"]});
require("./node_modules/meteor/ongoworks:security/lib/server/utility.js");
require("./node_modules/meteor/ongoworks:security/lib/server/Security.js");
require("./node_modules/meteor/ongoworks:security/lib/server/Security.Rule.js");
require("./node_modules/meteor/ongoworks:security/lib/server/Security.Check.js");
require("./node_modules/meteor/ongoworks:security/lib/builtInRules.js");

/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['ongoworks:security'] = {}, {
  Security: Security
});

})();

//# sourceMappingURL=ongoworks_security.js.map
