/**
 * Created by josh on 5/16/17.
 */
var test = require('tape');
var compareUnit = require('./common').compareUnit;


test("complex units",(t)=>{
    compareComplexUnit(t,'60 miles', new Literal(60).withUnit('mile'));
    compareComplexUnit(t,'60 miles/hour', new Literal(60).withComplexUnit(['mile'],['hour']));
    compareComplexUnit(t,'60 min * 60 mi/hr', new Literal(60).withComplexUnit(['mile'],[]));
    compareComplexUnit(t,'9.8 m/s^2', new Literal(9.8).withComplexUnit(['meter'],['second','second']));
    compareComplexUnit(t,'9.8 m/s^2 * 10 s', new Literal(98.0).withComplexUnit(['meter'],['second']));
});

