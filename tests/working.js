/**
 * Created by josh on 5/2/17.
 */
var test = require('tape');
require('tape-approximately')(test);
var Literal = require('../src/Literal').Literal;
var Parser = require('../src/parser.js');

function unittests(msg,arr) {
    test(msg, (t)=>{
        arr.forEach((tcase) => {
            let str = tcase[0];
            let ans = tcase[1];
            let res = Parser.parseString(str);
            t.approximately(res.value,ans.value,0.001,'value');
            t.equal(res.unit.equal(ans.unit),true);
        });
        t.end();
    });
}


unittests("master tests",[
    ['(4 ft/s)',new Literal(4).withComplexUnit(['feet'],['second'])],
    ['(4 ft/s) * 6',new Literal(4).withComplexUnit(['feet'],['second'])],
    ['6 * 4 ft/s',new Literal(4).withComplexUnit(['feet'],['second'])],
    ['6*(4 ft/s)',new Literal(4).withComplexUnit(['feet'],['second'])],
]);
