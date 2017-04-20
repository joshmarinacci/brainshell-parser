var fs = require('fs');
var ohm = require('ohm-js');

var file = require('./parser.ohm');
console.log("the file is",file)

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

function init() {
    var source = "";
    if(typeof window !== undefined) {
        GET(file).then((source)=>{
            console.log("got the souce",source);
            grammar = ohm.grammar(source);
            sem = grammar.createSemantics().addOperation('calc', {
                Number: (a) => a.calc(),
                integer: function(a) {
                    return parseInt(this.sourceString,10);
                },
                float: function(a,b,c,e) {
                    return parseFloat(this.sourceString);
                },
                hex:  function(a,b) {
                    return parseInt(this.sourceString);
                },
                exp: function(_,sign,exp) {
                    return parseFloat(exp);
                },
                AddExpr_plus: ((a,_,b) => a.calc()+b.calc()),
                AddExpr_minus: ((a,_,b) => a.calc()- b.calc()),
                MulExpr_multiply: ((a,_,b) => a.calc() * b.calc()),
                MulExpr_divide: ((a,_,b) => a.calc() / b.calc()),

            });
        });
    } else {
        source = fs.readFileSync("src/parser.ohm");
        grammar = ohm.grammar(source);
        sem = grammar.createSemantics().addOperation('calc', {
            Number: (a) => a.calc(),
            integer: function(a) {
                return parseInt(this.sourceString,10);
            },
            float: function(a,b,c,e) {
                return parseFloat(this.sourceString);
            },
            hex:  function(a,b) {
                return parseInt(this.sourceString);
            },
            exp: function(_,sign,exp) {
                return parseFloat(exp);
            },
            AddExpr_plus: ((a,_,b) => a.calc()+b.calc()),
            AddExpr_minus: ((a,_,b) => a.calc()- b.calc()),
            MulExpr_multiply: ((a,_,b) => a.calc() * b.calc()),
            MulExpr_divide: ((a,_,b) => a.calc() / b.calc()),

        });
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
