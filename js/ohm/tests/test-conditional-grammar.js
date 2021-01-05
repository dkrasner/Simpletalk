/**
 * Conditional Grammar Tests
 * Conditional is a rule and series of sub-
 * rules describing a specific arrangement of
 * expressions which, when evaluated, result in
 * a boolean value.
 * We additionally include here Comparison rules,
 * which are used in the construction of Conditional.
 */
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


describe("Basic Literal Conditional Tests", () => {
    describe("Equality via = sign", () => {
        it("Can deal with Integer literals", () => {
            let str = `2 = 4`;
            semanticMatchTest(str, "EqualityConditional");
            semanticMatchTest(str, "Conditional");
        });
        it("Can deal with Float literals", () => {
            let str = `0.1409 = 22.4`;
            semanticMatchTest(str, "EqualityConditional");
            semanticMatchTest(str, "Conditional");
        });
        it("Can deal with String literals", () => {
            let str = `"this is the first string" = "this is the second string"`;
            semanticMatchTest(str, "EqualityConditional");
            semanticMatchTest(str, "Conditional");
        });
    });
    describe("Equality via 'is'", () => {
        it("Can deal with Integer literals", () => {
            let str = `2 is 4`;
            semanticMatchTest(str, "EqualityConditional");
            semanticMatchTest(str, "Conditional");
        });
        it("Can deal with Float literals", () => {
            let str = `0.44 is -2.3`;
            semanticMatchTest(str, "EqualityConditional");
            semanticMatchTest(str, "Conditional");
        });
        it("Can deal with String literals", () => {
            let str = `"string one" is "string two"`;
            semanticMatchTest(str, "EqualityConditional");
            semanticMatchTest(str, "Conditional");
        });
    });
    describe("Non-equality via '!='", () => {
        it("Can deal with Integer literals", () => {
            let str = `2 != 3`;
            semanticMatchTest(str, "NonEqualityConditional");
            semanticMatchTest(str, "Conditional");
        });
        it("Can deal with Float literals", () => {
            let str = `-0.1 != -0.1`;
            semanticMatchTest(str, "NonEqualityConditional");
            semanticMatchTest(str, "Conditional");
        });
        it("Can deal with String literals", () => {
            let str = `"this is first" != "this is second"`;
            semanticMatchTest(str, "NonEqualityConditional");
            semanticMatchTest(str, "Conditional");
        });
    });
    describe("Non-equality via 'is not'", () => {
        // Note that this is an EqualityConditional
        // because '"not" Expression' is a valid Factor already,
        // so it fits the 'Expression "is" Expression' rule
        it("Can deal with Integer literals", () => {
            let str = `2 is not 3`;
            semanticMatchTest(str, "EqualityConditional");
            semanticMatchTest(str, "Conditional");
        });
        it("Can deal with Float literals", () => {
            let str = `0.1 is not -223.5`;
            semanticMatchTest(str, "EqualityConditional");
            semanticMatchTest(str, "Conditional");
        });
        it("Can deal with String literals", () => {
            let str = `"this is first" is not "this is second"`;
            semanticMatchTest(str, "EqualityConditional");
            semanticMatchTest(str, "Conditional");
        });
    });
    describe("Kind Equality via 'is a'", () => {
        it.skip("Add Kind Equality Tests and more");
    });
});
