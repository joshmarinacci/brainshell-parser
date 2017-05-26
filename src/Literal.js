/*
new plan:

* move replace literal.unit and literal.dimension with a single unit object
* make unit objects be instances of a Unit class
* make plans for the compound unit system using a CompoundUnit class w/ the same interface


ex: 60mi/hr
ex: 60 min * 60 mi/hr
 ex: 9.8 m/s^2  * 10 s


if(unit.isCompound() || b.unit.isCompound()) {
  return UNIT.compoundMultiply(this,b)
}

*/

/**
 * Created by josh on 4/22/17.
 */
//var Decimal = require('decimal.js');

const UNIT = {
    makeFromNameAndDimension(name,dim) {
        var su = new SimpleUnit(name,dim);
        return new ComplexUnit([su],[]);
    },
    sameTypes(a,b) {
        if(a.getUnit().isCompound() || b.getUnit().isCompound()) {
            let au = a.getUnit().asComplex();
            let bu = b.getUnit().asComplex();
            return au.sameType(bu);
        }
        return a.getUnit().type === b.getUnit().type;
    },

    getCanonicalName(name) {
        if(cvs.units[name]) return cvs.units[name].name;
        if(abbrevations[name]) return abbrevations[name];
        if(!name) return null;
        console.log("WARNING. no canonical name found for unit " + name);
        return null;
    },
    lookupUnit(name) {
        if(!cvs.units[name]) {
            console.log("WARNING. No unit for name",name);
            throw new Error();
        }
        return cvs.units[name];
    },
    withDimension(unit,dim) {
        var u = unit.clone();
        u.dimension = dim;
        return u;
    },
    dimConvert(from, to, fu) {
        //console.log("dimension convert from", from.toString(), 'to',to.toString(), 'with',fu);
        let ret = this.convert(from, this.lookupUnit(fu.base));
        //console.log("ret = ", ret.toString(),ret.getUnit());
        if(ret.getUnit().isCompound()) {
            var u = ret.getUnit();
            var val = ret.getValue();
            var tu = to.base;
            //console.log('target unit is', tu);
            //console.log("target unit base is", to.base);
            var match = null;
            cvs.dims.forEach((cv)=>{
                if(cv.to.name == tu) {
                    //console.log("converter",cv);
                    ret.getUnit().numers.find((nu)=>{
                        //console.log("looking at numer",nu);
                        if(nu.name == cv.from.name && nu.dimension == cv.from.dim) {
                            //console.log("found a keeper");
                            match = cv;
                        }
                    });
                }
            });
            //console.log("found a matching converter",match);
            if(match) {
                //console.log('value is',val);
                let u3 = new ComplexUnit(
                    u.numers.concat(new SimpleUnit(match.to.name, match.to.dim)),
                    u.denoms.concat(new SimpleUnit(match.from.name, match.from.dim)));
                //console.log("u3", u3);
                var retx = this.expand(u3);
                val = val * retx[0];
                u3 = retx[1];

                var u4 = UNIT.reduce(u3);
                //console.log("u4 = ", u4);
                var v5 = new Literal(val/match.ratio,u4);
                //console.log("v5 = ", v5.toString());
                return this.convert(v5,to);
            }
        }

        let conv = cvs.dims.find((cv) => {
            if(cv.from.name == ret.getUnit().name && cv.from.dim == ret.getUnit().dimension) {
                return true;
            }
        });
        if(!conv) throw new Error("no conversion found for " + from +" to " + JSON.stringify(to));
        let ret2 =  new Literal(ret.value/conv.ratio).withUnit(conv.to.name, conv.to.dim);
        return this.convert(ret2,to);
    },
    convert(from, to) {
        console.log(`--- converting  ${from} to ${to}`);
        var fu = from.getUnit();
        var tu = to;//this.lookupUnit(to.getUnit().name);
        //already equal
        if(from.getUnit().equal(to)) return from;

        //if source unit has only one component, and so does target unit
        // the find conversion factor from source to target

        console.log("target unit is", to);
        var tt = to.numers[0];
        var conv = new ComplexUnit([new SimpleUnit(tt.name,1)],
            [new SimpleUnit(tt.base,1)]);
        //to.name / to.ratio * to.base
        return this.compoundConvert(from,new Literal(1,conv));
        //console.log("got from = ",fu.toString());
        //console.log("got   to = ",tu.toString());
        /*
        if(fu.isCompound() && fu.canReduceToSimple()) {
            return this.convert(new Literal(from.value,fu.reduceToSimple()),to);
        }
        if(fu.base == tu.base) {
            var f =Math.pow(tu.ratio/fu.ratio,fu.dimension);
            return new Literal(from.value*f).withUnit(to.name,fu.dimension);
        }
        var cvv = cvs.bases.find((cv)=> {
            return (cv.from == fu.base && cv.to == tu.base);
        });
        //console.log("got a cvv",cvv);
        if(cvv) return new Literal(
            from.value/fu.ratio/Math.pow(cvv.ratio,fu.dimension)*tu.ratio)
            .withUnit(to.getUnit().name,fu.dimension);

        if(fu.type == 'length' && fu.dimension == 3 && tu.type == 'volume') {
            return this.dimConvert(from,to,fu);
        }
        if(fu.type == 'length' && fu.dimension == 2 && tu.type == 'area') {
            return this.dimConvert(from,to,fu);
        }
        //
        //upgrade to a complex unit
        return new Literal(from.getValue(), fu.asComplex());
        */
    },
    compoundMultiply(a,b) {
        var v2 = a.getValue() * b.getValue();
        var l2 = a.clone();
        l2.value = v2;
        return this.compoundConvert(l2,b);
    },
    compoundConvert(a,b) {
        console.log("compound converting", a.toString(), 'to', b.toString());
        var v2 = a.getValue();
        console.log("new value is", v2);

        //make everything be compound
        var au = a.getUnit();
        var bu = b.getUnit();
        if(!au.isCompound()) au = new ComplexUnit([this.lookupUnit(au.name)],[]);
        if(!bu.isCompound()) bu = new ComplexUnit([this.lookupUnit(bu.name)],[]);
        //console.log('units',au.toString(),au,bu.toString(),bu);

        var u2 = new ComplexUnit(au.numers.concat(bu.numers),au.denoms.concat(bu.denoms));
        console.log("new unit is",u2.toString());

        //fully expand and convert units to common types
        var ret = this.expand(u2);
        v2 = v2 * ret[0];
        console.log("final value is", v2);
        u2 = ret[1];
        u2 = u2.collapse();
        console.log("expanded to ", u2.toString());

        //cancel and reduce
        u2 = this.reduce(u2);
        console.log("reduced to", u2.toString());
        u2 = u2.collapse();
        console.log("collapsed to", u2.toString());
        console.log("final final value is", v2);
        return new Literal(v2, u2);
    },


    expand(unit) {
        var v2 = 1;
        //if top and bottom have a time or length then expand it
        function check(u2,type) {
            var top = u2.numers.find((u)=>u.type==type);
            var bot = u2.denoms.find((u)=>u.type==type);
            console.log("found for type", type,top,bot);
            if(top && bot) {
                if(top.name == bot.name) {
                    console.log("same on top and bottom. ignore");
                    return u2;
                }
                if(top.base === bot.base) {
                    u2.denoms.push(UNIT.lookupUnit(top.name));
                    u2.numers.push(UNIT.lookupUnit(bot.name));
                    var factor = bot.ratio/top.ratio;
                    v2 = v2 * factor;
                } else {
                    //console.log("must convert between bases");
                    var cvv = cvs.bases.find((cv) => cv.from == top.base && cv.to == bot.base);
                    //console.log("found conversion",cvv);
                    if(cvv) {
                        v2 = v2/top.ratio/Math.pow(cvv.ratio,top.dimension)*bot.ratio;
                        //console.log("new v2 = ", v2);
                        u2.denoms.push(UNIT.lookupUnit(top.name));
                        u2.numers.push(UNIT.lookupUnit(bot.name));
                    }

                }
            }
            return u2;
        }
        unit = check(unit,'duration');
        unit = check(unit,'length');
        return [v2,unit];
    },

    reduce(u2) {
        u2 = u2.clone();
        var n1 = u2.numers.slice();
        var d1 = u2.denoms.slice();
        //reduce dimension of any unit on both top and bottom
        n1.forEach((n) => {
            d1.forEach((d) => {
                if(n.name == d.name) {
                    if(n.dimension > 0 && d.dimension > 0) {
                        var sum = Math.min(n.dimension, d.dimension);
                        n.dimension-= sum;
                        d.dimension-= sum;
                    }
                }
            });
        });
        //remove any units that were reduced to zero
        n1 = n1.filter((u)=>u.dimension>0);
        d1 = d1.filter((u)=>u.dimension>0);
        //console.log("after we have",n1,d1);
        return new ComplexUnit(n1,d1);
    }
};


