/**
 * Created by josh on 5/16/17.
 */
var test = require('tape');
var compareComplexUnit = require('./common').compareComplexUnit;
var Literal = require('../src/Literal').Literal;


test("complex units",(t)=>{
    compareComplexUnit(t,'60 miles', new Literal(60).withUnit('mile'));
    compareComplexUnit(t,'60 miles/hour', new Literal(60).withComplexUnitArray(['mile',1],['hour',1]));
    compareComplexUnit(t,'60 miles/hour * 2', new Literal(120).withComplexUnitArray(['mile',1],['hour',1]));
    compareComplexUnit(t,'2*60 miles/hour * 1', new Literal(120).withComplexUnitArray(['mile',1],['hour',1]));
    compareComplexUnit(t,'60 min * 60 mi/hr', new Literal(60).withComplexUnitArray(['mile'],[]));
    compareComplexUnit(t,'9.8 m/s^2', new Literal(9.8).withComplexUnitArray(['meter',1],['second',2]));
    compareComplexUnit(t,'9.8 m/s^2 * 10 s', new Literal(98.0).withComplexUnitArray(['meter'],['second']));

    compareComplexUnit(t,'1/10m/s',new Literal(0.1).withComplexUnitArray(['second',1],['meter',1]));
    compareComplexUnit(t,'5m / 5m/s',new Literal(1).withComplexUnitArray(['second',1],[]));
    compareComplexUnit(t,'5km / 5m/s',new Literal(1000).withComplexUnitArray(['second',1],[]));

    //compareComplexUnit(t,'5000km * 0.1s/km',new Literal(5000*0.1).withComplexUnitArray(['second',1],[]));
    // Literal(6371.008*1000/4000).withComplexUnitArray(['second',1],[])],
    //compareComplexUnit(t,'6371.008 km / (4000 m/s) as hours',new Literal(6371.008*1000/4000/(60*60)).withComplexUnitArray(['hour',1],[])),



    //['earth.radius / (4000 m/s) as hours',new Literal(6371.008*1000/4000/(60*60)).withComplexUnit(['hour'],[])],

    t.end();
});

