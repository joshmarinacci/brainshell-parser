var fs = require('fs');
var ohm = require('ohm-js');
var grammar = ohm.grammar(fs.readFileSync('src/parser.ohm'));

var sem = grammar.createSemantics().addOperation('toJS', {
	Number: function(a) {
		return parseInt(this.sourceString,10);
	}
});

module.exports = {
   parseString: function(str) {
	console.log("parsing",str);
	var m = grammar.match(str);
	console.log('failed = ', m.failed());
	var js = sem(m).toJS();
	console.log('js = ', js);
	return js;
   }
}
