/**
 * Created by josh on 5/26/17.
 */
var UNITS = require('./units2');

class LiteralNumber {
    constructor(value, numers, denoms) {
        this._value = value;
        this._numers = (numers?numers:[]);
        this._denoms = (denoms?denoms:[]);
    }
    withUnit(numers,denoms) {
        return this.withUnits(numers,denoms);
    }
    withUnits(numers, denoms) {
        if(typeof numers === 'string')  numers = [[numers,1]];
        if(typeof denoms === 'string')  denoms = [[denoms,1]];
        if(!numers) numers = [];
        if(!denoms) denoms = [];
        function toUnitPart(f) {
            if(typeof f[1] === 'number') return new UnitPart(f[0],f[1]);
            if(f instanceof UnitPart) return f;
            return new UnitPart(f,1)
        }
        return new LiteralNumber(this._value,
            numers.map(toUnitPart),
            denoms.map(toUnitPart));
    }
    clone() {
        return new LiteralNumber(this.getValue(), this._numers.map(u=>u.clone()), this._denoms.map(u=>u.clone()));
    }

    add(to) {
        if (this.equalUnits(to)) {
            return new LiteralNumber(this.getValue() + to.getValue()).withUnits(this._numers,this._denoms);
        }
        var u2 = this.as(to);
        if(u2.equalUnits(this)) {
            throw new Error("bad add");
        }
        return u2.add(to);
        throw new Error("bad add");
    }
    subtract(to) {
        if (this.equalUnits(to)) {
            return new LiteralNumber(this.getValue() - to.getValue()).withUnits(this._numers,this._denoms);
        }
        throw new Error("bad sub");
    }

    multiply(b) {
        var a = this.process(this,b,'length');
        var nu = new LiteralNumber(a.getValue() * b.getValue(),
            a._numers.concat(b._numers),
            a._denoms.concat(b._denoms)
        );
        nu = nu.expand();
        nu = nu.reduce();
        if(nu.isReduceable()) {
            nu = nu.expand();
            nu = nu.reduce();
        }
        nu = nu.collapse();
        return nu;
    }

    exponent(b) {
        var exp = b.getValue();
        var n2 = this._numers.map((u)=>new UnitPart(u.getName(),u.getDimension()*exp, u.getFactor()));
        var d2 = this._denoms.map((u)=>new UnitPart(u.getName(),u.getDimension()*exp, u.getFactor()));
        return new LiteralNumber(Math.pow(this.getValue(), exp),n2,d2);
    }

    toString() {
        let n = this._numers.map((u)=>u.getFactor()+'*'+u.getName() + '^' + u.getDimension()).join();
        let d = this._denoms.map((u)=>u.getFactor()+'*'+u.getName() + '^' + u.getDimension()).join();
        return `Literal ${this._value} ${n} / ${d}`;
    }

    getValue() {
        return this._value;
    }

    divide(b) {
        return this.multiply(b.invert())
    }

    invert() {
        return new LiteralNumber(1/this.getValue(), this._denoms.slice(), this._numers.slice())
    }

    as(to) {
        if (this.equalUnits(to)) return this;
        return this.convert(to);
    }

    equalUnits(b) {
        var a = this.collapse();
        b = b.collapse();
        if(a._numers.length !== b._numers.length) return false;
        if(a._denoms.length !== b._denoms.length) return false;
        for(let i=0; i<a._numers.length; i++) {
            if(a._numers[i].getName() !== b._numers[i].getName()) return false;
        }
        return true;
    }

    isNone() {

    }

    isReduceable() {
        function check(a,type) {
            var top = a._numers.find((u)=>u.getType() == type);
            var bot = a._denoms.find((u)=>u.getType() == type);
            if(top && bot) return true;
            return false;
        }
        if(check(this,'length')) return true;
        if(check(this,'duration')) return true;
        return false;
    }
    expand() {
        this.check2(this,'duration');
        this.check2(this,'length');
        this.check2(this,'volume');
        this.check2(this,'area');
        this.check2(this,'mass');
        return this;
    }
    check2(a,type) {
        //find something in the top and bottom of the same number
        var first = a._numers.find((u)=>u.getType()==type);
        var second = a._denoms.find((u)=>u.getType()==type);
        if(first && second) {
            if(first.getName() == second.getName()) return a;
            //TODO: this conversion code is almost identical to what is below
            if(first.getBase() === second.getBase()) {
                a._numers.push(new UnitPart(second.getName(),1,second.getRatio()));
                a._denoms.push(new UnitPart(first.getName(),1,first.getRatio()));
            } else {
                var cvv = UNITS.findConversion(first.getBase(), second.getBase());
                if(cvv) {
                    a._numers.push(new UnitPart(first.getBase(),1,1));
                    a._denoms.push(new UnitPart(first.getName(),1,first.getRatio()));
                    a._numers.push(new UnitPart(cvv.to,1,1));
                    a._denoms.push(new UnitPart(cvv.from,1,cvv.ratio));
                    a._numers.push(new UnitPart(second.getName(),1,second.getRatio()));
                    a._denoms.push(new UnitPart(second.getBase(),1,1));
                }
            }
        }
        return a;
    }

