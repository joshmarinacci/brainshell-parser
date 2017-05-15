/**
 * Created by josh on 4/22/17.
 */
//var Decimal = require('decimal.js');

var conversions = [];
function addConversion(fv,fu, tv,tu) {
    conversions.push({
        nv:tv,
        nu:tu,
        dv:fv,
        du:fu,
        toString: function() {
            return this.du + "->" + this.nu;
        }
    });
    conversions.push({
        nv:fv,
        nu:fu,
        dv:tv,
        du:tu,
        toString: function() {
            return this.du + "->" + this.nu;
        }
    });
}

addConversion(4,'quart',1,'gallon');
addConversion(2,'pint',1,'quart');
addConversion(2,'cup',1,'pint');
addConversion(1,'cup',16,'tablespoon');
addConversion(1,'tablespoon',3,'teaspoon');
addConversion(1,'milliliter',1/1000,'liter');
addConversion(1,'gallon',3.78541,'liter');

addConversion(453.592,'gram',1,'pound');
addConversion(16,'ounce',1,'pound');

addConversion(1,'kilometer',1000,'meter');
addConversion(1,'meter',3.28084,'foot');
addConversion(1,'centimeter',1/100,'meter');
addConversion(1,'millimeter',1/1000,'meter');
addConversion(1,'mile',1609.344,'meter');

addConversion(1,'terabyte',1000,'gigabyte');
addConversion(1,'tibibyte',1024,'gibibyte');
addConversion(1,'gigabyte',1000,'megabyte');
addConversion(1,'gibibyte',1024,'mebibyte');
addConversion(1,'megabyte',1000,'kilobyte');
addConversion(1,'mebibyte',1024,'kibibyte');
addConversion(1,'kilobyte',1000,'byte');
addConversion(1,'gigabyte',8,'gigabit');
addConversion(1,'gibibyte',8,'gibibit');

addConversion(1,'year',365,'day');
addConversion(1,'month',30,'day');
addConversion(1,'day',24,'hour');
addConversion(1,'hour',60,'minute');
addConversion(1,'minute',60,'second');

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


var units = {
    'centimeter': { type:'distance'},
    'millimeter': { type:'distance'},
    'meter' :   { type:'distance' },
    'kilometer':{ type:'distance' },
    'mile': {     type:'distance' },
    'inch': {     type:'distance' },
    'foot': {     type:'distance' },
    'yard': {     type:'distance' },
    'league': {   type:'distance' },

    'acre': {     type:'area'},

    'second': { type:'duration' },
    'minute': { type:'duration' },
    'hour': { type:'duration' },
    'day': { type:'duration' },
    'month': { type:'duration' },
    'year': { type:'duration' },


    'pound':{type:'mass'},
    'gram':{type:'mass'},
    'kilogram':{type:'mass'},
    'ounce':{type:'mass'},

    'gallon': {     type:'volume', base:'gallon', ratio: 1 },
    'quart': {      type:'volume', base:'gallon', ratio: 4 },
    'pint': {       type:'volume', base:'gallon', ratio: 8 },
    'cup': {        type:'volume', base:'gallon', ratio: 16 },
    'teaspoon': {   type:'volume', base:'gallon', ratio:768 },
    'tablespoon': { type:'volume', base:'gallon', ratio:256 },

    'liter':      { type:'volume', base:'liter', ratio:1    },
    'milliliter': { type:'volume', base:'liter', ratio:1000 },

    'tibibyte': { type: 'storage'},
    'gibibyte': { type: 'storage'},
    'mebibyte': { type: 'storage'},
    'kibibyte': { type: 'storage'},
    'terabyte': { type: 'storage'},
    'gigabyte': { type: 'storage'},
    'megabyte': { type: 'storage'},
    'kilobyte': { type: 'storage'},
    'byte': { type: 'storage'},

    'tibibit': { type: 'storage'},
    'gibibit': { type: 'storage'},
    'mebibit': { type: 'storage'},
    'kibibit': { type: 'storage'},
    'terabit': { type: 'storage'},
    'gigabit': { type: 'storage'},
    'megabit': { type: 'storage'},
    'kilobit': { type: 'storage'},
    'bit': { type: 'storage'},

    'hex': { type:'format'},
    'decimal': { type:'format'}
};

