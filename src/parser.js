var ohm = require('ohm-js');
var Literal = require('./Literal').Literal;
var LiteralString = require('./Literal').LiteralString;
var UNIT = require('./Literal').UNIT;
var SimpleUnit = require('./Literal').SimpleUnit;
var moment = require('moment');

class FunCall {
    constructor(fun, arg) {
        this.type = 'funcall';
        this.fun = fun;
        this.arg = arg;
    }
    toString() {
        return "Function Call"
    }
    invoke() {
        return this.fun(this.arg);
    }
}

var grammar;
var sem;
function GET(url) {
    return new Promise((res,rej)=>{
        var xhr = new XMLHttpRequest();
        xhr.addEventListener("load",function(){
            //console.log("got event",this.responseText);
            res(this.responseText);
        });
        xhr.open("GET",url);
        xhr.send();
    });
}

const SYMBOLS = {
    'pi': new Literal(Math.PI),
    'earth.radius':new Literal(6371.008).withUnit('kilometer'),
    'jupiter.radius':new Literal(69911).withUnit('km'),
    'date': function(arg) {
        console.log("doing date on arg " + arg, arg.string);
        return moment(arg.string);
    },
    'year': function(arg) {
        if(arg.type === 'funcall') arg = arg.invoke();
        if(!moment.isMoment(arg)) throw new Error("not a valid date object");
        return new Literal(arg.year());
    },
    'weekday': function(arg) {
        if(arg.type === 'funcall') arg = arg.invoke();
        if(!moment.isMoment(arg)) throw new Error("not a valid date object");
        console.log('real weekday is', arg.day());
        return new Literal(arg.day());
    }
};
function resolveSymbol(name) {
    var ref = name.toLowerCase();
    if(!SYMBOLS[ref]) throw Error("Symbol not found " + name);
    return SYMBOLS[ref];
}

function generateSemantics(grammar) {
    var sem = grammar.createSemantics();
    sem.addOperation('calc', {
        Literal: (num, unit) => {
            var num_t = num.calc();
            var unit_t = unit.calc()[0];
            if(!unit_t) return num_t;
            return num_t.withSimpleUnit(unit_t);
        },
        unitchunk : function(a,b,c) {
            var name = a.calc().join("");
            var power = c.calc().join("");
            name = UNIT.getCanonicalName(name);
            if(power) return [name,parseInt(power)];
            return [name,1];
        },
        Unit: function(mod, numer, div, denom) {
            var n  = numer.calc()[0];
            var p = numer.calc()[1];
            var md = mod.calc();
            if(md.length == 1 && md[0] === 'square') p = 2;
            if(md.length == 1 && md[0] === 'cubic') p = 3;
            return new SimpleUnit(n,p);
        },
        Number: (a) => a.calc(),
        integer: function(a,b) {
            var v = parseInt(a.calc().join("").replace(/_/g,''), 10);
            var exp = b.calc();
            if(exp && exp.length >= 1) v = v* Math.pow(10, exp[0].getValue());
            return new Literal(v);
        },
        float: function(a,b,c,e) {  return new Literal(parseFloat(this.sourceString));  },
        hex:  function(a,b) {       return new Literal(parseInt(this.sourceString)).withPreferredFormat('hex'); },
        exp: (_,sign,exp) => new Literal(parseFloat(exp.calc()[0])),
        AddExpr_plus: ((a,_,b) => a.calc().add(b.calc())),
        AddExpr_minus: ((a,_,b) => a.calc().subtract(b.calc())),
        MulExpr_multiply: ((a,_,b) => a.calc().multiply(b.calc())),
        MulExpr_divide: ((a,_,b) => a.calc().divide(b.calc())),
        ExpExpr_power: ((a,_,b) => a.calc().exponent(b.calc())),
        PriExpr_paren: ((p1,a,p2) => a.calc()),
        AsExpr: (a,_,u) => a.calc().as(u.calc()),
        identifier:function(_a,_b) { return resolveSymbol(this.sourceString)},
        String_single:function(_a,str,_b) { return new LiteralString(str.calc().join(""))},
        String_double:function(_a,str,_b) { return new LiteralString(str.calc().join(""))},
        FunCall:(ident,_1,expr,_2) => new FunCall(ident.calc(),expr.calc()),
        _terminal: function() {
            return this.sourceString;
        }

    });
    sem.addOperation('style',{
        Literal: (num, unit) => "Literal " + num.style() + " " + unit.style(),
        float: function(a,b,c,e) {  return new Literal(parseFloat(this.sourceString));  },
        integer: function(a,b) {
            var v = parseInt(this.sourceString.replace(/_/g,''), 10);
            //if(b) v = v * Math.pow(10, b.calc());
            return new Literal(v);
        },
        Unit: function(mod, numer, div, denom) {
            return numer.style() + " / " + denom.style()[0];
        },
        unitchunk : function(a,b,c) {
            var name = a.style().join("");
            var power = c.style().join("");
            name = UNIT.getCanonicalName(name);
            if(power){
                var pow = parseInt(power);
                var ret = [];
                for(var i=0; i<pow; i++) {
                    ret.push(name);
                }
                return name + "^" + pow;
            }
            return [name];
        },
        _terminal: function() {
            return this.sourceString;
        }
    });

    sem.addOperation('tree',{
        FunCall:(ident,_1,expr,_2) => ['funcall',ident.tree(),expr.tree()],
        identifier:function(_a,_b) { return this.sourceString.toLowerCase()},
    });
    return sem;
}
function init() {
    var source = "";
    if(typeof window !== 'undefined') {
        var file = require('./parser.ohm');
        GET(file).then((source)=>{
            grammar = ohm.grammar(source);
            sem = generateSemantics(grammar);
        });
    } else {
        var fs = require('fs');
        source = fs.readFileSync("src/parser.ohm");
        grammar = ohm.grammar(source);
        sem = generateSemantics(grammar);
    }
}

module.exports = {
    init: function() {
        init();
    },
    get: function() {
        if(!grammar) init();
        return grammar;
    },
    parseString: function(str) {
        var grammar = this.get();
        var m = grammar.match(str);
        if(m.failed()) throw new Error("match failed on: " + str);
        var js = sem(m).calc();
        console.log("parsing",str, "->"+ js.toString());
        return js;
    },
    styleString: function(str) {
        var grammar = this.get();
        var m = grammar.match(str);
        if(m.failed()) throw new Error("match failed on: " + str);
        var js = sem(m).style();
        console.log("styling",str, "->"+ js.toString());
        return js;
    },
    parseTree: function(str) {
        var grammar = this.get();
        var m = grammar.match(str);
        if(m.failed()) throw new Error("match failed on: " + str);
        var js = sem(m).tree();
        console.log("styling",str, "->"+js);
        return js;
    }
}
