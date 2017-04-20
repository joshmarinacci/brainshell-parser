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
	t.equal(Parser.parseString('1.8'),1.8);
	t.end();
});

test('parse 42 in various formats',(t)=>{
	t.equal(Parser.parseString('42'),42);
	t.equal(Parser.parseString('42.42'),42.42);
	t.equal(Parser.parseString('0x42'),0x42);
    //compareFormat(t,"42",42,"decimal");
    //compareFormat(t,"x42",42,"hex");
    //compareFormat("0xFFCC88",0xFFCC88,'hex');
    //compareFormat("42 as hex",42,"hex");
    //compareFormat("42 as octal",42,"octal");
    //compareFormat("42 as binary",42,"binary");
    //compareFormat("0xBEEF as decimal",0xBEEF,'decimal');
	t.end();
});