class SimpleUnit {
    constructor(name,dimension) {
        this.name = UNIT.getCanonicalName(name);
        //console.log("making a simple unit with",this.name,dimension);
        var canon = UNIT.lookupUnit(this.name);
        //console.log('cannon',canon);
        this.base = canon.base;
        this.ratio = canon.ratio;
        this.type = canon.type;
        this.dimension = dimension;
    }
    toString() {
        return "siu:" + this.name + "^" + this.dimension;
    }
    equal(b) {
        if(b.isCompound()) return b.equal(this);
        return (this.name === b.name && this.dimension == b.dimension);
    }
    getUnit() {
        return this;
    }
    isNone() {
        return  this.name === 'none';
    }
    isCompound() { return false; }
    asComplex() {
        return new ComplexUnit([this],[]);
    }
    clone() {
        return new SimpleUnit(this.name, this.dimension);
    }
}

class ComplexUnit {
    constructor(numers,denoms) {
        if(!numers) numers = [];
        if(!denoms) denoms = [];
        this.numers = numers;
        this.numers = numers.map((n) => {
            if(!(n instanceof SimpleUnit)) {
                return new SimpleUnit(n.name, n.dimension);
            }
            return n;
        });
        this.denoms = denoms;
    }
    toString() {
        return "cxu:"+
            this.numers.map((u)=>u.name + "^" + u.dimension).join(" ")
            + '/' +
            this.denoms.map((u)=>u.name + "^" + u.dimension).join(" ");
    }
    equal(b) {
        var a = this.collapse();c
        if(!b.isCompound()) b = b.asComplex();
        b = b.collapse();
        if(a.numers.length !== b.numers.length) return false;
        if(a.denoms.length !== b.denoms.length) return false;
        for(let i=0; i<a.numers.length; i++) {
            if(a.numers[i].name !== b.numers[i].name) return false;
        }
        return true;
    }
    sameType(b) {
        var a = this.collapse();
        b = b.collapse();
        return (a.numers[0].type == b.numers[0].type);
    }
    isNone() {
        //console.log("numers = ", this.numers[0]);
        if(this.numers.length == 1 && this.numers[0].isNone() && this.denoms.length == 0) return true;
        return false;
    }
    isCompound() { return true; }
    asComplex() { return this; }
    invert() {
        var n2 = this.numers.map((u)=>u.clone());
        var d2 = this.denoms.map((u)=>u.clone());
        return new ComplexUnit(d2,n2);
    }
    canReduceToSimple() {
        return (this.numers.length == 1 && this.denoms.length == 0)
    }
    reduceToSimple() {
        var n1 = this.numers[0];
        return new SimpleUnit(n1.name,n1.dimension);
    }
    clone() {
        var n2 = this.numers.map((u)=>u.clone());
        var d2 = this.denoms.map((u)=>u.clone());
        return new ComplexUnit(n2,d2);
    }

