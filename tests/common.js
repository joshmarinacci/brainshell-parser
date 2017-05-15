/**
 * Created by josh on 5/13/17.
 */
var test = require('tape');
require('tape-approximately')(test);
var Parser = require('../src/parser.js');
var Literal = require('../src/Literal').Literal;
var moment = require('moment');
function compareUnit(t, str, num, unit, dim) {
    let res = Parser.parseString(str);
    t.approximately(res.getValue(),num, 0.01);
    let ans = new Literal(num).withUnit(unit);
    if(unit === 'none') {

    } else {
        if(dim && dim !== 1) {
            ans = new Literal(num).withPowerUnit(unit,dim);
        }
        if(!res.sameUnits(ans)) {
            console.log("units not equal: ", str, res.toString());
            console.log(res);
            console.log(ans);
        }
        t.equal(res.sameUnits(ans), true);
    }

}

module.exports = {
    compareUnit: compareUnit
};