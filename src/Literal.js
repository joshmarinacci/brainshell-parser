/**
 * Created by josh on 4/22/17.
 */
//var Decimal = require('decimal.js');

/*var conversions = [];
addConversion(1,'terabyte',1000,'gigabyte');
addConversion(1,'tibibyte',1024,'gibibyte');
addConversion(1,'gigabyte',1000,'megabyte');
addConversion(1,'gibibyte',1024,'mebibyte');
addConversion(1,'megabyte',1000,'kilobyte');
addConversion(1,'mebibyte',1024,'kibibyte');
addConversion(1,'kilobyte',1000,'byte');
addConversion(1,'gigabyte',8,'gigabit');
addConversion(1,'gibibyte',8,'gibibit');

conversions.push({
    nv:1,
    nu:'foot',
    nd:3,
    dv:7.48052,
    du:'gallon',
    dd:1
});
conversions.push({
    nv:7.48052,
    nu:'gallon',
    nd:1,
    dv:1,
    du:'foot',
    dd:3
});

conversions.push({
    nv:1,
    nu:'acre',
    nd:1,
    dv:4045.86,
    du:'meter',
    dd:2
});
conversions.push({
    nv:4045.86,
    nu:'meter',
    nd:2,
    dv:1,
    du:'acre',
    dd:1
});
conversions.push({
    nv:1,
    nu:'acre',
    nd:1,
    dv:43560 ,
    du:'foot',
    dd:2
});
conversions.push({
    nv:43560 ,
    nu:'foot',
    nd:2,
    dv:1,
    du:'acre',
    dd:1
});

//meter to liter
conversions.push({
    nv:1,
    nu:'meter',
    nd:3,
    dv:1000,
    du:'liter',
    dd:1
});
conversions.push({
    nv:1000,
    nu:'liter',
    nd:1,
    dv:1,
    du:'meter',
    dd:3
});
//cm^3 => ml
conversions.push({
    nv:1,
    nu:'centimeter',
    nd:3,
    dv:1,
    du:'milliliter',
    dd:1
});
conversions.push({
    nv:3,
    nu:'milliliter',
    nd:1,
    dv:1,
    du:'centimeter',
    dd:3
});

*/

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
            type:'area',
            base:'foot',
            dimension:3,
            name:'foot',
            ratio:1
        }
    },
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
        //dimension:1
    }
}
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
        return (a.unit == b.unit && a.dimension == b.dimension);
    },
    sameTypes(a,b) {
        var fu = this.lookupUnit(a.unit);
        var tu = this.lookupUnit(b.unit);
        return (fu.type == tu.type);
    },

    getCanonicalName(name) {
        if(cvs.units[name]) return name;
        if(abbrevations[name]) return abbrevations[name];
        if(!name) return null;
        console.log("WARNING. no canonical name found for unit " + name);
        return null;
    },
    hasCanonicalDimension(name) {
        return (cvs.units[name] && cvs.units[name].dimension);
    },
    getCanonicalDimension(name) {
        if(cvs.units[name] && cvs.units[name].dimension) return cvs.units[name];
        return null;
    },
    lookupUnit(name) {
        if(!cvs.units[name]) console.log("WARNING. No unit for name",name);
        return cvs.units[name];
    },
    dimConvert(from, to, fu) {
        let ret = UNIT.convert(from, {unit:fu.base});
        let toliter = cvs.dims.find((cv) => {
            if(cv.from.name == ret.unit && cv.from.dim == ret.dimension) {
                return true;
            }
        });
        if(!toliter) throw new Error("no conversion found for " + from +" to " + JSON.stringify(to));
        let ret2 =  new Literal(ret.value/toliter.ratio, toliter.to.name, toliter.to.dim);
        return UNIT.convert(ret2,to);
    },
    convert(from, to) {
        //console.log('-----');
        //console.log("new calc doing",from,'to',to);
        var fu = UNIT.lookupUnit(from.unit);
        var tu = UNIT.lookupUnit(to.unit);
        //console.log("got from ",fu);
        //console.log("got   to ",tu);
        if(fu.base == tu.base) {
            var f =Math.pow(tu.ratio/fu.ratio,from.dimension);
            return new Literal(from.value*f,to.unit,from.dimension);
        }
        var cvv = cvs.bases.find((cv)=> {
            return (cv.from == fu.base && cv.to == tu.base);
        });
        //console.log("got a cvv",cvv);
        if(cvv) return new Literal(
            from.value/fu.ratio/Math.pow(cvv.ratio,from.dimension)*tu.ratio,
            to.unit,
            from.dimension
        );

        if(fu.type == 'length' && from.dimension == 3 && tu.type == 'volume') {
            return UNIT.dimConvert(from,to,fu);
        }
        if(fu.type == 'length' && from.dimension == 2 && tu.type == 'area') {
            return UNIT.dimConvert(from,to,fu);
        }
        throw new Error("no conversion found");
    }
};




class Literal {
    constructor(value, unit, dimension) {
        this.type = 'number';
        this.format = 'none';
        this.value = value;
        this.unit = UNIT.getCanonicalName(unit);
        this.dimension = dimension;
        if(!dimension) {
            if (!unit) {
                this.dimension = 0;
            } else {
                this.dimension = 1;
            }
        }

        if(UNIT.hasCanonicalDimension(this.unit)) {
            var u = UNIT.getCanonicalDimension(this.unit);
            this.dimension = u.dimension;
            this.unit = u.name;
        }
        //console.log("created final literal:",this.toString());
    }
    clone() {
        var lit = new Literal(this.value,this.unit,this.dimension);
        lit.format = this.format;
        return lit;
    }
    withUnit(u,dim) {
        if(!u) return this;
        if(!dim) dim = 1;
        if(typeof u === 'string') return new Literal(this.value,u,dim);
        throw new Error("can't handle other kind of unit");
    }
    toString () {
        return this.value + " " + this.unit + "^"+this.dimension;
    }
    as(target) {
        //if(units[target].type === 'format') {
        //    return this.withPreferredFormat(target);
        //}
        return UNIT.convert(this,target);
    };
    multiply(b) {
        //multiply the same units
        if(this.unit && !b.unit) {
            return new Literal(this.value* b.value).withUnit(this.unit,this.dimension);
        }
        if(!this.unit && b.unit) {
            return new Literal(this.value* b.value).withUnit(b.unit,b.dimension);
        }
        if(this.unit == b.unit) {
            return new Literal(this.value * b.value).withUnit(this.unit,this.dimension + b.dimension);
        }
        return UNIT.convert(this,b).multiply(b);
    }
    divide(b) {
        return this.multiply(b.invert());
    }
    add(b) {
        if(UNIT.sameUnits(this,b)) {
            return new Literal(this.value + b.value).withUnit(this.unit, this.dimension);
        }
        if(UNIT.sameTypes(this,b)) {
            return UNIT.convert(this,UNIT.makeUnit(b.unit,this.dimension)).add(b);
        }
        throw new Error("bad add");
    }
    subtract(b) {
        if(UNIT.sameUnits(this,b)) {
            return new Literal(this.value - b.value).withUnit(this.unit, this.dimension);
        }
        if(UNIT.sameTypes(this,b)) {
            UNIT.convert(this, UNIT.makeUnit(b.unit,this.dimension)).subtract(b);
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
    UNIT: UNIT
};
