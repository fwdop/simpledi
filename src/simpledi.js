'use strict';

var bind = require('lodash-compat/function/bind');
var forEach = require('lodash-compat/collection/forEach');

function SimpleDi() {
  this._registry = {};
}

var proto = SimpleDi.prototype;

proto.register = function(name, factory, dependencies) {
  if (typeof factory !== 'function') {
    throw new Error('factory must be a function!');
  }
  this._registry[name] = {
    name: name,
    factory: factory,
    dependencies: dependencies || []
  };
};

proto.get = function(name) {
  var registryItem = this.getRegistryItem(name);
  if (!registryItem) {
    throw new Error('couldn\'t find module: ' + name);
  }
  var deps = [];
  forEach(registryItem.dependencies, bind(function(name) {
    deps.push(this.get(name));
  }, this));

  var thisArg = {};
  return registryItem.factory.apply(thisArg, deps);
};

proto.getRegistryItem = function(name) {
  return this._registry[name];
};

SimpleDi.constructorFactory = function(Constructor) {
  return function() {
    var deps = Array.prototype.slice.call(arguments);
    var thisArg = {};
    var NewConstructor = bind.apply(Constructor, [Constructor, thisArg].concat(deps));
    return new NewConstructor();
  };
};

module.exports = SimpleDi;
