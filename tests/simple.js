var test = require('tape');
require('tape-approximately')(test);
var Parser = require('../src/parser.js');

function tests(msg,arr) {
	test(msg, (t)=>{
		arr.forEach((tcase) => {
			var str = tcase[0];
			var ans = tcase[1];
			t.approximately(Parser.parseString(str),ans,0.00001);
		});
		t.end();
	});
}
tests('parsing 42 in different formats', [
	['42',42],
	['4.2',4.2],
	['0x42',0x42],
	['4.2e2',420]
]);
tests("simple math 2", [
	['4+2',6],
	['4.4+2.2',6.6],
	['4-2',2],
	['4*2',8],
	['4/2',2],
]);
