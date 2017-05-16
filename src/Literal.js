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

var abbrevations = {
    'in':'inch',
    'inches':'inch',
    'ft':'foot',
    'feet':'foot',
    'yards':'yard',
    'yd':'yard',
    'miles':'mile',
    'mi':'mile',
    'leagues':'league',

    's':'second',
    'seconds':'second',
    'min':'minute',
    'minutes':'minute',
    'hr':'hour',
    'hours':'hour',
    'days':'day',
    'months':'month',
    'years':'year',

    'm':'meter',
    'meters':'meter',
    'km':'kilometer',
    'kilometers':'kilometer',
    'cm':'centimeter',
    'mm':'millimeter',
    'millimeters':'millimeter',

    'gal':'gallon',
    'gallons':'gallon',
    'qt':'quart',
    'pt':'pint',
    'cups':'cup',
    'tablespoons':'tablespoon',
    'tbsp':'tablespoon',
    'teaspoons':'teaspoon',
    'tsp':'teaspoon',
    'l':'liter',
    'liters':'liter',
    'ml':'milliliter',
    'milliliters':'milliliter',

    'grams':'gram',
    'g':'gram',
    'kg':'kilogram',
    'kilograms':'kilogram',
    'oz':'ounce',
    'ounces':'ounce',
    'pounds':'pound',
    'lbs':'pound',
    'lb':'pound',

    'TB':'terabyte',
    'GB':'gigabyte',
    'MB':'megabyte',
    'KB':'kilobyte',
    'TiB':'tibibyte',
    'GiB':'gibibyte',
    'MiB':'mebibyte',
    'KiB':'kibibyte',
    'Gibit':'gibibit',
    'TBit':'terabit',
    'Gbit':'gigabit',
    'Mbit':'megabit',

    'acres':'acre',
    'ac':'acre',

};

var cvs = {
    units: {
        'sqft': {
            name:'foot',
            base:'foot',
            ratio:1,
            type:'area',
            dimension:2
        },
        'cuft': {
            name:'foot',
            base:'foot',
            ratio:1,
            type:'volume',
            dimension:3
        }
    },
    //convert between unit bases
    bases: [
        {
            from:'gallon',
            ratio: 1/3.78541,
            to:'liter'
        },
        {
            from:'liter',
            ratio: 1/0.264172,
            to:'gallon'
        },
        {
            from:'meter',
            ratio:1/3.28084,
            to:'foot'
        },
        {
            from:'foot',
            ratio:3.28084,
            to:'meter'
        },
        {
            from:'pound',
            ratio:1/453.592,
            to:'gram'
        }
    ],
    //convert between unit types
    dims: [
        {
            from: {
                name:'foot',
                dim:3,
                type:'length'
            },
            ratio:0.133681,
            to: {
                name:'gallon',
                dim:1,
                type:'volume'
            }
        },
        {
            from: {
                name:'meter',
                dim:3,
                type:'length'
            },
            ratio:1/1000,
            to: {
                name:'liter',
                dim:1,
                type:'volume'
            }
        },
        {
            from: {
                name:'meter',
                dim:2,
                type:'length'
            },
            ratio:4046.86,
            to: {
                name:'acre',
                dim:1,
                type:'area'
            }
        },
        {
            from: {
                name:'foot',
                dim:2,
                type:'length'
            },
            ratio:43560,
            to: {
                name:'acre',
                dim:1,
                type:'area'
            }
        }
    ]
};

function addUnit(name,base,ratio,type) {
    cvs.units[name] = {
        name:name,
        base:base,
        ratio:ratio,
        type:type,
        dimension:1,
        getUnit: function() {
            return this;
        }
    }
}
addUnit('none','none',1,'none');
addUnit('meter','meter',1,'length');
addUnit('foot','foot',1,'length');
addUnit('gram','gram',1,'mass');
addUnit('pound','pound',1,'mass');
addUnit('acre','acre',1,'area');
addUnit('gallon','gallon',1,'volume');
addUnit('liter','liter',1,'volume');
addUnit('second','second',1,'duration');
addUnit('byte','byte',1,'storage');
addUnit('bit','bit',1,'storage');

addUnit('inch','foot',12,'length');
addUnit('yard','foot',1/3,'length');
addUnit('mile','foot',1/5280,'length');
addUnit('kilogram','gram',1/1000,'mass');
addUnit('milliliter','liter',1000,'volume');
addUnit('ounce','pound',16,'mass');

function addDuration(name,ratio) {
    addUnit(name,'second',ratio,'duration');
}
addDuration('minute',1/(60));
addDuration('hour',1/(60*60));
addDuration('day',1/(60*60*24));
addDuration('month',1/(60*60*24*30));
addDuration('year',1/(60*60*24*365));

function addMeterLength(name,ratio) {
    addUnit(name,'meter',ratio,'length');
}
addMeterLength('centimeter',100);
addMeterLength('millimeter',1000);
addMeterLength('kilometer',1/1000);
addMeterLength('league',1/4000);

function addGallonVolume(name,ratio) {
    addUnit(name,'gallon',ratio,'volume');
}
addGallonVolume('teaspoon',256*3);
addGallonVolume('tablespoon',256);
addGallonVolume('cup',16);
addGallonVolume('pint',8);
addGallonVolume('quart',4);