var abbrevations = {
    'in':'inch',
    'inches':'inch',
    'ft':'foot',
    'feet':'foot',
    'yards':'yard',
    'yd':'yard',
    'miles':'mile',
    'mi':'mile',

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

const UNIT = {
    getCanonicalName(name) {
        if(units[name]) return name;
        if(abbrevations[name]) return abbrevations[name];
        if(!name) return null;
        console.log("WARNING. no canonical name found for unit " + name);
        return null;
    },
    calculate:function(parts, target) {
        parts = parts.map((pt)=>pt.clone());
        var fin = UNIT.cancel(UNIT.condense(parts));
        var conv = UNIT.canBeConverted(fin);
        if(conv) {
            let fin2 = [fin].concat(UNIT.searchConversions(conv.from, conv.fromd, conv.to));
            return UNIT.calculate(fin2);
        }
        if(target) {
            var from = UNIT.collapsePowers(fin);
            let fin2 = [fin].concat(UNIT.searchConversions(from.nu[0], from.nd, target));
            return UNIT.calculate(fin2);
        }
        return fin;
    },
    cancel:function(part){
        part.nu.sort();
        part.du.sort();

        var nu_done = [];
        while(part.nu.length > 0) {
            const a = part.nu.shift();
            var n = part.du.findIndex((b)=> a === b);
            if(n >= 0) {
                part.du.splice(n,1);
            } else {
                nu_done.push(a);
            }
        }
        //var du_done = part.du.slice();
        return new Literal(
            part.nv/part.dv,
            nu_done,
            1,
            part.du.slice()
        );
    },
    condense:function(parts) {
        if(parts.length <= 1) return parts[0];
        var a = parts.shift();
        var b = parts.shift();
        var c = new Literal(
            a.nv* b.nv,
            a.nu.concat(b.nu),
            a.dv* b.dv,
            a.du.concat(b.du)
        );
        parts.unshift(c);
        return UNIT.condense(parts);
    },
    canBeConverted:function(val) {
        //if both n & d contain an item of the same type
        var dist = ((a)=> {
            return units[a].type === 'distance'
        });
        var dur = ((a)=> units[a].type === 'duration');
        if(val.nu.find(dist) && val.du.find(dist)) {
            return {
                from:val.nu.find(dist),
                to:val.du.find(dist)
            }
        }
        if(val.nu.find(dur) && val.du.find(dur)) {
            return {
                from:val.nu.find(dur),
                to:val.du.find(dur)
            }
        }
        //if val contains three distances and du contains volume
        return false;
    },
    collapsePowers:function(val) {
        if(val.nu[0] === val.nu[1]) {
            val.nu.shift();
            if(!val.nd) val.nd = 1;
            val.nd++;
            return UNIT.collapsePowers(val);
        }
        return val;
    },
    conversionToLiteral(cv) {
        return new Literal(cv.nv,[cv.nu],cv.dv,[cv.du]);
    },
    searchConversions:function(from,fromd,to) {
        var solutions = [];
        conversions.forEach((cv)=>{
            if(cv.inside===true) return; // don't get into a loop
            if(cv.du === from) {
                if(fromd) {
                    if(cv.nu === to && cv.dd === fromd) {
                        solutions.push([this.conversionToLiteral(cv)]);
                        return;
                    }
                } else {
                    if(cv.nu === to) {
                        solutions.push([this.conversionToLiteral(cv)]);
                        return;
                    }
                }
                cv.inside = true;
                var res = UNIT.searchConversions(cv.nu,cv.nd,to);
                cv.inside = false;
                if(res.length > 0) solutions.push([this.conversionToLiteral(cv)].concat(res));
            }
        });
        if(solutions.length === 0) return [];
        //return the shortest solution
        return solutions.reduce((a,b)=> (a.length < b.length) ? a:b);
    }
};

var cvs = {
    units: {
        'cup': {
            name:'cup',
            base:'gallon',
            ratio:16,
            type:'volume',
        },
        'liter': {
            name:'liter',
            base:'liter',
            ratio:1,
            type:'volume'
        },
        'gallon': {
            name:'gallon',
            base:'gallon',
            ratio:1,
            type:'volume'
        },
        'milliliter': {
            name:'milliliter',
            base:'liter',
            ratio:1000,
            type:'volume'
        },
        'quart': {
            name:'quart',
            base:'gallon',
            ratio:4,
            type:'volume'
        },
        'pint': {
            name:'pint',
            base:'gallon',
            ratio:8,
            type:'volume'
        },
        'tablespoon': {
            name:'tablespoon',
            base:'gallon',
            ratio:256,
            type:'volume'
        },
        'teaspoon': {
            name:'teaspoon',
            base:'gallon',
            ratio:256*3,
            type:'volume'
        },


        'centimeter': {
            name:'centimeter',
            base:'meter',
            ratio:100,
            type:'length'
        },
        'kilometer': {
            name:'kilometer',
            base:'meter',
            ratio:1/1000,
            type:'length'
        },
        foot: {
            name:'foot',
            base:'foot',
            ratio:1,
            type:'length'
        },
        mile: {
            name:'mile',
            base:'foot',
            ratio:1/5280,
            type:'length'
        },
        meter: {
            name:'meter',
            base:'meter',
            ratio:1,
            type:'length'
        },


        acre: {
            name:'acre',
            base:'acre',
            ratio:1,
            type:'area'
        },



        gram: {
            name:'gram',
            base:'gram',
            ratio:1,
            type:'mass'
        },
        kilogram: {
            name:'gram',
            base:'gram',
            ratio:1/1000,
            type:'mass'
        },
        pound: {
            name:'pound',
            base:'pound',
            ratio:1,
            type:'mass'
        },
        ounce: {
            name:'ounce',
            base:'pound',
            ratio:16,
            type:'mass'
        },



        second: {
            name:'second',
            base:'second',
            ratio:1,
            type:'duration'
        },
        minute: {
            name:'minute',
            base:'second',
            ratio:1/(60),
            type:'duration'
        },
        hour: {
            name:'hour',
            base:'second',
            ratio:1/(60*60),
            type:'duration'
        },
        day: {
            name:'day',
            base:'second',
            ratio:1/(60*60*24),
            type:'duration'
        },
        month: {
            name:'month',
            base:'second',
            ratio:1/(60*60*24*30),
            type:'duration'
        },
        year: {
            name:'year',
            base:'second',
            ratio:1/(60*60*24*365),
            type:'duration'
        },
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

function lookupUnit(name) {
    if(!cvs.units[name]) console.log("WARNING. No unit for name",name);
    return cvs.units[name];
}
function newDimensionConversion(from,to,fu) {
    let ret = newCalc(from, {unit:fu.base});
    let toliter = cvs.dims.find((cv) => {
        if(cv.from.name == ret.unit && cv.from.dim == ret.dimension) {
            return true;
        }
    });
    let ret2 =  new Literal(ret.value/toliter.ratio, toliter.to.name, toliter.to.dim);
    return newCalc(ret2,to);
}
function newCalc(from,to) {
    //console.log("new calc doing",from,'to',to);
    var fu = lookupUnit(from.unit);
    var tu = lookupUnit(to.unit);
    //console.log("got from ",fu);
    //console.log("got   to ",tu);
    if(fu.base == tu.base) {
        var f =Math.pow(tu.ratio/fu.ratio,from.dimension);
        return new Literal(from.value*f,to.unit,from.dimension);
    }
    var cvv = cvs.bases.find((cv)=> {
        return (cv.from == fu.base && cv.to == tu.base);
    });
    if(cvv) return new Literal(from.value/fu.ratio/cvv.ratio*tu.ratio,to.unit);
    //if(!cvv) console.log("WARNING. couldn't convert from ",fu.base,'to',tu.base);



    //if length^3 to volume, then search dimensional conversion
    if(fu.type == 'length' && from.dimension == 3 && tu.type == 'volume') {
        return newDimensionConversion(from,to,fu);
    }
    if(fu.type == 'length' && from.dimension == 2 && tu.type == 'area') {
        return newDimensionConversion(from,to,fu);
    }
    //look for dimensional conversions
    var ccv2 = cvs.dims.find((cv)=>{
        if(cv.from.name == fu.name && cv.from.dim == from.dimension) {
            if(cv.to.name == tu.name && cv.to.dim == to.dim) {
                return true;
            }
        }
    });
    console.log('no answer');
    throw new Error();
}



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
        console.log("other form");
        return new Literal(this.nv,u[0],1,u[1]);
    }
    withPowerUnit(name,dim) {
        return new Literal(this.value,name,dim);
    }
    toString () {
        return this.value + " " + this.unit + "^"+this.dimension;
    }
    as(target) {
        //if(units[target].type === 'format') {
        //    return this.withPreferredFormat(target);
        //}
        return newCalc(this,target);
    };
    multiply(b) {
        //multiply the same units
        if(this.unit && !b.unit) {
            return new Literal(this.value* b.value,this.unit,this.dimension);
        }
        if(!this.unit && b.unit) {
            return new Literal(this.value* b.value,b.unit,b.dimension);
        }
        if(this.unit == b.unit) {
            return new Literal(this.value * b.value,
                this.unit,
                this.dimension + b.dimension)
        }
        return newCalc(this,b);
    }
    divide(b) {
        return this.multiply(b.invert());
    }
    add(b) {
        if(this.sameUnits(b)) {
            return new Literal(this.value + b.value, this.unit, this.dimension);
        }

        if(this.sameUnitTypes(b)) {
            var a = newCalc(this,{unit: b.unit,dim:this.dimension});
            return a.add(b);
        }
        throw new Error("bad add");
    }
    subtract(b) {
        if(this.sameUnits(b)) {
            return new Literal(this.value - b.value, this.unit, this.dimension);
        }
        if(this.sameUnitTypes(b)) {
            var a = newCalc(this,{unit: b.unit, dim:this.dimension});
            return a.subtract(b);
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
        if(this.unit == b.unit && this.dimension == b.dimension) return true;
        return false;
    }
    sameUnitTypes(b) {
        var fu = lookupUnit(this.unit);
        var tu = lookupUnit(b.unit);
        if(fu.type == tu.type) return true;
        return false;
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