    // TODO: this conversion code is almost identical to what is above
    process(a,b,type) {
        a = a.clone();
        //find something in the top of two different numbers
        var first = a._numers.find((u)=>u.getType() == type);
        var second = b._numers.find((u)=>u.getType() == type);
        if(first && second && first.getName() !== second.getName()) {
            if(first.getBase() == second.getBase()) {
                a._numers.push(new UnitPart(second.getName(),second.getDimension(),Math.pow(second.getRatio(), second.getDimension())));
                a._denoms.push(new UnitPart(first.getName(),first.getDimension(),Math.pow(first.getRatio(), first.getDimension())));
            } else {
                var cvv = UNITS.findConversion(first.getBase(), second.getBase());
                if(cvv) {
                    //convert first to it's base
                    a._numers.push(new UnitPart(first.getBase(),first.getDimension(),1));
                    a._denoms.push(new UnitPart(first.getName(),first.getDimension(),Math.pow(first.getRatio(),first.getDimension())));
                    //convert base to other base
                    a._numers.push(new UnitPart(cvv.to,second.getDimension(),Math.pow(1,second.getDimension())));
                    a._denoms.push(new UnitPart(cvv.from,first.getDimension(),Math.pow(cvv.ratio,first.getDimension())));
                    //convert other base to second
                    a._numers.push(new UnitPart(second.getName(),second.getDimension(),Math.pow(second.getRatio(),second.getDimension())));
                    a._denoms.push(new UnitPart(second.getBase(),second.getDimension(),1));
                }
            }
        }
        return a;
    }

    convert(b) {
        var a = this;
        function findTypeConversion(a, b, fromType, dim, toType) {
            if(a._numers.find((u)=>u.getDimension() === dim && u.getType() === fromType)) {
                if(b._numers.find((u)=>u.getType() === toType)) {
                    return a.dimConvert(b,fromType, dim, toType).reduce();
                }
            }
            return a;
        }
        a = findTypeConversion(a, b, 'length', 3, 'volume');
        a = findTypeConversion(a, b, 'length', 2, 'area');
        a = this.process(a,b,'duration');
        a = this.process(a,b,'length');
        a = this.process(a,b,'volume');
        a = this.process(a,b,'area');
        a = this.process(a,b,'mass');
        a = this.process(a,b,'storage');
        a = a.reduce();
        return a;
    }

    dimConvert(to, fromType, dim, toType) {
        var first = this._numers.find((u) => u.getDimension() === dim && u.getType() === fromType);
        var second = to._numers.find((u) => u.getType() === toType);
        var conv = UNITS.findDimConversion(first.getBase(), second.getBase());
        let a = this.clone();
        //convert from u1 to the base
        a._numers.push(new UnitPart(first.getBase(),first.getDimension(),1));
        a._denoms.push(new UnitPart(first.getName(),first.getDimension(),Math.pow(first.getRatio(),first.getDimension())));
        //convert between bases
        a._numers.push(new UnitPart(conv.to.name, conv.to.dim, Math.pow(1,conv.to.dim)));
        a._denoms.push(new UnitPart(conv.from.name, conv.from.dim,conv.ratio));
        //convert from the second base to u2
        a._numers.push(new UnitPart(second.getName(),second.getDimension(),Math.pow(second.getRatio(),second.getDimension())));
        a._denoms.push(new UnitPart(second.getBase(),second.getDimension(),1));
        return a;
    }

    reduce() {
        var u2 = this.clone();
        var v2 = this._value;
        var n1 = u2._numers.slice();
        var d1 = u2._denoms.slice();
        //subtract dimension of any unit that is on top and bottom
        n1.forEach((n) => {
            d1.forEach((d) => {
                if(n.getName() == d.getName()) {
                    if(n._dim > 0 && d._dim > 0) {
                        var sum = Math.min(n._dim, d._dim);
                        n._dim-= sum;
                        d._dim-= sum;
                    }
                }
            });
        });
        //pull out the factors to the value
        n1.forEach((u)=>{
            v2 *= u.getFactor();
            u._factor = 1;
        });
        d1.forEach((u)=>{
            v2 /= u.getFactor();
            u._factor = 1;
        });
        //remove any units that were reduced to zero
        let hasDimension = (u)=>u._dim>0;
        n1 = n1.filter(hasDimension);
        d1 = d1.filter(hasDimension);
        return new LiteralNumber(v2,n1,d1);
    }

    collapse() {
        let notNoneType = (a) => a.type !== 'none';
        function groupSameName(a,b) {
            if(a.length == 0) return a.concat([b]);
            var last = a.pop();
            if(last.getName() == b.getName()) {
                a.push(new UnitPart(last.getName(),last.getDimension() + b.getDimension()));
                return a;
            } else {
                a.push(last);
                a.push(b);
                return a;
            }
        }
        var ns = this._numers.filter(notNoneType).reduce(groupSameName,[]);
        var ds = this._denoms.filter(notNoneType).reduce(groupSameName,[]);
        return new LiteralNumber(this._value, ns, ds);
    }

}

class UnitPart {
    constructor(name, dim, factor) {
        this._name = UNITS.getCanonicalName(name);
        this._dim = (dim ? dim : 1);
        this._factor = (factor ? factor : 1);
    }
    clone() {
        return new UnitPart(this.getName(), this.getDimension(), this.getFactor());
    }
    getName() {
        return this._name;
    }
    getDimension() {
        return this._dim;
    }
    getType() {
        return UNITS.lookupUnit(this._name).type;
    }
    getBase() {
        return UNITS.lookupUnit(this._name).base;
    }
    getRatio() {
        return UNITS.lookupUnit(this._name).ratio;
    }
    getFactor() {
        return this._factor;
    }
}

module.exports = {
    LiteralNumber: LiteralNumber,
    UnitPart: UnitPart
}