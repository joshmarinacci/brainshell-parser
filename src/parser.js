var ohm = require('ohm-js');
var Literal = require('./Literal').Literal;

var grammar;
var sem;
function GET(url) {
    return new Promise((res,rej)=>{
        var xhr = new XMLHttpRequest();
        xhr.addEventListener("load",function(){
            //console.log("got event",this.responseText);
            res(this.responseText);
        })
        xhr.open("GET",url);
        xhr.send();
    });
}

function generateSemantics(grammar) {
    var sem = grammar.createSemantics().addOperation('calc', {
        Literal: (num, unit) => new Literal(num.calc(), unit.calc()[0]),
        unit: function(_) {  return this.sourceString;  },
        Number: (a) => a.calc(),
        integer: function(a,b) {
            var v = parseInt(this.sourceString, 10);
            if(b) return v * Math.pow(10, b.calc());
            return v;
        },
        float: function(a,b,c,e) {  return parseFloat(this.sourceString);  },
        hex:  function(a,b) {       return parseInt(this.sourceString);    },
        exp: (_,sign,exp) => parseFloat(exp.calc()),
        AddExpr_plus: ((a,_,b) => a.calc().add(b.calc())),
        AddExpr_minus: ((a,_,b) => a.calc().subtract(b.calc())),
        MulExpr_multiply: ((a,_,b) => a.calc().multiply(b.calc())),
        MulExpr_divide: ((a,_,b) => a.calc().divide(b.calc())),
        ExpExpr_power: ((a,_,b) => a.calc().exponent(b.calc())),
        PriExpr_paren: ((p1,a,p2) => a.calc()),
        AsExpr: (a,_,u) => a.calc().as(u.calc()),
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
        if(m.failed()) throw new Error("match failed");
        var js = sem(m).calc();
        console.log("parsing",str, "->", js);
        return js;
    }
}
