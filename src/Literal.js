/**
 * Created by josh on 4/22/17.
 */
var Decimal = require('decimal.js');

var UNITS = {};
function makeTime(dr) {
    var unit = {
        name:dr.name,
        dimension: 1,
        type:'duration',
        base:'second',
        ratio: dr.ratio
    };
    UNITS[unit.name] = unit;
    dr.abbr.forEach((abbr) =>  UNITS[abbr] = unit);
}
makeTime({name:'second',abbr:['s','sec','seconds'], ratio:1});
makeTime({name:'minute',abbr:['min','minutes'], ratio:60.0});
makeTime({name:'hour',  abbr:['hr','hours'],ratio: 60*60});
makeTime({name:'day',   abbr:['day','days'],ratio: 60*60*24});
makeTime({name:'month', abbr:['months'],ratio: 60*60*24*30});
makeTime({name:'year',  abbr:['yr','years'],ratio: 60*60*24*365});

function make(name,dim,type,base,ratio,...abbr) {
    var unit = { name:name, dimension:dim, type:type,base:base,ratio:ratio};
    UNITS[unit.name] = unit;
    UNITS[unit.name+'s'] = unit;
    abbr.forEach((abbr)=>UNITS[abbr]=unit);
    console.log('added',unit.name, abbr, unit.ratio);
}

var metric_prefixes = ['kilo','mega','giga','tera','peta','exa','zetta','yotta'];
metric_prefixes.forEach((prefix,i)=>{
    let abbr1 = prefix[0].toUpperCase()+'B';
    make(prefix+'byte',1,'storage','byte',Math.pow(1000,i+1),abbr1);
    let abbr2 = prefix[0].toLowerCase()+'b';
    make(prefix+'bit',1,'storage','bit',Math.pow(1000,i+1),abbr2);
});

['kibi','mebi','gibi','tebi','pebi','exbi','zebi','yobi'].forEach((prefix,i)=>{
    let abbr1 = prefix[0].toUpperCase()+'iB';
    make(prefix+'byte',1,'storage','byte',Math.pow(1000,i+1),abbr1);
    let abbr2 = prefix[0].toUpperCase()+'ib';
    make(prefix+'bit',1,'storage','bit',Math.pow(1000,i+1),abbr2);
});


make('meter',1,'distance','meter',1,'m');
make('decameter',1,'distance','meter',10,'dam');
make('hectometer',1,'distance','meter',100,'hm');
make('kilometer',1,'distance','meter',1000,'km');
metric_prefixes.slice(1).forEach((prefix,i)=>{
    let abbr1 = prefix[0].toUpperCase()+'m';
    make(prefix+'meter',1,'distance','meter',Math.pow(1000,i+2),abbr1);
});

make('decimeter',1,'distance','meter',1/10,'dm');
make('centimeter',1,'distance','meter',1/100,'cm');
const metric_sub_prefixes = ['milli','micro','nano','pico','femto','atto','zepto','yocto'];
metric_sub_prefixes.forEach((prefix,i) => {
    make(prefix+'meter',1,'distance','meter',Math.pow(1000,-(i+1)),prefix[0]+'m');
});

make('mile',1,'distance','meter',1609.344,'mi');
make('foot',1,'distance','meter',0.3048,'feet','ft');
make('yard',1,'distance','meter',0.3048*3,'yards','yd');

make('foot',2,'area','meter',0.3048,'sqft','squarefeet');
make('foot',3,'volume','meter',0.3048,'cuft','cubicfeet');


make('gallon',1,'volume','gallon',1,'gallons','gal');
make('quart',1,'volume','gallon',1/4,'quarts','qt');
make('pint',1,'volume','gallon',1/8,'pints');
make('cup',1,'volume','gallon',1/16,'cups');
make('tablespoon',1,'volume','gallon',1/256,'tablespoons','tbs');
make('teaspoon',1,'volume','gallon',1/(256*3),'teaspoons','tsp');

class Unit {
    constructor(name, dimension) {
        if(UNITS[name]) {
            var unit = UNITS[name];
            this.name = unit.name;
            this.dimension = unit.dimension;
            this.type = unit.type;
            this.base = unit.base;
            this.ratio = unit.ratio;
        }

        if(dimension) this.dimension = dimension;

        if(!this.name) throw new Error("unrecognized unit " + name);
    }
    convertTo(val,name) {
        var unit = new Unit(name);
        console.log('converting', val.toString(), this.name,'to',name);
        console.log("types", this.type, unit.type, this.ratio, unit.ratio);
        if(this.type !== unit.type) {
            throw new Error(`'${this.type}' and '${unit.type}' are incompatible types. Cannot convert between them.`);
        }
        return val * this.ratio / unit.ratio;
    }
    multiply(unit) {
        return new Unit(this.name, this.dimension + unit.dimension);
    }
}

class Literal {
    constructor(value, unit, dimension) {
        if(!(value instanceof Decimal)) {
            this.value = new Decimal(value);
        } else {
            this.value = value;
        }
        if(unit) {
            if(unit instanceof Unit) {
                this.unit = unit;
            } else {
                this.unit = new Unit(unit,dimension);
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
        if((!this.unit && !b.unit)
            || (this.unit && !b.unit)
            || (!this.unit && b.unit)) {
            return new Literal(this.value * b.value, this.unit);
        }
        //both have a unit
        return new Literal(this.value.mul(b.value), this.unit.multiply(b.unit));
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
