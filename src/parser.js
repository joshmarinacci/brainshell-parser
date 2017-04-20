var fs = require('fs');
var ohm = require('ohm-js');
var grammar = ohm.grammar(fs.readFileSync('src/parser.ohm'));

var sem = grammar.createSemantics().addOperation('calc', {
	Number: (a) => a.calc(),
	integer: function(a) {
		return parseInt(this.sourceString,10);
	},
	float: function(a,b,c) {
		return parseFloat(this.sourceString);
	},
	hex:  function(a,b) {
		return parseInt(this.sourceString);
	},
	AddExpr_plus: ((a,_,b) => a.calc()+b.calc())
});

module.exports = {
   parseString: function(str) {
	var m = grammar.match(str);
	if(m.failed()) throw new Error("match failed");
	var js = sem(m).calc();
	console.log("parsing",str, "->", js);
	return js;
   }
}
