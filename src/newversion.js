/**
 * Created by josh on 5/22/17.
 */
var test = require('tape');
require('tape-approximately')(test);
var Parser = require('../src/parser.js');
var LiteralNumber = require('./LiteralNumber').LiteralNumber;


/*
create a new implementation. forget the parser for now. just do unit calcs.
    new LiteralNumber(value, numers, denoms)
or UNITS.makeNumber(5, [['ft']],[['s']]) = 5 ft/s
UNITS.makeNumber(9.8 [['m']],[['s',2]]) = 9.8 m/s^2

for multiplying, combine the units then expand and reduce

for converting
    if number unit equal to target unit end
find conversions of the same type that apply to the target
apply conversions
reduce
if equal now, then end
find conversions across type that apply to the target
apply conversions
reduce
if equal now, then end
else, not convertible. throw error
*/


function compare(t,res,ans) {
    console.log(`comparing ${res} to ${ans}`);
    t.approximately(res.getValue(),ans.getValue(), 0.5);
    t.equal(res.equalUnits(ans),true);
}
test('basic conversion',(t)=>{
    compare(t,new LiteralNumber(5).withUnits(['hour'],[])
        .as(new LiteralNumber(1).withUnits(['second'],[])),
        new LiteralNumber(5*60*60).withUnits(['second'],[]));
    compare(t, new LiteralNumber(3).withUnits(['foot'],[]).multiply(new LiteralNumber(1).withUnits(['foot'],['second'])),
        new LiteralNumber(3).withUnits([['foot',2]],['second']));
    compare(t, new LiteralNumber(3).withUnits(['foot'],[]).divide(new LiteralNumber(1).withUnits(['foot'],['second'])),
        new LiteralNumber(3).withUnits(['second']));
    compare(t, new LiteralNumber(3).withUnits(['foot']).divide(new LiteralNumber(1).withUnits(['foot'],['second'])).as(new LiteralNumber(1).withUnits(['second'])),
        new LiteralNumber(3).withUnits(['second'])
    );
    compare(t, new LiteralNumber(3).withUnits(['foot']).divide(new LiteralNumber(1).withUnits(['foot'],['minute'])).as(new LiteralNumber(1).withUnits(['second'])),
        new LiteralNumber(3*60).withUnits(['second'])
    );
    compare(t, new LiteralNumber(1).withUnits(['meter']).divide(new LiteralNumber(1).withUnits(['foot'],['second'])),
        new LiteralNumber(3.28084).withUnits(['second'])
    );
    compare(t, new LiteralNumber(60).withUnits(['mile']), new LiteralNumber(60).withUnits(['mile']));
    compare(t, new LiteralNumber(60).withUnits(['mile'],['hour']).multiply(new LiteralNumber(2)), new LiteralNumber(120).withUnits(['mile'],['hour']));
    compare(t, new LiteralNumber(60).withUnits(['minute']).multiply(new LiteralNumber(60).withUnits(['mile'],['hour'])),
        new LiteralNumber(60).withUnits(['mile'])
    );

    compare(t, new LiteralNumber(9.8).withUnits(['meter'],[['second',2]]), new LiteralNumber(9.8).withUnits(['meter'],[['second',2]]));
    compare(t, new LiteralNumber(9.8).withUnits(['meter'],[['second',2]]).multiply(new LiteralNumber(10).withUnits(['second'])),
        new LiteralNumber(98.0).withUnits(['meter'],[['second',2]]));
    compare(t, new LiteralNumber(10).withUnits(['second']).multiply(new LiteralNumber(9.8).withUnits(['meter'],[['second',2]])),
        new LiteralNumber(98.0).withUnits(['meter'],[['second',2]]));

    compare(t, new LiteralNumber(4000).withUnits(['mile'])
        .multiply(new LiteralNumber(1).withUnits(['hour']))
        ,new LiteralNumber(4000).withUnits(['mile','hour'])
    );
    compare(t, new LiteralNumber(4000).withUnits(['mile'])
        .multiply(new LiteralNumber(1).withUnits(['hour']))
        .divide(new LiteralNumber(40).withUnits(['mile']))
        ,new LiteralNumber(100).withUnits(['hour'])
    );
    compare(t, new LiteralNumber(600000).withUnits(['meter'])
        .divide(new LiteralNumber(40).withUnits(['mile'],['hour']))
        ,new LiteralNumber(9.32).withUnits(['hour'])
    );
    compare(t, new LiteralNumber(1)
        .divide(new LiteralNumber(10).withUnits(['meter'],['second']))
        ,new LiteralNumber(0.1).withUnits(['second'],['meter'])
    );
    compare(t, new LiteralNumber(5).withUnits(['kilometer'])
        .divide(new LiteralNumber(5).withUnits(['meter'],['second']))
        ,new LiteralNumber(1000).withUnits(['second'])
    );
    //compareComplexUnit(t,'5km / 5m/s',new Literal(1000).withComplexUnitArray(['second',1],[]));
    const ER = 6371.008;
    compare(t, new LiteralNumber(ER).withUnits(['kilometer'])
        .divide(new LiteralNumber(4000).withUnits(['foot'],['second']))
        .as(new LiteralNumber(1).withUnits(['hour']))
    ,new LiteralNumber((ER*1000/1219.2)/60/60).withUnits(['hour'])
    );


    compare(t, new LiteralNumber(ER).withUnits(['kilometer'])
        .multiply(new LiteralNumber(2))
        .multiply(new LiteralNumber(Math.PI))
        .divide(new LiteralNumber(60).withUnits(['kilometer'],['hour']))
        .as(new LiteralNumber(1).withUnits(['day']))
        ,new LiteralNumber(ER*2*Math.PI/60/24).withUnits(['day'])
    );
    //compareComplexUnit(t,'earth.radius * 2 * pi / 60 km/hr as days', new Literal(ER*Math.PI*2/60/24).withUnit('day'));

    //compareComplexUnit(t,'jupiter.radius^3 * 4/3 * pi', new' +
    //' Literal(Math.pow(JR,3)*4/3*Math.PI).withComplexUnitArray(['kilometer',3],[]));
    var JR = 69911;
    compare(t, new LiteralNumber(JR).withUnits(['kilometer'])
        .exponent(new LiteralNumber(3))
        .multiply(new LiteralNumber(4))
        .divide(new LiteralNumber(3))
        .multiply(new LiteralNumber(Math.PI))
    , new LiteralNumber(Math.pow(JR,3)*4/3*Math.PI).withUnits([['kilometer',3]])
    );

    compare(t, new LiteralNumber(JR).withUnits(['kilometer'])
        .exponent(new LiteralNumber(3))
        .multiply(new LiteralNumber(4))
        .divide(new LiteralNumber(3))
        .multiply(new LiteralNumber(Math.PI))
        .divide(
            new LiteralNumber(ER).withUnits(['kilometer'])
                .exponent(new LiteralNumber(3))
                .multiply(new LiteralNumber(4))
                .divide(new LiteralNumber(3))
                .multiply(new LiteralNumber(Math.PI))
        )
        , new LiteralNumber(1321.33)
    );

    //compareComplexUnit(t,'(jupiter.radius^3 * 4/3 * pi) / (earth.radius^3 * 4/3 * pi)', new' +
    //' Literal(1321.33));
    //['4 quart as gallon', new Literal(1).withUnit('gallon')],

    compare(t, new LiteralNumber(4).withUnits(['quart']).as(new LiteralNumber(1).withUnits(['gallon']))
        , new LiteralNumber(1).withUnits(['gallon'])
    );
    compare(t, new LiteralNumber(5).withUnits(['mile']).as(new LiteralNumber(1).withUnits(['meter']))
        , new LiteralNumber(8046.72).withUnits(['meter'])
    );
    //    ['5 miles as meters',new Literal(8046.72).withUnit('meter')],


    function strCompare(t,str,ans) {
        let res = Parser.parseString(str);
        console.log(res, 'compared with', ans);
        console.log("res = ", res.toString(), ans.toString());
        t.approximately(res.getValue(), ans.getValue(), 0.5);
        t.equal(res.equalUnits(ans), true);
    }
    strCompare(t,'5m',new LiteralNumber(5).withUnits(['meter']));

    t.end();


});
