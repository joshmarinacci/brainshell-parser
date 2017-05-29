/**
 * Created by josh on 5/19/17.
 */

function styleUnit(u) {
    function f(n) {
        if(n.getDimension() > 1) {
            return `${n.getName()}<sup>${n.getDimension()}</sup>`;
        }
        if(n.getName() === 'none') return "";
        return `${n.getName()}`;
    }
    var str = u._numers.map(f).join(" ");
    if(u._denoms.length > 0) {
        str += '/'+ u._denoms.map(f).join(" ");
    }
    return str;
}

module.exports = {
    style: function(lit) {
        console.log("styling",lit);
        //return 'doing a literal'+lit.toString();
        if(lit) {
            return `<p>
        <b>${lit.getValue()}</b>
        ${styleUnit(lit)}
        </p>`;
        } else {
            return "";
        }
    }
};
