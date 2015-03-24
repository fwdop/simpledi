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

  it('throws when register implicitly overwrites a dependency', function() {
    var obj = {foo: true};
    di.register('foo', SimpleDi.always(obj));

    expect(function() {
      di.register('foo', SimpleDi.always(obj));
    }).toThrow();
  });

  it('does not throw when register explicitly overwrites a dependency', function() {
    var obj = {foo: true};
    di.register('foo', SimpleDi.always(obj));

    expect(function() {
      di.register('foo', SimpleDi.always(obj), [], true);
    }).not.toThrow();
  });

  it('registers and gets a constructor using the helper factory', function() {
    function Foo() {
    }

    di.register('Foo', SimpleDi.withNew(Foo));

    expect(di.get('Foo') instanceof Foo).toBe(true);
  });

  it('resolves a dependency', function() {
    function Foo(bar) {
      this.bar = bar;
    }

    function Bar() {

    }

    di.register('Foo', SimpleDi.withNew(Foo), ['Bar']);
    di.register('Bar', SimpleDi.withNew(Bar));

    expect(di.get('Foo').bar instanceof Bar).toBe(true);
  });

  it('resolves multiple dependencies', function() {
    function Foo(bar, baz) {
      this.bar = bar;
      this.baz = baz;
    }

    function Bar() {
      this.bar = true;
    }

    function Baz() {
      this.baz = true;
    }

    di.register('Foo', SimpleDi.withNew(Foo), ['Bar', 'Baz']);
    di.register('Bar', SimpleDi.withNew(Bar));
    di.register('Baz', SimpleDi.withNew(Baz));

    expect(di.get('Foo').baz instanceof Baz).toBe(true);
  });

  it('provides a static identity function that returns always the same object', function() {
    var dep = {
      foo: true
    };

    di.register('foo', SimpleDi.always(dep));

    expect(di.get('foo')).toBe(dep);
  });

  it('registers multiple dependencies at once with registerBulk', function() {
    function Foo(bar, baz) {
      this.bar = bar;
      this.baz = baz;
    }

    function Bar() {
      this.bar = true;
    }

    function Baz() {
      this.baz = true;
    }

    di.registerBulk([
      ['Foo', SimpleDi.withNew(Foo), ['Bar', 'Baz']],
      ['Bar', SimpleDi.withNew(Bar)],
      ['Baz', SimpleDi.withNew(Baz)]
    ]);

    expect(di.get('Foo').baz instanceof Baz).toBe(true);
  });

  it('counts how often dependencies where resolved', function() {
    var obj = {foo: true};
    di.register('foo', function() {
      return obj;
    });

    di.get('foo');
    expect(di.getResolvedDependencyCount().foo).toBe(1);
  });

  it('counts how often dependencies where resolved with deep dependencies', function() {
    var obj = {foo: true};
    di.register('foo', function() {
      return obj;
    });

    di.register('bar', function() {
      return obj;
    }, ['foo']);

    di.get('bar');
    di.get('foo');
    expect(di.getResolvedDependencyCount()).toEqual({foo: 2, bar: 1});
  });

});
