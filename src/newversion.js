/**
 * Created by josh on 5/22/17.
 */
var test = require('tape');
require('tape-approximately')(test);

var UNITS = require('./units2');

/*
create a new implementation. forget the parser for now. just do unit calcs.
    new LiteralNumber(value, numers, denoms)
or UNITS.makeNumber(5, [['ft']],[['s']]) = 5 ft/s
UNITS.makeNumber(9.8 [['m']],[['s',2]]) = 9.8 m/s^2

for multiplying, combine the units then expand and reduce

for converting
    if number unit equal to target unit end
find conversions of the same type that apply to the target
apply conversions
reduce
if equal now, then end
find conversions across type that apply to the target
apply conversions
reduce
if equal now, then end
else, not convertible. throw error
*/

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
        function check(u2,type) {
            var top = u2._numers.find((u)=>u.getType()==type);
            var bot = u2._denoms.find((u)=>u.getType()==type);
            //console.log("found for type", type,top,bot);
            if(top && bot) {
                if(top.getName() == bot.getName()) {
                    console.log("same on top and bottom. ignore");
                    return u2;
                }
                //TODO: this conversion code is almost identical to what is below
                if(top.getBase() === bot.getBase()) {
                    console.log("same base",top.getRatio(),bot.getRatio());
                    u2._numers.push(new UnitPart(bot.getName(),1,bot.getRatio()));
                    u2._denoms.push(new UnitPart(top.getName(),1,top.getRatio()));
                } else {
                    console.log("must convert between bases");
                    var cvv = UNITS.findConversion(top.getBase(), bot.getBase());
                    console.log("found conversion",cvv);
                    if(cvv) {
                        u2._numers.push(new UnitPart(cvv.to,1,1));
                        u2._denoms.push(new UnitPart(cvv.from,1,cvv.ratio));
                    }

                }
            }
            return u2;
        }
        check(this,'duration');
        check(this,'length');
        return this;
    }

    convert(b) {
        var a = this;
        console.log("converting", a.toString());
        console.log('to', b.toString());
        console.log("a value", a._value, 'and b = ', b._value);
        function check(u1,u2,type) {
            var first = u1._numers.find((u)=>u.getType() == type);
            var secon = u2._numers.find((u)=>u.getType() == type);
            //console.log("found for type", type,first,secon);
            return {
                type:type,
                first:first,
                second:secon
            }
        }
        //var res = check(a,b,'length');

        // TODO: this conversion code is almost identical to what is above
        //find a unit in first with the same type as a unit in second, in the numers only.
        function process(a,b,type) {
            var res = check(a,b,type);
            //add a conversion from first unit to the second
            if(res.first && res.second) {
                //console.log("found a match",res);
                console.log("looking for a conversion from",res.first.getName(),'to',res.second.getName());
                if(res.first.getBase() == res.second.getBase()) {
                    //console.log("same base");
                    //first.ratio * first.base / 1 * first.name //  60s*60s/1h
                    a._numers.push(new UnitPart(res.second.getName(),1,res.second.getRatio()));
                    a._denoms.push(new UnitPart(res.first.getName(),1,res.first.getRatio()));
                    //console.log("now a is", a.toString());
                }
            }
        }
        process(a,b,'duration');
        process(a,b,'length');

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
        this._name = name;
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

function compare(t,res,ans) {
    console.log(`comparing ${res} to ${ans}`);
    t.approximately(res.getValue(),ans.getValue(), 0.5);
    t.equal(res.equalUnits(ans),true);
}
test('basic conversion',(t)=>{
    compare(t,new LiteralNumber(5).withUnits(['hour'],[])
        .as(new LiteralNumber(1).withUnits(['second'],[])),
        new LiteralNumber(5*60*60).withUnits(['second'],[]));
    compare(t, new LiteralNumber(3).withUnits(['foot'],[]).multiply(new LiteralNumber(1).withUnits(['foot'],['second'])),
        new LiteralNumber(3).withUnits([['foot',2]],['second']));
    compare(t, new LiteralNumber(3).withUnits(['foot'],[]).divide(new LiteralNumber(1).withUnits(['foot'],['second'])),
        new LiteralNumber(3).withUnits(['second']));
    compare(t, new LiteralNumber(3).withUnits(['foot']).divide(new LiteralNumber(1).withUnits(['foot'],['second'])).as(new LiteralNumber(1).withUnits(['second'])),
        new LiteralNumber(3).withUnits(['second'])
    );
    compare(t, new LiteralNumber(3).withUnits(['foot']).divide(new LiteralNumber(1).withUnits(['foot'],['minute'])).as(new LiteralNumber(1).withUnits(['second'])),
        new LiteralNumber(3*60).withUnits(['second'])
    );
    compare(t, new LiteralNumber(1).withUnits(['meter']).divide(new LiteralNumber(1).withUnits(['foot'],['second'])),
        new LiteralNumber(3.28084).withUnits(['second'])
    );
    compare(t, new LiteralNumber(60).withUnits(['mile']), new LiteralNumber(60).withUnits(['mile']));
    compare(t, new LiteralNumber(60).withUnits(['mile'],['hour']).multiply(new LiteralNumber(2)), new LiteralNumber(120).withUnits(['mile'],['hour']));
    compare(t, new LiteralNumber(60).withUnits(['minute']).multiply(new LiteralNumber(60).withUnits(['mile'],['hour'])),
        new LiteralNumber(60).withUnits(['mile'])
    );

    compare(t, new LiteralNumber(9.8).withUnits(['meter'],[['second',2]]), new LiteralNumber(9.8).withUnits(['meter'],[['second',2]]));
    compare(t, new LiteralNumber(9.8).withUnits(['meter'],[['second',2]]).multiply(new LiteralNumber(10).withUnits(['second'])),
        new LiteralNumber(98.0).withUnits(['meter'],[['second',2]]));
    compare(t, new LiteralNumber(10).withUnits(['second']).multiply(new LiteralNumber(9.8).withUnits(['meter'],[['second',2]])),
        new LiteralNumber(98.0).withUnits(['meter'],[['second',2]]));

    compare(t, new LiteralNumber(4000).withUnits(['mile'])
        .multiply(new LiteralNumber(1).withUnits(['hour']))
        ,new LiteralNumber(4000).withUnits(['mile','hour'])
    );
    compare(t, new LiteralNumber(4000).withUnits(['mile'])
        .multiply(new LiteralNumber(1).withUnits(['hour']))
        .divide(new LiteralNumber(40).withUnits(['mile']))
        ,new LiteralNumber(100).withUnits(['hour'])
    );
    compare(t, new LiteralNumber(600000).withUnits(['meter'])
        .divide(new LiteralNumber(40).withUnits(['mile'],['hour']))
        ,new LiteralNumber(9.32).withUnits(['hour'])
    );
    compare(t, new LiteralNumber(1)
        .divide(new LiteralNumber(10).withUnits(['meter'],['second']))
        ,new LiteralNumber(0.1).withUnits(['second'],['meter'])
    );
    compare(t, new LiteralNumber(5).withUnits(['kilometer'])
        .divide(new LiteralNumber(5).withUnits(['meter'],['second']))
        ,new LiteralNumber(1000).withUnits(['second'])
    );
    //compareComplexUnit(t,'5km / 5m/s',new Literal(1000).withComplexUnitArray(['second',1],[]));
    const ER = 6371.008;
    compare(t, new LiteralNumber(ER).withUnits(['kilometer'])
        .divide(new LiteralNumber(4000).withUnits(['foot'],['second']))
        .as(new LiteralNumber(1).withUnits(['hour']))
    ,new LiteralNumber((ER*1000/1219.2)/60/60).withUnits(['hour'])
    );


    compare(t, new LiteralNumber(ER).withUnits(['kilometer'])
        .multiply(new LiteralNumber(2))
        .multiply(new LiteralNumber(Math.PI))
        .divide(new LiteralNumber(60).withUnits(['kilometer'],['hour']))
        .as(new LiteralNumber(1).withUnits(['day']))
        ,new LiteralNumber(ER*2*Math.PI/60/24).withUnits(['day'])
    );
    //compareComplexUnit(t,'earth.radius * 2 * pi / 60 km/hr as days', new Literal(ER*Math.PI*2/60/24).withUnit('day'));

    //compareComplexUnit(t,'jupiter.radius^3 * 4/3 * pi', new' +
    //' Literal(Math.pow(JR,3)*4/3*Math.PI).withComplexUnitArray(['kilometer',3],[]));
    var JR = 69911;
    compare(t, new LiteralNumber(JR).withUnits(['kilometer'])
        .exponent(new LiteralNumber(3))
        .multiply(new LiteralNumber(4))
        .divide(new LiteralNumber(3))
        .multiply(new LiteralNumber(Math.PI))
    , new LiteralNumber(Math.pow(JR,3)*4/3*Math.PI).withUnits([['kilometer',3]])
    );

    compare(t, new LiteralNumber(JR).withUnits(['kilometer'])
        .exponent(new LiteralNumber(3))
        .multiply(new LiteralNumber(4))
        .divide(new LiteralNumber(3))
        .multiply(new LiteralNumber(Math.PI))
        .divide(
            new LiteralNumber(ER).withUnits(['kilometer'])
                .exponent(new LiteralNumber(3))
                .multiply(new LiteralNumber(4))
                .divide(new LiteralNumber(3))
                .multiply(new LiteralNumber(Math.PI))
        )
        , new LiteralNumber(1321.33)
    );

    //compareComplexUnit(t,'(jupiter.radius^3 * 4/3 * pi) / (earth.radius^3 * 4/3 * pi)', new' +
    //' Literal(1321.33));
    t.end();


});