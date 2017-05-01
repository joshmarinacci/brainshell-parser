var test = require('tape');
require('tape-approximately')(test);
var Parser = require('../src/parser.js');
var Literal = require('../src/Literal').Literal;
var moment = require('moment');


function tests(msg,arr) {
    test(msg, (t)=>{
        arr.forEach((tcase) => {
            let str = tcase[0];
            let ans = tcase[1];
            let res = Parser.parseString(str);
            console.log("result is",res.type);
            if(res.type === 'funcall') {
                res = res.invoke();
            }
            if(res.type === 'string') {
                return t.equal(res.string, ans);
            }
            if(res.type === 'number') {
                return t.approximately(res.value.toFixed(5), ans, 0.00001);
            }
            console.log('not a known type');
            return t.equal(res.toString(),ans);
        });
        t.end();
    });
}
function unittests(msg,arr) {
    test(msg, (t)=>{
        arr.forEach((tcase) => {
            let str = tcase[0];
            let ans = tcase[1];
            let res = Parser.parseString(str);
            t.approximately(res.value,ans.value,0.001,'value');
            t.equal(res.unit.name,ans.unit.name,'name');
            t.equal(res.unit.dimension, ans.unit.dimension,'dimension');
        });
        t.end();
    });
}

function testsCanonical(msg,arr) {
    test(msg, (t)=>{
        arr.forEach((tcase) => {
            let str = tcase[0];
            let ans = tcase[1];
            let res = Parser.parseString(str);
            t.equal(res.toCanonical().trim(),ans.trim(),'canonical');
        });
        t.end();
    });
}

tests('parsing 42 in different formats', [
	['42',42],
	['4.2',4.2],
	['0x42',0x42],
	['4.2e2',420],
    ['42e2',4200],
    ['42_000_000',42*1000*1000]
]);

testsCanonical('parsing to canonical output', [
    ['42','42'],
    ['0x42','0x42'],
    ['0x42 as decimal','66'],
    ['42 as hex','0x2a']
]);


tests("simple math 2", [
	['4+2',6],
	['4.4+2.2',6.6],
	['4-2',2],
	['4*2',8],
	['4/2',2],
    ['4^2',16],
    ['1+2*3',7],
    ['1+(2*3)',7],
    ['(1+2)*3',9]
]);

tests("big numbers", [
    ['4^100',Math.pow(4,100)]
]);

unittests("simple units", [
	['6 feet', new Literal(6,'feet')],
	['6 meter', new Literal(6, 'meter')],
    ['6 cups', new Literal(6, 'cups')],
    ['40 m', new Literal(40, 'meter')],
    ['40m', new Literal(40, 'meter')],
    ['40m as feet', new Literal(131.234,'foot')],
    ['4 ft',new Literal(4,'feet')],
    ['4 ft + 5 ft', new Literal(9,'feet')],
    ['4 ft - 5 ft', new Literal(-1,'feet')],
    ['4 yards',new Literal(4,'yard')],
    ['4 yd',new Literal(4,'yard')],

    ['5 km',new Literal(5,'kilometer')],
    ['5 km as meters',new Literal(5000,'meter')],
    ['5 miles as meters',new Literal(8046.72,'meter')],
    ['4 quart as gallon', new Literal(1,'gallon')],
    ['16 cups as gallons', new Literal(1,'gallon')],
    ['3 teaspoons as tablespoons', new Literal(1,'tablespoon')],
    ['2 ft * 2 ft', new Literal(4,'foot',2)],
    ['2 sqft', new Literal(2,'squarefoot',2)],
    //['2 ft^2', new Literal(2, 'foot',2)],
    //['2 ft^3', new Literal(2, 'foot',3)],
    ['2 cuft', new Literal(2, 'cubicfoot',3)],
    ['2 TB as GB',new Literal(2*1000,'gigabyte')],
    //['2 TiB as GiB',new Literal(2*1024,'gibibyte')],
    //['2 MiB as KiB',new Literal(2*1024,'kibibyte')],
    //['2 KiB as MiB',new Literal(2/1024,'mebibyte')],
    ['2 MB as KB',new Literal(2*1000,'kilobyte')],
    ['2 KB as MB',new Literal(2/1000,'megabyte')],
    //['1 GiB as Gibit', new Literal(8, 'gibibit')],
    //['1 GB as Gbit', new Literal(8, 'gigabit')]
]);

unittests('complex units', [
    ['2ft * 2ft', new Literal(4,'feet',2)],
    ['2ft * 2ft as sqft', new Literal(4,'squarefeet')],
    ['2ft * 2ft * 2ft', new Literal(8,'feet',3)],
    //['2ft * 2ft * 2ft as gallons', new Literal(59.8442,'gallon',1)],
    //['2 feet / second', new Literal(1,'knot')]
]);

test("crashed",(t)=>{
    t.throws(()=>{  Parser.parseString("1.2.3"); });
    t.throws(()=>{ Parser.parseString("4a5")});
    t.throws(()=>{ Parser.parseString("4ft + 5")});
    t.throws(()=>{ Parser.parseString('120m as hours')});
    t.end();
});


unittests("duration units", [
    ["1 second", new Literal(1,'second')],
    ['1s', new Literal(1,'second')],
    ['120s as minutes', new Literal(2, 'minute')],
    ['7200s as hours', new Literal(2, 'hour')],
    ['120min as hours', new Literal(2, 'hour')],
    ['12 hr as days', new Literal(0.5, 'day')],
    ['90 days as months', new Literal(3, 'month')],
    ['730 days as years', new Literal(2, 'year')],
    ['5 years as seconds', new Literal(157680000,'second')]
]);

tests("constants", [
    ['Pi',Math.PI],
    ['pi',Math.PI],
    ['earth.radius as mi',3958.76084],
    ['jupiter.radius as km', 69911]
]);

tests("function calls", [
    ["'foo'", "foo"], //string literal
    ['Date("1975-08-31")', moment('1975-08-31').toString()],
    ['Year(Date("1975-08-31"))', 1975],
    ['WeekDay(Date("1975-08-31"))', 0] //0 is Sunday
]);

tests("lists", [
    //['List(4,5,6)',[4,5,6]],
    //['[4,5,6]',[4,5,6]],
]);