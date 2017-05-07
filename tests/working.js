/*
next up:
detect possible conversions using better code
implement ft^3 to gallons via a special conversion. make the other ones be dimension 1
merge into the regular literal and units code
 */



/**
 * Created by josh on 5/2/17.
 */
var test = require('tape');
//require('tape-approximately')(test);
//var Literal = require('../src/Literal').Literal;
//var Parser = require('../src/parser.js');
//var ComplexUnit = require('../src/units').ComplexUnit;
/*
var ER = 6371.008;
unittests("master tests",[
    ['pi+1',new Literal(Math.PI+1)],
    ['pi*2',new Literal(Math.PI*2)],
    ['earth.radius * 5',new Literal(ER*5).withComplexUnit(['kilometer'],[])],
    ['3ft * (1 ft/s)',new Literal(3).withComplexUnit(['foot','foot'],['second'])],
    ['3ft / (1 ft/s)',new Literal(3).withComplexUnit(['foot','second'],['foot'])],
    ['1m / (1 ft/s) as ft',new Literal(1).withComplexUnit(['meter','second'],['foot'])],
]);
*/

/*
multiply([
    {value:3, unit:'foot', type:'length', dimension:1},
    {value:3, unit:'foot', type:'length', dimension:1},
    {value:3, unit:'foot', type:'length', dimension:1},
    {value:1, unit:'gallon', type:'volume', dimension:1},
    ]
);
*/


const u = {
    tab:0,
    indent: function() { this.tab++ },
    outdent: function() { this.tab-- },
    p(...args) {
        var arr = Array.prototype.slice.apply(args);
        var str = "-";
        for(let i=0; i<this.tab; i++) str += "#";
        arr.unshift(str);
        console.log.apply(null,arr);
    }

};

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
addConversion(1,'kilometer',1000,'meter');
addConversion(1,'mile',1609.344,'meter');

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
    'second': {
        type:'duration'
    },
    'hour': {
        type:'duration'
    },
    'gallon': {
        type:'volume'
    }
};

function calculate(parts, target) {
    var fin = cancel(condense(parts));
    var conv = canBeConverted(fin);
    if(conv) {
        let fin2 = [fin].concat(searchConversions(conv.from, conv.fromd, conv.to));
        return calculate(fin2);
    }
    if(target) {
        var from = collapsePowers(fin);
        let fin2 = [fin].concat(searchConversions(from.nu[0], from.nd, target));
        return calculate(fin2);
    }
    return fin;
}

function collapsePowers(val) {
    if(val.nu[0] === val.nu[1]) {
        val.nu.shift();
        if(!val.nd) val.nd = 1;
        val.nd++;
        return collapsePowers(val);
    }
    return val;
}

function canBeConverted(val) {
    //if both n & d contain an item of the same type
    var dist = ((a)=> units[a].type === 'distance');
    if(val.nu.find(dist) && val.du.find(dist)) {
        return {
            from:val.nu.find(dist),
            to:val.du.find(dist)
        }
    }
    //if val contains three distances and du contains volume
    return false;
}

function cancel(part){
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
}

function condense(parts) {
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
    return condense(parts);
}


function searchConversions(from,fromd,to) {
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
            var res = searchConversions(cv.nu,cv.nd,to);
            cv.inside = false;
            if(res.length > 0) solutions.push([cv].concat(res));
        }
    });
    if(solutions.length === 0) return [];
    //return the shortest solution
    return solutions.reduce((a,b)=> (a.length < b.length) ? a:b);
}


function Num(nv, nu, dv, du) {
    this.nv = nv?nv:1;
    this.nu = nu?nu:[];
    this.dv = dv?dv:1;
    this.du = du?du:[];
    this.toString = function() {
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
    };
    this.as = function(target) {
        var ret = calculate([this],target);
        return new Num(ret.nv, ret.nu, ret.dv, ret.du);
    };
    this.multiply = function(b) {
        var ret = calculate([this,b]);
        return new Num(ret.nv, ret.nu, ret.dv, ret.du);
    }
}

test("new test 2", (t) => {
    t.equal(new Num(10,['meter']).toString(),'10meter');
    t.equal(new Num(6,['kilometer']).as('meter').toString(),'6000meter');
    t.equal(new Num(10,['second']).multiply(new Num(5,['meter'],1,['second'])).toString(),'50meter');
    t.equal(new Num(10,['second']).multiply(new Num(9.8,['meter'],1,['second','second'])).toString(),'98meter/second');
    t.equal(new Num(4000,['mile']).multiply(new Num(1,['hour'],40,['mile'])).toString(),'100hour');
    t.equal(new Num(600*1000,['meter']).multiply(new Num(1,['hour'],40,['mile'])).toString(),'9.32hour');
    t.equal(new Num(3,['foot']).multiply(new Num(3,['foot'])).multiply(new Num(3,['foot'])).as('gallon').toString(),'201.97gallon');
    t.end();
});
