# SimpleDi

![build](https://api.travis-ci.org/nerdbeere/simpledi.svg?branch=master)
![dependencies](https://david-dm.org/nerdbeere/simpledi.svg)

SimpleDi is a very simple dependency injector.

## Installation

`npm install simpledi`

## Compatibility

SimpleDi is compatible with ES3 compliant browsers

## Api

### `di.register(…)`

#### Parameters:

Name | Type | Description
-----|------|------------
dependencyName | `string` | The name of the dependency
factoryFunction | `function` | A function that gets called when get is called
dependencies | `array<string>` | *optional* An array of depdendency names

Adds a dependency to the registry.

### `di.get(…)`

#### Parameters:

Name | Type | Description
-----|------|------------
dependencyName | `string` | The name of the dependency

Returns a previously registered dependency and resolves all dependencies.

## Example

```javascript
var SimpleDi = require('simpledi');
var di = new SimpleDi();

function Engine(config) {
    this.hp = config.hp;
    this.maxSpeed = config.maxSpeed;
}

function Car(engine) {
    this.text = 'This car has ' + engine.hp + 'hp!';
}

di.register('Engine', SimpleDi.constructorFactory(Engine), ['engineConfig']);
di.register('engineConfig', function() {
    return {
        hp: 120,
        maxSpeed: 200
    };
});
di.register('Car', SimpleDi.constructorFactory(Car), ['Engine']);

var car = di.get('Car');

console.log(car.text);
```

## License

The MIT License (MIT)

Copyright (c) 2015 Julian Hollmann

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
