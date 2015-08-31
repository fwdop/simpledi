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

  it('passes an additional argument to a constructor', function() {
    var barObj = {bar: true};
    di.register('Foo', SimpleDi.withNew(function Foo(bar) {
      expect(bar).toBe(barObj);
    }));

    di.get('Foo', barObj);
  });

  it('passes an additional argument to a constructor when a dependency is defined', function() {
    var barObj = {bar: true};
    var obj = {foo: true};
    di.register('foo', function() {
      return obj;
    });
    di.register('Foo', SimpleDi.withNew(function Foo(foo, bar) {
      expect(bar).toBe(barObj);
    }), ['foo']);

    di.get('Foo', barObj);
  });

  it('passes additional arguments to a constructor when a dependency is defined', function() {
    var barObj = {bar: true};
    var obj = {foo: true};
    di.register('foo', function() {
      return obj;
    });
    di.register('Foo', SimpleDi.withNew(function Foo(foo, bar1, bar2) {
      expect(bar2).toBe(barObj);
    }), ['foo']);

    di.get('Foo', barObj, barObj);
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

  it('throws when trying to resolve a direct cicular dependency', function() {
    function Foo(bar) {}

    function Bar(foo) {}

    di.register('Foo', SimpleDi.withNew(Foo), ['Bar']);
    di.register('Bar', SimpleDi.withNew(Bar), ['Foo']);

    try {
      di.get('Foo')
    } catch(e) {
      expect(e.toString()).toEqual('Error: Circular Dependency detected: Foo => Bar => Foo');
    }
  });

  it('throws when trying to resolve a cicular dependency', function() {
    function Foo(bar) {}

    function Bar(foo) {}

    di.register('Foo', SimpleDi.withNew(Foo), ['Bar']);
    di.register('Bar', SimpleDi.withNew(Bar), ['Baz']);
    di.register('Baz', SimpleDi.withNew(Bar), ['Foo']);

    try {
      di.get('Foo')
    } catch(e) {
      expect(e.toString()).toEqual('Error: Circular Dependency detected: Foo => Bar => Baz => Foo');
    }
  });

  it('throws when trying to resolve a dependency that is the same module that was requested', function() {
    function Foo(bar) {}

    di.register('Foo', SimpleDi.withNew(Foo), ['Foo']);

    try {
      di.get('Foo')
    } catch(e) {
      expect(e.toString()).toEqual('Error: Circular Dependency detected: Foo => Foo');
    }
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

  describe('SimpleDi.withNewOnce', function() {
    it('initializes a constructor with new once and then always returns the instance', function() {
      function Foo() {
        this.foo = true;
      }

      di.register('Foo', SimpleDi.withNewOnce(Foo));

      var foo1 = di.get('Foo');
      var foo2 = di.get('Foo');

      expect(foo1).toBe(foo2);
    });

    it('returns always the same instance and resolves dependencies', function() {
      function Foo(bar) {
        this.foo = true;
        this.bar = bar;
      }

      var bar = {
        bar: true
      };

      di.register('Foo', SimpleDi.withNewOnce(Foo), ['bar']);
      di.register('bar', SimpleDi.always(bar));

      var foo = di.get('Foo');

      expect(foo.bar).toBe(bar);
    });
  });

});
