/**
 * Created by josh on 5/1/17.
 */

var UNITS = {};
function makeTime(dr) {
    var unit = {
        name:dr.name,
        dimension: 1,
        type:'duration',
        base:'second',
        ratio: dr.ratio
    };
    UNITS[unit.name] = unit;
    dr.abbr.forEach((abbr) =>  UNITS[abbr] = unit);
}
makeTime({name:'second',abbr:['s','sec','seconds'], ratio:1});
makeTime({name:'minute',abbr:['min','minutes'], ratio:60.0});
makeTime({name:'hour',  abbr:['hr','hours'],ratio: 60*60});
makeTime({name:'day',   abbr:['day','days'],ratio: 60*60*24});
makeTime({name:'month', abbr:['months'],ratio: 60*60*24*30});
makeTime({name:'year',  abbr:['yr','years'],ratio: 60*60*24*365});

function make(name,dim,type,base,ratio,...abbr) {
    var unit = { name:name, dimension:dim, type:type,base:base,ratio:ratio};
    UNITS[unit.name] = unit;
    UNITS[unit.name+'s'] = unit;
    abbr.forEach((abbr)=>UNITS[abbr]=unit);
    console.log('added',unit.name, abbr, unit.ratio);
}

var metric_prefixes = ['kilo','mega','giga','tera','peta','exa','zetta','yotta'];
make('byte',1,'storage','byte',1);
make('bit',1,'storage','byte',8);
metric_prefixes.forEach((prefix,i)=>{
    let abbr1 = prefix[0].toUpperCase()+'B';
    make(prefix+'byte',1,'storage','byte',Math.pow(1000,i+1),abbr1);
    let abbr2 = prefix[0].toLowerCase()+'b';
    make(prefix+'bit',1,'storage','bit',Math.pow(1000,i+1),abbr2);
});

['kibi','mebi','gibi','tebi','pebi','exbi','zebi','yobi'].forEach((prefix,i)=>{
    let abbr1 = prefix[0].toUpperCase()+'iB';
    make(prefix+'byte',1,'storage','byte',Math.pow(1000,i+1),abbr1);
    let abbr2 = prefix[0].toUpperCase()+'ib';
    make(prefix+'bit',1,'storage','bit',Math.pow(1000,i+1),abbr2);
});


make('meter',1,'distance','meter',1,'m');
make('decameter',1,'distance','meter',10,'dam');
make('hectometer',1,'distance','meter',100,'hm');
make('kilometer',1,'distance','meter',1000,'km');
metric_prefixes.slice(1).forEach((prefix,i)=>{
    let abbr1 = prefix[0].toUpperCase()+'m';
    make(prefix+'meter',1,'distance','meter',Math.pow(1000,i+2),abbr1);
});

make('decimeter',1,'distance','meter',1/10,'dm');
make('centimeter',1,'distance','meter',1/100,'cm');
const metric_sub_prefixes = ['milli','micro','nano','pico','femto','atto','zepto','yocto'];
metric_sub_prefixes.forEach((prefix,i) => {
    make(prefix+'meter',1,'distance','meter',Math.pow(1000,-(i+1)),prefix[0]+'m');
});

make('mile',1,'distance','meter',1609.344,'mi');
make('foot',1,'distance','meter',0.3048,'feet','ft');
make('yard',1,'distance','meter',0.3048*3,'yards','yd');

make('squarefoot',1,'area','meter',0.092903,'sqft','squarefeet');
make('cubicfoot',1,'volume','meter',0.0283168,'cuft','cubicfeet');
make('acre',1,'area','meter',4046.86,'acres');


make('gallon',1,'volume','meter',0.00378541,'gallons','gal');
make('quart',1,'volume','gallon',1/4,'quarts','qt');
make('pint',1,'volume','gallon',1/8,'pints');
make('cup',1,'volume','gallon',1/16,'cups');
make('tablespoon',1,'volume','gallon',1/256,'tablespoons','tbs');
make('teaspoon',1,'volume','gallon',1/(256*3),'teaspoons','tsp');

make('decimal',1,'misc','none',1);
make('hex',1,'misc','none',1);

