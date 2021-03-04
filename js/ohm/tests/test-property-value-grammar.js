ohm = require('ohm-js');
// Instantiate the grammar.
var fs = require('fs');
var g = ohm.grammar(fs.readFileSync('./js/ohm/simpletalk.ohm'));

var chai = require('chai');
var assert = chai.assert;

const matchTest = (str) => {
    const match = g.match(str);
    assert.isTrue(match.succeeded());
};
const semanticMatchTest = (str, semanticType) => {
    const typeMatch = g.match(str, semanticType);
    assert.isTrue(typeMatch.succeeded());
};

const semanticMatchFailTest = (str, semanticType) => {
    const typeMatch = g.match(str, semanticType);
    assert.isFalse(typeMatch.succeeded());
};

describe("PropertyValue grammar tests", () => {
    it("Can parse a PropertyValue with implicit context", () => {
        let str = `the "name"`;
        semanticMatchTest(str, "PropertyValue");
        semanticMatchTest(str, "PropertyValue_withoutSpecifier");
    });
    it("Can match a PropertyValue with deep object specifier context", () => {
        let str = `the "name" of field 3 of second card of current stack`;
        semanticMatchTest(str, "PropertyValue");
        semanticMatchTest(str, "PropertyValue_withSpecifier");
    });
    it("Can parse a PropertyValue with 'this <partType>' context", () => {
        let str = `the "name" of this button`;
        semanticMatchTest(str, "PropertyValue");
        semanticMatchTest(str, "PropertyValue_withSpecifier");
    });
    it("Can parse a PropertyValue as a part of a Factored Expression", () => {
        let str = `(the "top" of this card + 5)`;
        semanticMatchTest(str, "Expression");
    });
});
