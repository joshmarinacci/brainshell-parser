/**
 * Created by josh on 4/22/17.
 */
var Decimal = require('decimal.js');
var ComplexUnit = require('./units').ComplexUnit;
var Unit = require('./units').Unit;

class Literal {
    constructor(value, unit) {
        this.type = 'number';
        if(!(value instanceof Decimal)) {
            this.value = new Decimal(value);
        } else {
            this.value = value;
        }
        if(unit) {
            if(unit instanceof Unit) {
                this.unit = new ComplexUnit(unit);
            } else if(unit instanceof ComplexUnit) {
                this.unit = unit;
            } else {
                this.unit = new ComplexUnit(new Unit(unit));
            }
        }
        this.format = 'none';
    }
    withUnit(unit) {
        var lt = new Literal(this.value, unit);
        lt.format = this.format;
        return lt;
    }
    withComplexUnit(numer,denom) {
        return new Literal(this.value, new ComplexUnit(numer,denom));
    }
    withPreferredFormat(format) {
        var lt = new Literal(this.value, this.unit);
        lt.format = format;
        return lt;
    }
    toString() {
        if( this.unit ) {
            return this.value.toString() + " " + this.unit.toString();
        }
        return this.value.toString();
    }
    toCanonical() {
        if(this.format === 'hex') {
            return this.value.toHex();
        }
        return this.toString();
    }

    add(b) {
        if(this.unit || b.unit) {
            if ((this.unit && !b.unit) ||
                (!this.unit && b.unit) ||
                (this.unit.type !== b.unit.type)) {
                throw new Error("units are incompatible");
            }
        }
        return new Literal(this.value.plus(b.value), this.unit);
    }
    subtract(b) {
        return new Literal(this.value - b.value, this.unit);
    }
    multiply(b) {
        //if zero or one has a unit
        if(!this.unit && !b.unit) return new Literal(this.value * b.value);
        if(!this.unit && b.unit)  return new Literal(this.value * b.value, b.unit);
        if(this.unit && !b.unit)  return new Literal(this.value * b.value, this.unit);
        //both have a unit
        //console.log('multiplying', this.value.toString(), 'times' , b.toString());
        return new Literal(this.value.mul(b.value), this.unit.multiply(b.unit));
    }
    divide(b) {
        if(!this.unit && !b.unit) return new Literal(this.value / b.value);
        if(!this.unit && b.unit)  return new Literal(this.value / b.value, b.unit);
        if(this.unit && !b.unit)  return new Literal(this.value / b.value, this.unit);
        return new Literal(this.value.div(b.value), this.unit.divide(b.unit));
        //return new Literal(this.value / b.value, this.unit);
    }
    exponent(b) {
        console.log('exponent', this.value.toString(),
            b.value.toString(),
            this.value.toPower(b.value).toString());
        return new Literal(this.value.pow(b.value), this.unit);
    }
    as(unit) {
        if(unit.numer[0] === 'decimal') return this.withPreferredFormat('decimal');
        if(unit.numer[0] === 'hex') return this.withPreferredFormat('hex');
        var v2 = this.unit.convertTo(this.value,unit);
        return new Literal(v2,unit);
    }
}

class LiteralString {
    constructor(str) {
        this.type = 'string';
        this.string = str;
    }
    toString() {
        return "String:"+this.string;
    }
}
module.exports = {
    Literal: Literal,
    LiteralString:LiteralString
}
