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
    withUnits(numers, denoms) {
        function toUnitPart(f) {
            if(typeof f[1] === 'number') return new UnitPart(f[0],f[1]);
            return new UnitPart(f,1)
        }
        if(!denoms) denoms = [];
        return new LiteralNumber(this._value, numers.map(toUnitPart),denoms.map(toUnitPart));
    }

    add(to) {
        if (this.equalUnits(to)) {
            return new LiteralNumber(this.getValue() + to.getValue()).withUnits(this._numers,this._denoms);
        }
        throw new Error("bad add");
    }
    subtract(to) {
        if (this.equalUnits(to)) {
            return new LiteralNumber(this.getValue() - to.getValue()).withUnits(this._numers,this._denoms);
        }
        throw new Error("bad sub");
    }

    multiply(b) {
        console.log("multiplying",this.toString(),'times', b.toString());
        var nu = new LiteralNumber(this.getValue() * b.getValue(),
            this._numers.concat(b._numers),
            this._denoms.concat(b._denoms)
        );
        nu = nu.expand();
        console.log('after expanding',nu);
        nu = nu.reduce();
        console.log('after reducing',nu);
        if(nu.isReduceable()) {
            console.log("we can reduce again");
            nu = nu.expand();
            console.log('after expanding',nu);
            nu = nu.reduce();
            console.log('after reducing',nu);
        }
        nu = nu.collapse();
        console.log('after collapsing',nu);
        return nu;
    }

    exponent(b) {
        console.log("doing to a power", this.toString(),'to the', b.toString());
        var exp = b.getValue();
        var n2 = this._numers.map((u)=>new UnitPart(u.getName(),u.getDimension()*exp, u.getFactor()));
        var d2 = this._denoms.map((u)=>new UnitPart(u.getName(),u.getDimension()*exp, u.getFactor()));
        return new LiteralNumber(Math.pow(this.getValue(), b.getValue()),n2,d2);
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
        return new LiteralNumber(1/this.getValue(), this._denoms, this._numers)
    }

    as(to) {
        if (this.equalUnits(to)) return this;
        return this.convert(to);
    }

    equalUnits(b) {
        var a = this.collapse();
        //if(!b.isCompound()) b = b.asComplex();
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
        console.log('expanding');
        //if top and bottom have a time or length then expand it
        this.check2(this,'duration');
        this.check2(this,'length');
        this.check2(this,'volume');
        return this;
    }
    check2(a,type) {
        //find something in the top and bottom of the same number
        var first = a._numers.find((u)=>u.getType()==type);
        var second = a._denoms.find((u)=>u.getType()==type);
        //console.log("found for type", type,top,bot);
        if(first && second) {
            if(first.getName() == second.getName()) {
                console.log("same on top and bottom. ignore");
                return a;
            }
            //TODO: this conversion code is almost identical to what is below
            if(first.getBase() === second.getBase()) {
                //console.log("same base",first.getRatio(),second.getRatio());
                a._numers.push(new UnitPart(second.getName(),1,second.getRatio()));
                a._denoms.push(new UnitPart(first.getName(),1,first.getRatio()));
            } else {
                //console.log("must convert between bases");
                var cvv = UNITS.findConversion(first.getBase(), second.getBase());
                //console.log("found conversion",cvv);
                if(cvv) {
                    a._numers.push(new UnitPart(first.getBase(),1,1));
                    a._denoms.push(new UnitPart(first.getName(),1,first.getRatio()));
                    a._numers.push(new UnitPart(cvv.to,1,1));
                    a._denoms.push(new UnitPart(cvv.from,1,cvv.ratio));
                    a._numers.push(new UnitPart(second.getName(),1,second.getRatio()));
                    a._denoms.push(new UnitPart(second.getBase(),1,1));
                    //console.log("now a is",a);
                }
            }
        }
        return a;
    }

    // TODO: this conversion code is almost identical to what is above
    process(a,b,type) {
        //find something in the top of two different numbers
        var first = a._numers.find((u)=>u.getType() == type);
        var second = b._numers.find((u)=>u.getType() == type);
        if(first && second) {
            //console.log("looking for a conversion from",first.getName(),'to',second.getName());
            if(first.getBase() == second.getBase()) {
                a._numers.push(new UnitPart(second.getName(),1,second.getRatio()));
                a._denoms.push(new UnitPart(first.getName(),1,first.getRatio()));
            } else {
                //console.log("must convert between bases");
                var cvv = UNITS.findConversion(first.getBase(), second.getBase());
                //console.log("found conversion",cvv);
                if(cvv) {
                    //convert first to it's base
                    //convert base to other base
                    //convert other base to second
                    a._numers.push(new UnitPart(first.getBase(),1,1));
                    a._denoms.push(new UnitPart(first.getName(),1,first.getRatio()));
                    a._numers.push(new UnitPart(cvv.to,1,1));
                    a._denoms.push(new UnitPart(cvv.from,1,cvv.ratio));
                    a._numers.push(new UnitPart(second.getName(),1,second.getRatio()));
                    a._denoms.push(new UnitPart(second.getBase(),1,1));
                    //console.log("now a is",a);
                }
            }
        }
    }

    convert(b) {
        var a = this;
        console.log("converting", a.toString());
        console.log('to', b.toString());
        this.process(a,b,'duration');
        this.process(a,b,'length');
        this.process(a,b,'volume');
        a = a.reduce();
        //console.log("now a is",a);
        return a;
    }

    reduce() {
        //console.log("a is",this.toString());
        var u2 = this;//this.clone();
        var v2 = this._value;
        //console.log('v2 is',v2);
        var n1 = u2._numers.slice();
        var d1 = u2._denoms.slice();
        //reduce dimension of any unit on both top and bottom
        //console.log("before n1 is",n1);


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
        //console.log("after  n1 is",n1);
        //console.log("after  d1 is",d1);
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
        n1 = n1.filter((u)=>u._dim>0);
        d1 = d1.filter((u)=>u._dim>0);
        console.log("after we have",n1,d1,v2);
        return new LiteralNumber(v2,n1,d1);//ComplexUnit(n1,d1);
    }



    collapse() {
        function removeNone(a) {
            if(a.type === 'none') return false;
            return true;
        }
        function cl(a,b) {
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
        var ns = this._numers.filter(removeNone).reduce(cl,[]);
        var ds = this._denoms.filter(removeNone).reduce(cl,[]);
        return new LiteralNumber(this._value, ns, ds);
    }

}

class UnitPart {
    constructor(name, dim, factor) {
        this._name = UNITS.getCanonicalName(name);
        this._dim = (dim ? dim : 1);
        this._factor = (factor ? factor : 1);
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