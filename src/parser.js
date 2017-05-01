var ohm = require('ohm-js');
var Literal = require('./Literal').Literal;
var LiteralString = require('./Literal').LiteralString;

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
    'earth.radius':new Literal(6371.008,'km'),
    'jupiter.radius':new Literal(69911,'km')
};
function resolveSymbol(name) {
    var ref = name.toLowerCase();
    if(!SYMBOLS[ref]) throw Error("Symbol not found " + name);
    return SYMBOLS[ref];
}

function generateSemantics(grammar) {
    var sem = grammar.createSemantics().addOperation('calc', {
        Literal: (num, unit) => num.calc().withUnit(unit.calc()[0]),
        unit: function(_) {  return this.sourceString;  },
        Number: (a) => a.calc(),
        integer: function(a,b) {
            var v = parseInt(this.sourceString.replace(/_/g,''), 10);
            if(b) v = v * Math.pow(10, b.calc());
            return new Literal(v);
        },
        float: function(a,b,c,e) {  return new Literal(parseFloat(this.sourceString));  },
        hex:  function(a,b) {       return new Literal(parseInt(this.sourceString)).withPreferredFormat('hex'); },
        exp: (_,sign,exp) => new Literal(parseFloat(exp.calc())),
        AddExpr_plus: ((a,_,b) => a.calc().add(b.calc())),
        AddExpr_minus: ((a,_,b) => a.calc().subtract(b.calc())),
        MulExpr_multiply: ((a,_,b) => a.calc().multiply(b.calc())),
        MulExpr_divide: ((a,_,b) => a.calc().divide(b.calc())),
        ExpExpr_power: ((a,_,b) => a.calc().exponent(b.calc())),
        PriExpr_paren: ((p1,a,p2) => a.calc()),
        AsExpr: (a,_,u) => a.calc().as(u.calc()),
        identifier:function(_a,_b) { return resolveSymbol(this.sourceString)},
        String:function(_a,str,_c) { return new LiteralString(str.calc().join(""))},
        _terminal: function() {
            return this.sourceString;
        }

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
    parseString: function(str) {
        if(!grammar) init();
        var m = grammar.match(str);
        if(m.failed()) throw new Error("match failed on: " + str);
        var js = sem(m).calc();
        console.log("parsing",str, "->", js.toString());
        return js;
    }
}
