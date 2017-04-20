var fs = require('fs');
var ohm = require('ohm-js');
var grammar = ohm.grammar(fs.readFileSync('src/parser.ohm'));

var sem = grammar.createSemantics().addOperation('toJS', {
	Number: (a) => a.toJS(),
	integer: function(a) {
		return parseInt(this.sourceString,10);
	},
	float: function(a,b,c) {
		return parseFloat(this.sourceString);
	}
});

module.exports = {
   parseString: function(str) {
	console.log("parsing",str);
	var m = grammar.match(str);
	if(m.failed()) throw new Error("match failed");
	var js = sem(m).toJS();
	console.log('js = ', js);
	return js;
   }
}
