var SimpleDi = require('./src/simpledi.js');
var di = new SimpleDi();

function Engine(config) {
    this.hp = config.hp;
    this.maxSpeed = config.maxSpeed;
}

function Car(engine) {
    this.text = 'This car has ' + engine.hp + 'hp!';
}

di.register('Engine', SimpleDi.withNew(Engine), ['engineConfig']);
di.register('engineConfig', function() {
    return {
        hp: 120,
        maxSpeed: 200
    };
});
di.register('Car', SimpleDi.withNew(Car), ['Engine']);

var car = di.get('Car');

console.log(car.text);