    collapse() {
        //TODO: make this reusable
        function removeNone(a) {
            if(a.type === 'none') return false;
            return true;
        }
        function cl(a,b) {
            if(a.length == 0) return a.concat([b]);
            var last = a.pop();
            if(last.name == b.name) {
                a.push(new SimpleUnit(last.name,last.dimension + b.dimension));
                return a;
            } else {
                a.push(last);
                a.push(b);
                return a;
            }
        }
        var ns = this.numers.filter(removeNone).reduce(cl,[]);
        var ds = this.denoms.filter(removeNone).reduce(cl,[]);
        return new ComplexUnit(ns,ds);
    }
}


class Literal {
    constructor(value, unit) {
        this.type = 'number';
        this.format = 'none';
        this.value = value;
        this._unit = unit;
        if(typeof unit === 'string') {
            throw new Error('cannot create a literal with a string unit anymore');
        }
        console.log("created final literal:",this.toString());
        if(!value) {
            throw new Error('invalid value');
        }
    }
    clone() {
        var lit = new Literal(this.value, this.getUnit().clone());
        lit.format = this.format;
        return lit;
    }
    withUnit(u,dim) {
        if(!u) return this;
        if(!dim) dim = 1;
        if(typeof u === 'string') return new Literal(this.value).withComplexUnitArray([u,dim]);
        throw new Error("can't handle other kind of unit");
    }
    withSimpleUnit(unit) {
        //console.log("making an new literal ",this.value, unit.toString());
        return new Literal(this.value,unit);
    }
    withComplexUnitArray(numers,denoms) {
        var nums = [];
        for(var i=0; i<numers.length; i++) {
            var u = numers[i];
            if (typeof u === 'string') {
                u = UNIT.getCanonicalName(u);
                var unit = UNIT.lookupUnit(u);
                if (typeof numers[i+1] === 'number') {
                    nums.push(new SimpleUnit(unit.name, numers[i+1]));
                    i++;
                } else {
                    nums.push(unit);
                }
            }
        }
        if(!denoms) denoms = [];
        if(typeof denoms[0] === 'string') {
            denoms = [UNIT.lookupUnit(denoms[0])];
        }
        return new Literal(this.value, new ComplexUnit(nums,denoms));
    }
    toString () {
        return this.value + " " + this.getUnit();
    }
    getUnit() {
        if(!this._unit) return new ComplexUnit([new SimpleUnit("none",0)],[]);
        return this._unit;
    }
    as(target) {
        if(target.type === 'format') {
            return this.withPreferredFormat(target);
        }
        return UNIT.convert(this,target);
    };
    multiply(b) {
        console.log(`multiplying ${this} by ${b}`);
        //multiply with only one unit
        if(this.getUnit().isNone()) {
            return new Literal(this.value* b.value).withSimpleUnit(b.getUnit());
        }
        //multiply with only one unit
        if(b.getUnit().isNone()) {
            return new Literal(this.value* b.value).withSimpleUnit(this.getUnit());
        }
        return UNIT.compoundMultiply(this,b);
        //if(this.getUnit().isCompound() || b.getUnit().isCompound()) return UNIT.compoundMultiply(this,b);
        //multiply with same units
        //if(this.getUnit().name == b.getUnit().name) {
        //    return new Literal(this.value * b.value).withUnit(this.getUnit().name,this.getUnit().dimension + b.getUnit().dimension);
        //}

        //convert the first to the second unit
        //return UNIT.convert(this,b).multiply(b);
    }
    divide(b) {
        return this.multiply(b.invert());
    }
    add(b) {
        if(this.getUnit().equal(b.getUnit())) {
            return new Literal(this.value + b.value,this.getUnit());
        }
        if(UNIT.sameTypes(this,b)) {
            return UNIT.convert(this, b.getUnit()).add(b);
        }
        throw new Error("bad add");
    }
    subtract(b) {
        if(this.getUnit().equal(b.getUnit())) {
            return new Literal(this.value - b.value, this.getUnit());
        }
        if(UNIT.sameTypes(this,b)) {
            UNIT.convert(this, b.getUnit()).subtract(b);
        }
        throw new Error("bad subtract");
    }
    exponent(b) {
        return new Literal(Math.pow(this.value, b.value), this.getUnit());
    }
    invert() {
        var u = this.getUnit();
        if(!u.isCompound()) u = u.asComplex();
        if(u.isCompound()) u = u.invert();
        return new Literal(1/this.value,u);
    }
    sameUnits(b) {
        return this.getUnit().equal(b.getUnit());
    }
    withPreferredFormat(format) {
        var lt = this.clone();
        lt.format = format;
        if(format.name) lt.format = format.name;
        return lt;
    }
    toCanonical() {
        if(this.format === 'hex') return '0x'+this.value.toString(16);
        return this.value.toString(10);
    }
    getValue() {
        return this.value;
    }
    equal(b) {
        return this.value == b.value;
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
    LiteralString:LiteralString,
    UNIT: UNIT,
    SimpleUnit: SimpleUnit,
    ComplexUnit: ComplexUnit
};
