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

var conversions = [
    //{  nv:3.28084, nu:'foot',  dv:1, du:'meter' },
    //{  dv:3.28084, du:'foot',  nv:1, nu:'meter' },

];
function nc(fv,fu, tv,tu) {
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

nc(4,'quart',1,'gallon');
nc(2,'pint',1,'quart');
nc(2,'cup',1,'pint');
nc(1,'cup',16,'tablespoon');
nc(1,'kilometer',1000,'meter');
nc(1,'mile',1609.344,'meter');


var units = {
    'meter' : {
        type:'length'
    },
    'kilometer': {
        type:'length'
    }
};


// 6km as meter = 6000 meters
//console.log("6km as meter = 6000 meter => ", calculate([
//    { nv:6, nu:['kilometer'], dv:1, du:[] },
//],'meter'));
//console.log("10s * 5m/s =  50 m => ", calculate([
//    { nv:10, nu:['second'], dv:1, du:[] },
//    { nv:5, nu:['meter'],   dv:1, du:['second'] }
//]));
//console.log("10s * 9.8m/s^2 = 98m/s => ", calculate([
//    { nv:10, nu:['second'], dv:1, du:[] },
//    { nv:9.8, nu:['meter'], dv:1, du:['second','second'] }
//]));
//console.log("4000 mi / (40mi/hr) = 100hr =>", calculate([
//    { nv:4000,nu:['mile'], dv:1,du:[]},
//    { nv:1,nu:['hour'], dv:[40], du:['mile']}
//]));
console.log("600000 meter / (40mi/hr)", calculate([
    { nv:600000,nu:['meter'], dv:1,du:[]},
    { nv:1,nu:['hour'], dv:[40], du:['mile']},
    //{ nv:1, nu:['mile'], dv:1609.34, du:['meter']}
]));

function flatten(fract) {
    var start = fract.nv + "";
    if(Math.floor(fract.nv) - fract.nv < 0) {
        console.log("has fractional part");
        start = fract.nv.toFixed(2);
    }
    return start + ""+ fract.nu.join(" ")
        + "/" + fract.dv + "" +    fract.du.join(" ");
}

test("new test",(t) => {
    t.equal(flatten(calculate([
            { nv:10, nu:['meter'], dv:1, du:[]}
        ])),
        "10meter/1");
    t.equal(flatten(calculate([
            { nv:6, nu:['kilometer'], dv:1, du:[] },
        ],'meter')),
        "6000meter/1");

    t.equal(flatten(calculate([
            { nv:10, nu:['second'], dv:1, du:[] },
            { nv:5, nu:['meter'],   dv:1, du:['second'] }
        ])),
        '50meter/1');
    t.equal(flatten(calculate([
        { nv:10, nu:['second'], dv:1, du:[] },
        { nv:9.8, nu:['meter'], dv:1, du:['second','second'] }
        ])),
        '98meter/1second');
    t.equal(flatten(calculate([
        { nv:4000,nu:['mile'], dv:1,du:[]},
        { nv:1,nu:['hour'], dv:[40], du:['mile']}
        ])),
        '100hour/1');
    t.end();

    t.equal(flatten(calculate([
        { nv:600000,nu:['meter'], dv:1,du:[]},
        { nv:1,nu:['hour'], dv:[40], du:['mile']},
    ])),'9.32hour/1');
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
    console.log('===========');
    //console.log("calculating",parts,target);
    var fin = cancel(condense(parts));
    var conv = canBeConverted(fin);
    if(conv) {
        //console.log('can be converted',conv);
        let fin2 = [fin].concat(lookupConversion(conv));
        //console.log('condensing',fin2);
        //var fin3 = cancel(condense(fin2));
        //console.log("condensed",fin3);
        return calculate(fin2);
    }
    if(target) {
        //console.log("must convert to",target,fin);
        var from = fin.nu[0];
        //console.log('converting from',from);
        let fin2 = [fin].concat(lookupConversion({from:from, to:target}));
        //console.log('final to convert',fin2);
        return calculate(fin2);
    }
    return fin;
}

function lookupConversion(conv) {
    console.log("looking up",conv);
    var cv = searchConversions(conv.from,conv.to);
    console.log("found " + cv.length + "   " + cv);
    return cv;

    if(conv.from === 'meter') {
        if(conv.to === 'mile') {
            return {
                nv:1, nu:['mile'],
                dv:1609.34, du:['meter']
            }
        }
    }
    if(conv.from === 'kilometer') {
        if(conv.to === 'meter') {
            return {
                nv:1000, nu:['meter'],
                dv:1, du:['kilometer']
            }
        }
    }
}

function canBeConverted(val) {
    //console.log("can I convert?", val);
    //if both n & d contain an item of the same type
    var dist = ((a)=> a === 'meter' || a === 'mile');
    if(val.nu.find(dist) && val.du.find(dist)) {
        //console.log("should convert a distance",
        //    val.nu.find(dist),
        //    val.du.find(dist)
        //);
        return {
            from:val.nu.find(dist),
            to:val.du.find(dist)
        }
    }
    //console.log(val);
    return false;
}

function cancel(part){
    part.nu.sort();
    part.du.sort();

    var nu_done = [];
    while(part.nu.length > 0) {
        //console.log("loop", part.nu, part.du);
        const a = part.nu.shift();
        var n = part.du.findIndex((b)=> a === b);
        if(n >= 0) {
            //console.log("canceling",a);
            part.du.splice(n,1);
        } else {
            //console.log("passing");
            nu_done.push(a);
        }
    }
    var du_done = part.du.slice();
    part.nu = nu_done;
    part.du = du_done;
    part.nv = part.nv/part.dv;
    part.dv = 1;
    return part;
}

function condense(parts) {
    //console.log("parts",parts);
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
    u.p('searching',from,'->',to);
    var solutions = [];
    for(let i=0; i<conversions.length; i++) {
        let cv = conversions[i];
        if(cv.inside===true) {
            //u.p("skiping",cv.du, '=>',cv.nu);
            continue;
        }
        if(cv.du === from) {
            //u.p("found denom",cv.du, '=>',cv.nu);
            if(cv.nu === to) {
                //u.p("matched to ", cv.nu);
                solutions.push([cv]);
            } else {
                //u.p("not a direct match. recursing");
                cv.inside = true;
                u.indent();
                var res = searchConversions(cv.nu,to);
                u.outdent();
                //u.p("result = ", res,cv);
                cv.inside = false;
                if(res.length > 0) {
                    var f = [cv].concat(res);
                    //u.p("returning a match",f);
                    solutions.push(f);//return f;
                }
            }
        }
    }
    //console.log("final solutions",solutions.join("   "));
    if(solutions.length === 0) return [];
    var shortest = solutions.shift();
    solutions.forEach((s)=>{
        if(s.length < shortest.length) shortest = s;
    });

    console.log("the shortest solution is", shortest.toString());
    return shortest;
}


//test("conversion",(t)=>{
    //t.equal(searchConversions("meter","foot")[0].nv, 3.28084);
    //t.equal(searchConversions("foot","meter")[0].nv, 1);
    //t.equal(searchConversions("foot","meter")[0].dv, 3.28084);
    //t.equal(searchConversions("quart","gallon")[0].dv, 4);
    //t.equal(searchConversions("quart","pint")[0].nv, 2);
    //t.equal(searchConversions("pint","gallon")[0].dv, 2);
    //t.equal(searchConversions("gallon","tablespoon")[0].nv, 4);
    //t.end();
//});

