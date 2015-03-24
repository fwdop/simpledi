'use strict';

if(typeof Function.prototype.bind === 'undefined') {
  Function.prototype.bind = require('function-bind');
}

function SimpleDi() {
  this._registry = {};
  this._resolvedDependencies = {};
}

var proto = SimpleDi.prototype;

proto.register = function(name, factory, dependencies, overwrite) {
  if(overwrite !== true && typeof this._registry[name] !== 'undefined') {
    throw new Error('A dependency with this name is already registered!');
  }
  if (typeof factory !== 'function') {
    throw new Error('factory must be a function!');
  }
  this._registry[name] = {
    name: name,
    factory: factory,
    dependencies: dependencies || []
  };
  this._resolvedDependencies[name] = 0;
};

proto.registerBulk = function(deps) {
  for(var i = 0; i < deps.length; i++) {
    this.register.apply(this, deps[i]);
  }
};

proto.get = function(name) {
  var registryItem = this.getRegistryItem(name);
  if (!registryItem) {
    throw new Error('couldn\'t find module: ' + name);
  }
  this._countResolvedDependency(name);
  var resolvedDeps = [];
  var deps = registryItem.dependencies;
  for(var i = 0; i < deps.length; i++) {
    var name = deps[i];
    resolvedDeps.push(this.get(name));
  }

  var thisArg = {};
  return registryItem.factory.apply(thisArg, resolvedDeps);
};

proto.getRegistryItem = function(name) {
  return this._registry[name];
};

proto._countResolvedDependency = function(name) {
  this._resolvedDependencies[name]++;
};

proto.getResolvedDependencyCount = function() {
  return this._resolvedDependencies;
};

SimpleDi.withNew = function(Constructor) {
  return function() {
    var deps = Array.prototype.slice.call(arguments);
    var thisArg = {};
    var NewConstructor = Constructor.bind.apply(Constructor, [thisArg].concat(deps));
    return new NewConstructor();
  };
};

SimpleDi.always = function(obj) {
  return function() {
    return obj;
  }
};

module.exports = SimpleDi;
