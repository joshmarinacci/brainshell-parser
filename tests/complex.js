/**
 * Created by josh on 5/16/17.
 */
var test = require('tape');
var compareComplexUnit = require('./common').compareComplexUnit;
var Literal = require('../src/Literal').Literal;


test("complex units",(t)=>{
    compareComplexUnit(t,'3ft * (1ft/s)', new Literal(3).withComplexUnitArray(['foot',2],['second',1]));
    compareComplexUnit(t,'3ft / (1 ft/s)',new Literal(3).withComplexUnitArray(['second',1],[]));
    compareComplexUnit(t,'3ft / (1 ft/s) as second',new Literal(3).withUnit('second'));
    compareComplexUnit(t,'3ft / (1 ft/min) as second',new Literal(3*60).withUnit('second',1));
    //compareComplexUnit(t,'1m / (1ft/s)', new Literal(1*3.28).withComplexUnitArray(['second',1],[]));
    compareComplexUnit(t,'60 miles', new Literal(60).withUnit('mile'));
    compareComplexUnit(t,'60 miles/hour', new Literal(60).withComplexUnitArray(['mile',1],['hour',1]));
    compareComplexUnit(t,'60 miles/hour * 2', new Literal(120).withComplexUnitArray(['mile',1],['hour',1]));
    compareComplexUnit(t,'2*60 miles/hour * 1', new Literal(120).withComplexUnitArray(['mile',1],['hour',1]));
    compareComplexUnit(t,'60 min * 60 mi/hr', new Literal(60).withComplexUnitArray(['mile'],[]));
    compareComplexUnit(t,'9.8 m/s^2', new Literal(9.8).withComplexUnitArray(['meter',1],['second',2]));
    compareComplexUnit(t,'9.8 m/s^2 * 10 s', new Literal(98.0).withComplexUnitArray(['meter'],['second']));
    compareComplexUnit(t,'10 s * 9.8 m/s^2', new Literal(98.0).withComplexUnitArray(['meter'],['second']));
    compareComplexUnit(t,'60 mile / 1 hour', new Literal(60).withComplexUnitArray(['mile'],['hour']));
    //compareComplexUnit(t,'4000 mile * 1 hour / 40 mile', new Literal(100).withUnit('hour'));
    //compareComplexUnit(t,'4000 mile / (40 mi/hr)', new Literal(100).withUnit('hour'));
    //compareComplexUnit(t,'600000 meter / (40 mi/hr)', new Literal(9.32).withUnit('hour'));
    compareComplexUnit(t,'1/10m/s',new Literal(0.1).withComplexUnitArray(['second',1],['meter',1]));
    compareComplexUnit(t,'5m / 5m/s',new Literal(1).withComplexUnitArray(['second',1],[]));
    compareComplexUnit(t,'5km / 5m/s',new Literal(1000).withComplexUnitArray(['second',1],[]));
    //compareComplexUnit(t,'earth.radius / 4000 feet/second',new Literal(1592.752).withComplexUnitArray(['second'],[]));
    compareComplexUnit(t,'4000mi / (4000 ft/second)',new Literal(5280).withComplexUnitArray(['second'],[]));
    compareComplexUnit(t,'4000mi / (2727 mi/hr)',new Literal(1.46).withComplexUnitArray(['hour'],[]));
    compareComplexUnit(t,'earth.radius / 4000 m/s as hours',new Literal(0.44).withUnit('hour'));

    //7. how long does it take light to get from the sun to the earth?
    //compareComplexUnit(t,'92_000_000 miles / lightspeed as minutes', new Literal(8).withUnit('minute'));
    //how long does it take to drive around the world at 60 mph
    //compareComplexUnit(t,'earth.radius * 2 * pi / 60 mi/hr as days', new Literal(415/24).withUnit('hour'));
    //How many earths could fit inside jupiter?
    //compareComplexUnit(t,'(4/3 * pi * jupiter.radius^3) / (4/3*pi*earth.radius^3)', new Literal(1300));
    t.end();
});

