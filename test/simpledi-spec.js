'use strict';

var SimpleDi = require('../src/simpledi');

describe('SimpleDi', function() {
  var di;
  beforeEach(function() {
    di = new SimpleDi();
  });

  it('registers and gets a simple object', function() {
    var obj = {foo: true};
    di.register('foo', function() {
      return obj;
    });

    expect(di.get('foo')).toBe(obj);
  });

  it('registers and gets a constructor using the helper factory', function() {
    function Foo() {
    }

    di.register('Foo', SimpleDi.constructorFactory(Foo));

    expect(di.get('Foo') instanceof Foo).toBe(true);
  });

  it('resolves dependencies', function() {
    function Foo(bar) {
      this.bar = bar;
    }

    function Bar() {

    }

    di.register('Foo', SimpleDi.constructorFactory(Foo), ['Bar']);
    di.register('Bar', SimpleDi.constructorFactory(Bar));

    expect(di.get('Foo').bar instanceof Bar).toBe(true);
  });

});
