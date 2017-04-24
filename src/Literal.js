/**
 * Created by josh on 4/22/17.
 */
var Decimal = require('decimal.js');
class Unit {
    constructor(name) {
        if(name === 'm' || name === 'meter' || name === 'meters') {
            this.name = 'meter';
            this.dimension = 1;
            this.type = 'distance';
            this.base = 'meter';
            this.ratio = 1;
        }
        if(name === 'feet' || name === 'foot' || name === 'ft') {
            this.name = 'foot';
            this.dimension = 1;
            this.type = 'distance';
            this.base = 'meter';
            this.ratio = 0.3048;
        }
    }
    convertTo(val,name) {
        var unit = new Unit(name);
        return val * this.ratio / unit.ratio;
    }
}

class Literal {
    constructor(value, unit) {
        if(!(value instanceof Decimal)) {
            this.value = new Decimal(value);
        } else {
            this.value = value;
        }
        if(unit) {
            if(unit instanceof Unit) {
                this.unit = unit;
            } else {
                this.unit = new Unit(unit);
            }
        }
    }
    toString() {
        var u = "";
        if( this.unit && this.unit.name) {
            u = this.unit.name;
        }
        return this.value.toString() + " " + u;
    }

    add(b) {
        return new Literal(this.value.plus(b.value), this.unit);
    }
    subtract(b) {
        return new Literal(this.value - b.value, this.unit);
    }
    multiply(b) {
        return new Literal(this.value * b.value, this.unit);
    }
    divide(b) {
        return new Literal(this.value / b.value, this.unit);
    }
    exponent(b) {
        console.log('exponent', this.value.toString(),
            b.value.toString(),
            this.value.toPower(b.value).toString());
        return new Literal(this.value.pow(b.value), this.unit);
    }
    as(unit) {
        var v2 = this.unit.convertTo(this.value,unit);
        return new Literal(v2,unit);
    }
}

module.exports = {
    Literal: Literal
}
