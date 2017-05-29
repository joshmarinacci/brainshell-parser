/**
 * Created by josh on 5/29/17.
 */
class LiteralString {
    constructor(str) {
        this.type = 'string';
        this.string = str;
    }
    toString() {
        return "String:"+this.string;
    }
}
module.exports = {
    LiteralString:LiteralString
};
