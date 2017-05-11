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
addConversion(1,'kilometer',1000,'meter');
addConversion(1,'mile',1609.344,'meter');
addConversion(1,'meter',3.28084,'foot');

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
var units = {
    'meter' : {
        type:'distance'
    },
    'kilometer': {
        type:'distance'
    },
    'mile': {
        type:'distance'
    },
    'foot': {
        type:'distance'
    },
    'yard': {  type:'distance' },

    'second': { type:'duration' },
    'minute': { type:'duration' },
    'hour': { type:'duration' },
    'day': { type:'duration' },
    'month': { type:'duration' },
    'year': { type:'duration' },

    'gallon': {
        type:'volume'
    },
    'quart': {
        type:'volume'
    },
    'cup': {
        type:'volume'
    },
    'teaspoon': {
        type:'volume'
    },
    'tablespoon': {
        type:'volume'
    },

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

    'gallons':'gallon',
    'cups':'cup',
    'tablespoons':'tablespoon',
    'teaspoons':'teaspoon',

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
};

const UNIT = {
    getCanonicalName(name) {
        if(units[name]) return name;
        if(abbrevations[name]) return abbrevations[name];
        console.log("WARNING. no canonical name found for unit " + name);
        return null;
    },
    calculate:function(parts, target) {
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
        return {
            nv: part.nv/part.dv,
            nu: nu_done,
            dv: 1,
            du: part.du.slice()
        };
    },
    condense:function(parts) {
        if(parts.length <= 1) return parts[0];
        var a = parts.shift();
        var b = parts.shift();
        var c = {
            nv: a.nv* b.nv,
            nu: a.nu.concat(b.nu),
            dv: a.dv* b.dv,
            du: a.du.concat(b.du)
        };
        parts.unshift(c);
        return UNIT.condense(parts);
    },
    canBeConverted:function(val) {
        //if both n & d contain an item of the same type
        var dist = ((a)=> {
            return units[a].type === 'distance'
        });
        if(val.nu.find(dist) && val.du.find(dist)) {
            return {
                from:val.nu.find(dist),
                to:val.du.find(dist)
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
    searchConversions:function(from,fromd,to) {
        var solutions = [];
        conversions.forEach((cv)=>{
            if(cv.inside===true) return; // don't get into a loop
            if(cv.du === from) {
                if(fromd) {
                    if(cv.nu === to && cv.dd === fromd) {
                        solutions.push([cv]);
                        return;
                    }
                } else {
                    if(cv.nu === to) {
                        solutions.push([cv]);
                        return;
                    }
                }
                cv.inside = true;
                var res = UNIT.searchConversions(cv.nu,cv.nd,to);
                cv.inside = false;
                if(res.length > 0) solutions.push([cv].concat(res));
            }
        });
        if(solutions.length === 0) return [];
        //return the shortest solution
        return solutions.reduce((a,b)=> (a.length < b.length) ? a:b);
    }
};




class Literal {
    constructor(nv, nu, dv, du) {
        this.type = 'number';
        this.format = 'none';
        this.nv = nv?nv:1;
        if(typeof nu === 'string')  nu = [nu];
        this.nu = nu?nu:[];
        this.nu = this.nu.map((u)=>UNIT.getCanonicalName(u));
        this.dv = dv?dv:1;
        this.du = du?du:[];
        this.du = this.du.map((u)=>UNIT.getCanonicalName(u));
    }
    withUnit(parts) {
        if(!parts) return this;
        if(typeof parts === 'string') return new Literal(this.nv,[UNIT.getCanonicalName(parts)]);
        return new Literal(this.nv,parts[0],1,parts[1]);
    }
    withComplexUnit(parts1, parts2) {
        return new Literal(this.nv,parts1,1,parts2);
    }
    toString () {
        var start = this.nv + "";
        if(Math.floor(this.nv) - this.nv < 0) {
            start = this.nv.toFixed(2);
        }
        var after = "/"+this.dv;
        if(this.dv === 1) {
            after = "/" + this.du.join(" ");
        }
        if(this.du.length === 0 && this.dv === 1) {
            after = "";
        }
        return `${start}${this.nu.join(" ")}${after}`;
    }
    as(target) {
        if(units[target].type === 'format') {
            return this.withPreferredFormat(target);
        }
        var ret = UNIT.calculate([this],target);
        return new Literal(ret.nv, ret.nu, ret.dv, ret.du);
    };
    multiply(b) {
        var ret = UNIT.calculate([this,b]);
        return new Literal(ret.nv, ret.nu, ret.dv, ret.du);
    }
    divide(b) {
        return this.multiply(b.invert());
    }
    add(b) {
        //can add when there are no units
        if(this.nu.length == 0 && b.nu.length == 0) {
            return new Literal(this.nv + b.nv);
        }
        if(this.sameUnits(b)) {
            return new Literal(this.nv + b.nv, this.nu, this.dv, this.du);
        }
        if(this.nu.length === b.nu.length) {
            console.log('adding with the same length');
        }
    }
    subtract(b) {
        //can add when there are no units
        if(this.nu.length == 0 && b.nu.length == 0) {
            return new Literal(this.nv - b.nv);
        }
        if(this.sameUnits(b)) {
            return new Literal(this.nv - b.nv, this.nu, this.dv, this.du);
        }
    }
    exponent(b) {
        if(this.nu.length == 0 && b.nu.length == 0) {
            return new Literal(Math.pow(this.nv,b.nv));
        } else {
            throw new Error("can't do exponent with units yet");
        }
    }
    invert() {
        return new Literal(this.dv, this.du, this.nv, this.nu);
    }
    sameUnits(b) {
        if(this.nu.length !== b.nu.length) return false;
        for(var i=0; i<this.nu.length; i++) {
            if(this.nu[i] !== b.nu[i]) return false;
        }
        return true;
    }
    withPreferredFormat(format) {
        var lt = new Literal(this.nv);//, this.unit);
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
        return this.nv/this.dv;
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