function addByte(name,ratio) {
    addUnit(name,'byte',ratio,'storage');
}
addByte("kilobyte",1/1000);
addByte("megabyte",1/(1000*1000));
addByte("gigabyte",1/(1000*1000*1000));
addByte("terabyte",1/(1000*1000*1000*1000));

const UNIT = {
    makeUnit(name,dim) {
        return {unit: name,dim:dim};
    },
    sameUnits(a,b) {
        return a.getUnit().equal(b.getUnit());
    },
    sameTypes(a,b) {
        return a.getUnit().type === b.getUnit().type;
    },

    getCanonicalName(name) {
        if(cvs.units[name]) return cvs.units[name].name;
        if(abbrevations[name]) return abbrevations[name];
        if(!name) return null;
        console.log("WARNING. no canonical name found for unit " + name);
        return null;
    },
    hasCanonicalDimension(name) {
        return (cvs.units[name] && cvs.units[name].dimension > 1);
    },
    getCanonicalDimension(name) {
        if(cvs.units[name] && cvs.units[name].dimension > 1) return cvs.units[name];
        return null;
    },
    lookupUnit(name) {
        if(!cvs.units[name]) {
            console.log("WARNING. No unit for name",name);
            throw new Error();
        }
        return cvs.units[name];
    },
    dimConvert(from, to, fu) {
        let ret = this.convert(from, this.lookupUnit(fu.base));
        let toliter = cvs.dims.find((cv) => {
            if(cv.from.name == ret.getUnit().name && cv.from.dim == ret.getUnit().dimension) {
                return true;
            }
        });
        if(!toliter) throw new Error("no conversion found for " + from +" to " + JSON.stringify(to));
        let ret2 =  new Literal(ret.value/toliter.ratio).withUnit(toliter.to.name, toliter.to.dim);
        return UNIT.convert(ret2,to);
    },
    convert(from, to) {
        //console.log('-----');
        //console.log("new calc doing",from,'to',to);
        var fu = from.getUnit();
        var tu = this.lookupUnit(to.getUnit().name);
        //console.log("got from ",fu);
        //console.log("got   to ",tu);
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
        throw new Error("no conversion found");
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
        return this.name + "^" + this.dimension;
    }
    equal(b) {
        return (this.name === b.name && this.dimension == b.dimension);
    }
    getUnit() {
        return this;
    }
    isNone() {
        return  this.name === 'none';
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
        //console.log("created final literal:",this.toString());
    }
    clone() {
        var lit = new Literal(this.value).withSimpleUnit(this.unit);
        lit.format = this.format;
        return lit;
    }
    withUnit(u,dim) {
        if(!u) return this;
        if(!dim) dim = 1;
        if(typeof u === 'string') return new Literal(this.value,new SimpleUnit(u,dim));
        throw new Error("can't handle other kind of unit");
    }
    withSimpleUnit(unit) {
        return new Literal(this.value,unit);
    }
    toString () {
        return this.value + " " + this._unit;
    }
    getUnit() {
        if(!this._unit) return new SimpleUnit("none",0);
        return this._unit;
    }
    as(target) {
        //if(units[target].type === 'format') {
        //    return this.withPreferredFormat(target);
        //}
        return UNIT.convert(this,target);
    };
    multiply(b) {
        //multiply with only one unit
        if(this.getUnit().isNone()) {
            return new Literal(this.value* b.value).withSimpleUnit(b.getUnit());
        }
        //multiply with only one unit
        if(b.getUnit().isNone()) {
            return new Literal(this.value* b.value).withSimpleUnit(this.getUnit());
        }
        //multiply with same units
        if(this.getUnit().name == b.getUnit().name) {
            return new Literal(this.value * b.value).withUnit(this.getUnit().name,this.getUnit().dimension + b.getUnit().dimension);
        }
        //convert the first to the second unit
        return UNIT.convert(this,b).multiply(b);
    }
    divide(b) {
        return this.multiply(b.invert());
    }
    add(b) {
        if(UNIT.sameUnits(this,b)) {
            return new Literal(this.value + b.value).withSimpleUnit(this.getUnit());
        }
        if(UNIT.sameTypes(this,b)) {
            return UNIT.convert(this, b.getUnit()).add(b);
        }
        throw new Error("bad add");
    }
    subtract(b) {
        if(UNIT.sameUnits(this,b)) {
            return new Literal(this.value - b.value).withSimpleUnit(this.getUnit());
        }
        if(UNIT.sameTypes(this,b)) {
            UNIT.convert(this, b.getUnit()).subtract(b);
        }
        throw new Error("bad subtract");
    }
    exponent(b) {
        return new Literal(Math.pow(this.value, b.value));
    }
    invert() {
        return new Literal(1/this.value);
    }
    sameUnits(b) {
        return UNIT.sameUnits(this,b);
    }
    withPreferredFormat(format) {
        var lt = this.clone();
        lt.format = format;
        return lt;
    }
    toCanonical() {
        if(this.format === 'hex') {
            return '0x'+this.nv.toString(16);
        }
        return this.toString();
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
    SimpleUnit: SimpleUnit
};
