var test = require('tape');
require('tape-approximately')(test);
var Parser = require('../src/parser.js');
var Literal = require('../src/Literal').Literal;


function tests(msg,arr) {
    test(msg, (t)=>{
        arr.forEach((tcase) => {
            var str = tcase[0];
            var ans = tcase[1];
            t.approximately(Parser.parseString(str).value,ans,0.00001);
        });
        t.end();
    });
}
function unittests(msg,arr) {
    test(msg, (t)=>{
        arr.forEach((tcase) => {
            var str = tcase[0];
            var ans = tcase[1];
            var res = Parser.parseString(str);
            t.approximately(res.value,ans.value,0.001);
            t.equal(res.unit.name,ans.unit.name);
        });
        t.end();
    });
}

tests('parsing 42 in different formats', [
	['42',42],
	['4.2',4.2],
	['0x42',0x42],
	['4.2e2',420],
    ['42e2',4200]
]);

tests("simple math 2", [
	['4+2',6],
	['4.4+2.2',6.6],
	['4-2',2],
	['4*2',8],
	['4/2',2],
    ['4^2',16],
]);



unittests("simple units", [
	['6 feet', new Literal(6,'feet')],
	['6 meter', new Literal(6, 'meter')],
    ['6 cups', new Literal(6, 'cups')],
    ['40 m', new Literal(40, 'meter')],
    ['40m', new Literal(40, 'meter')],
    ['40m as feet', new Literal(131.234,'foot')],
    ['4 ft',new Literal(4,'feet')],
    ['4 ft + 5 ft', new Literal(9,'feet')]
]);

