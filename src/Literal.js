/**
 * Created by josh on 4/22/17.
 */

class Literal {
    constructor(value, unit) {
        this.value = value;
        if(unit) {
            this.unit = unit;
        }
    }

    add(b) {
        return new Literal(this.value + b.value, this.unit);
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
        return new Literal(Math.pow(this.value, b.value), this.unit);
    }
}

module.exports = {
    Literal: Literal
}
