'use strict';

var uuid = require('./utils').uuid;

if (typeof Function.prototype.bind === 'undefined') {
  Function.prototype.bind = require('function-bind');
}

var _instanceCache = {};

function SimpleDi() {
  this._registry = {};
  this._resolvedDependencies = {};
}

var proto = SimpleDi.prototype;

proto.register = function(name, factory, dependencies, overwrite) {
  if (overwrite !== true && typeof this._registry[name] !== 'undefined') {
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
  for (var i = 0; i < deps.length; i++) {
    this.register.apply(this, deps[i]);
  }
};

proto.get = function() {
  var args = Array.prototype.slice.call(arguments);
  var name = args.shift();
  return this._resolve(name, args);
};

proto._resolve = function(name, args, dependencyChain) {
  var registryItem = this.getRegistryItem(name);
  if (!registryItem) {
    throw new Error('couldn\'t find module: ' + name);
  }
  if (!dependencyChain) {
    dependencyChain = [];
  }
  dependencyChain.push(name);
  this._countResolvedDependency(name);
  var resolvedDeps = [];
  var deps = registryItem.dependencies;
  for (var i = 0; i < deps.length; i++) {
    var clonedDepdencyChain = dependencyChain.slice(0);
    var dependencyName = deps[i];
    if (clonedDepdencyChain.indexOf(dependencyName) !== -1) {
      var chain = this._stringifyDependencyChain(dependencyChain.concat([
        dependencyName
      ]));
      throw new Error('Circular Dependency detected: ' + chain);
    }
    clonedDepdencyChain.push(dependencyChain);
    resolvedDeps.push(this._resolve(dependencyName, [], dependencyChain));
  }

  resolvedDeps = resolvedDeps.concat(args);

  var thisArg = {};
  return registryItem.factory.apply(thisArg, resolvedDeps);
};

proto._stringifyDependencyChain = function(dependencyChain) {
  return dependencyChain.join(' => ');
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

SimpleDi._withoutNew = function(factory) {
  return function() {
    var deps = Array.prototype.slice.call(arguments);
    var thisArg = {};
    var boundFactory = factory.bind.apply(factory, [thisArg].concat(deps));
    return boundFactory();
  };
};

SimpleDi.always = function(obj) {
  return function() {
    return obj;
  };
};

SimpleDi.once = function(factory) {
  var boundFactory = SimpleDi._withoutNew(factory);
  var id = uuid();
  return function() {
    if (!_instanceCache[id]) {
      var thisArg = {};
      _instanceCache[id] = boundFactory.apply(thisArg, arguments);
    }
    return _instanceCache[id];
  };
};

SimpleDi.withNewOnce = function(Constructor) {
  var constructorFactory = SimpleDi.withNew(Constructor);
  var id = uuid();
  return function() {
    if (!_instanceCache[id]) {
      var thisArg = {};
      _instanceCache[id] = constructorFactory.apply(thisArg, arguments);
    }
    return _instanceCache[id];
  };
};

module.exports = SimpleDi;
