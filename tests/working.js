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
    }
};



function flatten(fract) {
    var start = fract.nv + "";
    if(Math.floor(fract.nv) - fract.nv < 0) {
        start = fract.nv.toFixed(2);
    }
    var after = "/"+fract.dv;
    if(fract.dv === 1) {
        after = "/" + fract.du.join(" ");
    }
    if(fract.du.length === 0 && fract.dv === 1) {
        after = "";
    }
    return `${start}${fract.nu.join(" ")}${after}`;
}

test("new test",(t) => {
    t.equal(flatten(calculate([
            { nv:10, nu:['meter'], dv:1, du:[]}
        ])),
        "10meter");
    t.equal(flatten(calculate([
            { nv:6, nu:['kilometer'], dv:1, du:[] },
        ],'meter')),
        "6000meter");

    t.equal(flatten(calculate([
            { nv:10, nu:['second'], dv:1, du:[] },
            { nv:5, nu:['meter'],   dv:1, du:['second'] }
        ])),
        '50meter');
    t.equal(flatten(calculate([
        { nv:10, nu:['second'], dv:1, du:[] },
        { nv:9.8, nu:['meter'], dv:1, du:['second','second'] }
        ])),
        '98meter/second');
    t.equal(flatten(calculate([
        { nv:4000,nu:['mile'], dv:1,du:[]},
        { nv:1,nu:['hour'], dv:[40], du:['mile']}
        ])),
        '100hour');
    t.end();

    t.equal(flatten(calculate([
        { nv:600000,nu:['meter'], dv:1,du:[]},
        { nv:1,nu:['hour'], dv:[40], du:['mile']},
    ])),'9.32hour');

    //t.equal(flatten(calculate([
    //    { nv:3,nu:['foot'], dv:1,du:[]},
    //    { nv:3,nu:['foot'], dv:1,du:[]},
    //    { nv:3,nu:['foot'], dv:1,du:[]},
    //],'gallon')),'3 gallon');
});
//console.log("---------------");
//console.log("3ft * 3ft * 3ft as gallons", calculate([
//    { nv:3, nu:['foot'], dv:1,du:[]},
//    { nv:3, nu:['foot'], dv:1,du:[]},
//    { nv:3, nu:['foot'], dv:1,du:[]},
//    { nv:1, nu:['gallon'], dv:1,du:[]},
//]));
/*
then add dimension support to the conversion search to look for
foot^3.length to meter^3.length to gallon^1.volume
 */


function calculate(parts, target) {
    var fin = cancel(condense(parts));
    var conv = canBeConverted(fin);
    if(conv) {
        let fin2 = [fin].concat(searchConversions(conv.from, conv.to));
        return calculate(fin2);
    }
    if(target) {
        var from = fin.nu[0];
        let fin2 = [fin].concat(searchConversions(from, target));
        return calculate(fin2);
    }
    return fin;
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


function searchConversions(from,to) {
    var solutions = [];
    conversions.forEach((cv)=>{
        if(cv.inside===true) return; // don't get into a loop
        if(cv.du === from) {
            if(cv.nu === to) { //add a matching solution
                solutions.push([cv]);
            } else { //or else recurse
                cv.inside = true;
                var res = searchConversions(cv.nu,to);
                cv.inside = false;
                if(res.length > 0) solutions.push([cv].concat(res));
            }
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
}

test("new test 2", (t) => {
    t.equal(new Num(10,['meter']).toString(),'10meter');
    t.equal(new Num(6,['kilometer']).as('meter').toString(),'6000meter');
    t.end();
});
