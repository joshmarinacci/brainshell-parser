/**
 * Created by josh on 5/19/17.
 */

function styleUnit(u) {
    function f(n) {
        if(n.dimension > 1) {
            return `${n.name}<sup>${n.dimension}</sup>`;
        }
        if(n.name === 'none') return "";
        return `${n.name}`;
    }
    if(u.isCompound()) {
        //console.log("unti is", u);
        var str = u.numers.map(f).join(" ");
        if(u.denoms.length > 0) {
            str += '/'+ u.denoms.map(f).join(" ");
        }
        console.log("returning",str);
        return str;
    } else {
        console.log('doing',f(u));
        return f(u);
        //return u.toString();
    }
}

module.exports = {
    style: function(lit) {
        console.log("styling",lit);
        //return 'doing a literal'+lit.toString();
        if(lit) {
            return `<p>
        <b>${lit.getValue()}</b>
        ${styleUnit(lit.getUnit())}
        </p>`;
        } else {
            return "";
        }
        /*
            Literal: (num, unit) => "<p>" + num.style() + " " + unit.style() + "</p>",
            Number: function(a) {
                var v = this.calc();
                //console.log("value = ", v);
                return `<b>${v.getValue()}</b>`;
            },
            Unit: function (mod, numer, div, denom) {
                var u = this.calc();
            }
        });
        */
    }
};
