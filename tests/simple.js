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
            //console.log("result is",res.type);
            if(res.type === 'funcall') {
                res = res.invoke();
            }
            if(res.type === 'string') {
                return t.equal(res.string, ans);
            }
            if(res.type === 'number') {
                //return t.approximately(res.value.toFixed(5), ans, 0.00001);
                return t.approximately(res.getValue(), ans, 0.001);
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
            t.approximately(res.getValue(),ans.getValue(),0.01,'value');
            if(!res.sameUnits(ans)) {
                console.log("not the same units!");
                console.log(res);
                console.log(ans);
            }
            t.equal(res.sameUnits(ans),true);
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
    ['42_000_000',42*1000*1000],
    ['42%',0.42],
    ['66.6%',0.666]
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
    //['4^100',Math.pow(4,100)]
]);

unittests("simple units", [
	['6 feet', new Literal(6).withUnit('feet')],
    ['6 feet * 6', new Literal(36).withUnit('feet')],
	['6 meter', new Literal(6).withUnit('meter')],
    ['6 cups', new Literal(6).withUnit('cups')],
    ['40 m', new Literal(40).withUnit('meter')],
    ['40m', new Literal(40).withUnit('meter')],
    ['40m as feet', new Literal(131.234).withUnit('foot')],
    ['4 ft',new Literal(4).withUnit('feet')],
    ['4 ft + 5 ft', new Literal(9).withUnit('feet')],
    ['4 ft - 5 ft', new Literal(-1).withUnit('feet')],
    ['4 yards',new Literal(4).withUnit('yard')],
    ['4 yd',new Literal(4).withUnit('yard')],
    ['5 km',new Literal(5).withUnit('kilometer')],
    ['5 km as meters',new Literal(5000).withUnit('meter')],
    ['5 miles as meters',new Literal(8046.72).withUnit('meter')],
    ['4 quart as gallon', new Literal(1).withUnit('gallon')],
    ['16 cups as gallons', new Literal(1).withUnit('gallon')],
    ['3 teaspoons as tablespoons', new Literal(1).withUnit('tablespoon')],
    ['2 ft * 2 ft', new Literal(4).withUnit('foot',2)],
    //['2 sqft', new Literal(2).withUnit([['squarefoot'],[]])],
    //['2 cuft', new Literal(2, 'cubicfoot')],
    ['2 TB as GB',new Literal(2*1000).withUnit('gigabyte')],
    ['2 TiB as GiB',new Literal(2*1024).withUnit('gibibyte')],
    ['2 MiB as KiB',new Literal(2*1024).withUnit('kibibyte')],
    ['2 KiB as MiB',new Literal(2/1024).withUnit('mebibyte')],
    ['2 KB as MB',new Literal(2/1000).withUnit('megabyte')],
    //['1 GiB as Gibit', new Literal(8).withUnit('gibibit')],
    //['1 GB as Gbit', new Literal(8).withUnit('gigabit')]
    ['2 MB as byte',new Literal(2*1000*1000).withUnit('byte')],
    ['1 kilobyte as byte', new Literal(1000).withUnit('byte')]
]);


unittests('complex units', [
    ['2ft * 2ft', new Literal(4).withUnit('foot',2)],
    ['2ft * 2ft as sqft', new Literal(4).withUnit('foot',2)],
    ['2 ft^2', new Literal(2).withUnit('foot',2)],
    ['2 ft^2 as sqft', new Literal(2).withUnit('foot',2)],

    ['2ft * 2ft * 2 feet', new Literal(8).withUnit('foot',3)],
    ['2 ft^3', new Literal(2).withUnit('foot',3)],
    ['2 ft^3 as cuft', new Literal(2).withUnit('foot',3)],
    ['2ft * 2ft * 2 feet', new Literal(8).withUnit('foot',3)],
    ['2ft * 2ft * 2ft as gallons', new Literal(59.8442).withUnit('gallon')],



    ['50 mile', new Literal(50).withUnit('mile')],
    //['2 feet / second', new Literal(2,'knot',1)],
]);


test("crashed",(t)=>{
    t.throws(()=>{  Parser.parseString("1.2.3"); });
    t.throws(()=>{ Parser.parseString("4a5")});
    t.throws(()=>{ Parser.parseString("4ft + 5")});
    //t.throws(()=>{ Parser.parseString('120m as hours')});
    t.end();
});

unittests("duration units", [
    ["1 second", new Literal(1).withUnit('second')],
    ['1s', new Literal(1).withUnit('second')],
    ['120s as minutes', new Literal(2).withUnit('minute')],
    ['7200s as hours', new Literal(2).withUnit('hour')],
    ['120min as hours', new Literal(2).withUnit('hour')],
    ['12 hr as days', new Literal(0.5).withUnit('day')],
    ['90 days as months', new Literal(3).withUnit('month')],
    ['730 days as years', new Literal(2).withUnit('year')],
    ['5 years as seconds', new Literal(157680000).withUnit('second')]
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


const ER = 6371.008;
unittests("master tests",[
    ['200ft * 600ft as acres',new Literal(2.75482094).withUnit('acre',1)],
    ['10ft * 15ft * 8ft as gallons',new Literal(8976.6).withUnit('gallon',1)],
    //['0xCAFEBABE as decimal',new Literal(0xCAFEBABE)],
//4. pick a random winner from these four people: Random(List('Alice','Bob','Carl','Dan'))
//'1_000_000 / 26',   // (shows in the canonical form (1 million divided by 26))
//6. ex: how long will it take superman to go around the world?  earth.radius / (4000 feet / second) =

    ['(4000 ft/s)',new Literal(4000).withComplexUnitArray(['foot',1],['second',1])],
    ['(4 ft/s) * 6',new Literal(24).withComplexUnitArray(['foot',1],['second',1])],
    ['6*(4 ft/s)',new Literal(24).withComplexUnitArray(['foot',1],['second',1])],
    ['earth.radius*5',new Literal(ER*5).withUnit('kilometer',1)],

    //['6371.008km / (4000 m/s)',new Literal(6371.008*1000/4000).withComplexUnitArray(['second',1],[])],
    //['6371.008 km / (4000 m/s) as hours',new Literal(6371.008*1000/4000/(60*60)).withComplexUnit(['hour'],[])],
    //['earth.radius / (4000 m/s) as hours',new Literal(6371.008*1000/4000/(60*60)).withComplexUnit(['hour'],[])],

//    7. how long does it take light to get from the sun to the earth?  92_000_000 miles / lightspeed = 8 minutes
//8. how long does it take to drive around the world at 60 mph if there was a road that went all around the world? use pi * radius to find circumference in miles, divide by 60mph
//    ['earth.radius * pi / (60 mi/hr)',''],
//9. How many earths could fit inside jupiter? (4/3 * pi * jupiter_radius^2) / (4/3 * pi * earth_radius)
//    ['(4/3*pi*jupiter.radius^3)/(4/3*pi*earth.radius^3)',''],
    //10. what day of the week was I born on? WeekDay(Date("August 31st, 1975"))
    //['WeekDay(Date("1975-08-31"))', 0], //0 is Sunday
//    11. how many songs can I fit on a 1 TB drive? 1 terabyte / average(List(2350kb, 6000kb, 3864kb, 4023kb))
//12. compare the radius of all planets. needs table of planet info. compare(planets.radius) which does the right thing.
//13. compare the population of US states vs their date entering the union
]);