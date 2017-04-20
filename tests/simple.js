var test = require('tape');
var Parser = require('../src/parser.js');

console.log("running a simple test");

test('does testing work',(t)=>{
	console.log("testing");
	t.end();
});

test('parse a number', (t)=>{
	var str = "50";
	console.log("parsing the number",str);
	var val = Parser.parseString(str);
	t.equal(val,50);
	t.end();
});

test('parse a float', (t) => {
	t.equal(Parser.parseString('50.0'),50.0);
	t.end();
});
