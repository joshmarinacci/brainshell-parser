/**
 * Created by josh on 5/13/17.
 */
var test = require('tape');
require('tape-approximately')(test);
var Parser = require('../src/parser.js');
var LiteralNumber = require('../src/LiteralNumber').LiteralNumber;

function compareUnit(t, str, num, unit, dim) {
    let res = Parser.parseString(str);
    t.approximately(res.getValue(),num, 0.01);
    let ans = new LiteralNumber(num).withUnit([unit]);
    if(unit === 'none') {

    } else {
        if(dim && dim !== 1) {
            ans = new LiteralNumber(num).withUnit([[unit,dim]]);
        }
        if(!res.equalUnits(ans)) {
            console.log("units not equal: ", str, res.toString());
            console.log(res.toString(),res.getUnit());
            console.log(ans.toString(),ans.getUnit());
        }
        t.equal(res.equalUnits(ans), true);
    }

}

function compareComplexUnit(t,str,ans) {
    let res = Parser.parseString(str);
    t.approximately(res.getValue(),ans.getValue(), 0.5);
    if(!res.sameUnits(ans)) {
        console.log("units not equal: ", str, res.toString());
        console.log(res.toString(),res.getUnit());
        console.log(ans.toString(),ans.getUnit());
    }
    t.equal(res.sameUnits(ans), true);
}

module.exports = {
    compareUnit: compareUnit,
    compareComplexUnit: compareComplexUnit,
};