class Unit {
    constructor(name, dimension) {
        if(UNITS[name]) {
            var unit = UNITS[name];
            this.name = unit.name;
            this.dimension = unit.dimension;
            this.type = unit.type;
            this.base = unit.base;
            this.ratio = unit.ratio;
        }

        if(dimension) this.dimension = dimension;

        if(!this.name) throw new Error("unrecognized unit " + name);
    }
    convertTo(val,name) {
        var unit = new Unit(name);

        if(this.type === 'distance' && unit.type === 'area' && this.dimension === 2) {
            //console.log("we can convert from distance^2 to area");
            return val * this.ratio / unit.ratio;
        }
        if(this.type === 'distance' && unit.type === 'volume' && this.dimension === 3) {
            //console.log("we can convert from distance^3 to volume");
            return val * this.ratio / unit.ratio;
        }
        if(this.type !== unit.type) {
            throw new Error(`'${this.type}' and '${unit.type}' are incompatible types. Cannot convert between them.`);
        }
        return val * this.ratio / unit.ratio;
    }
    multiply(unit) {
        return new Unit(this.name, this.dimension + unit.dimension);
    }
}

class ComplexUnit {
    constructor(numer,denom) {
        //console.log("creating a complex unit with",numer, denom);
        if(numer instanceof Unit) {
            //console.log("this is a unit:",numer.name);
            numer = [numer.name];
        }
        if(!numer) numer = [];
        if(!denom) denom = [];
        this.numer = numer;
        this.denom = denom;
        this.numer = this.numer.map(name => new Unit(name).name);
        this.denom = this.denom.map(name => new Unit(name).name);
        this.numer.sort();
        this.denom.sort();
        //console.log('converted to canonical names',this.numer, this.denom);
    }
    toString() {
        return "ComplexUnit: " + this.numer.join(",") + " " + this.denom.join(",");
    }
    convertTo(val,B) {
        var A = this;
        console.log("converting this " + A.toString(),'to',B.toString(), `with value ${val}`);

        var AA = A.numer.map((name)=> new Unit(name)).reduce((a,b)=>{
            //console.log("combining",a,b);
            if(!a) return b;
            if(a.name == b.name) return new Unit(a.name, a.dimension + b.dimension);
            return "null";
        },null);
        //console.log("AA = ", AA);
        var BB = B.numer.map((name)=> new Unit(name)).reduce((a,b)=>{
            //console.log("combining",a,b);
            if(!a) return b;
            if(a.name == b.name) return new Unit(a.name, a.dimension + b.dimension);
            return "null";
        },null);
        //console.log("BB = ", BB);


        //we can convert length ^3 to volume
        if(AA.type === 'distance' &&  AA.dimension === 3 && BB.type === 'volume') {
            var nval = val.mul(Math.pow(AA.ratio,AA.dimension)).div(BB.ratio);
            return nval;
        }

        if(AA.type === 'distance' && AA.dimension === 2 && BB.type === 'area') {
            var nval = val.mul(Math.pow(AA.ratio,AA.dimension)).div(BB.ratio);
            return nval;
        }

        if(AA.type === BB.type && AA.dimension === BB.dimension && AA.base == BB.base) {
            var nval = val.mul(Math.pow(AA.ratio,AA.dimension)).div(BB.ratio);
            return nval;
        }

        if(AA.type === BB.type && AA.dimension === BB.dimension && AA.base == BB.name) {
            var nval = val.mul(Math.pow(AA.ratio,AA.dimension)).div(1);
            return nval;
        }

        throw new Error("cannot do this kind of conversion");

    }
    equal(B) {
        //console.log('checking if',B,'is equal to me',this);
        var A = this;
        return compareArrays(A.denom, B.denom) && compareArrays(A.numer, B.numer);
    }
    multiply(B) {
        //console.log("muliplying",this,'times',B);
        var A = this;
        return new ComplexUnit(A.numer.concat(B.numer), A.denom.concat(B.denom));
    }
}

function compareArrays(A,B) {
    if(!A instanceof Array) return false;
    if(!B instanceof Array) return false;
    if(A.length !== B.length) return false;
    var good = true;
    for(var i=0; i< A.length; i++) {
        if(A[i] !== B[i]) good = false;
    }
    return good;
}

module.exports = {
    Unit: Unit,
    ComplexUnit: ComplexUnit
}