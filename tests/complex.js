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
    t.end();
});

