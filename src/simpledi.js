'use strict';

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
  registryItem.dependencies.forEach((function(name) {
    deps.push(this.get(name));
  }).bind(this));

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
    var NewConstructor = Constructor.bind.apply(Constructor, [thisArg].concat(deps));
    return new NewConstructor();
  };
};

module.exports = SimpleDi;
