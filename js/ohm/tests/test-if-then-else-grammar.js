/**
 * If Then Else Grammar Tests
 * -------------------------------
 * Tests for basic non-loop control flow
 * grammar.
 * SimpleTalk takes the HyperTalk pattern of having three variants:
 * 1. A single-line `if <condition> then <command>`
 * 2. A multiline:
 *     `if <condition>
 *      then <command>`
 * 3. A multine, with an `else`:
 *     `if <condition>
 *      then <command>
 *      else <command>`
 *
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


describe("Basic IfThenInline", () => {
    it("Can handle basic comparison", () => {
        let str = `if 2 = 2 then go to next card`;
        semanticMatchTest(str, "IfThenInline");
    });
    it("Can handle comparison with variable", () => {
        let str = `if myVariable is 34 then put 25 into myVariable`;
        semanticMatchTest(str, "IfThenInline");
    });
    it("Can handle a literal true", () => {
        let str = `if true then go to next card`;
        semanticMatchTest(str, "IfThenInline");
    });
    it("Can handle a literal false", () => {
        let str = `if false then go to next card`;
        semanticMatchTest(str, "IfThenInline");
    });
    it("Can handle a literal true comparison", () => {
        let str = `if myVariable is true then go to next card`;
        semanticMatchTest(str, "IfThenInline");
    });
    it("Can handle a literal false comparison", () => {
        let str = `if myVariable is false then go to next card`;
        semanticMatchTest(str, "IfThenInline");
    });
    it("Can handle implicit true", () => {
        let str = `if myVariable then go to next card`;
        semanticMatchTest(str, "IfThenInline");
    });
    it("Can handle implicit false", () => {
        let str = `if not myVariable then go to next card`;
        semanticMatchTest(str, "IfThenInline");
    });
});

describe("Basic IfThenMultiline", () => {
    describe("Without 'else'", () => {
        it("Can handle basic comparison", () => {
            let str = [
                'if 2 = 2',
                'then go to next card'
            ].join('\n');
            semanticMatchTest(str, "IfThenMultiline");
        });
        it("Can handle comparison with a variable", () => {
            let str = [
                'if myVariable is 34',
                'then put 35 into myVariable'
            ].join('\n');
            semanticMatchTest(str, "IfThenMultiline");
        });
        it("Can handle a literal true", () => {
            let str = [
                'if true',
                'then go to next card'
            ].join('\n');
            semanticMatchTest(str, "IfThenMultiline");
        });
        it("Can handle a literal true comparison", () => {
            let str = [
                'if myVariable is true',
                'then go to next card'
            ].join("\n");
            semanticMatchTest(str, "IfThenMultiline");
        });
        it("Can handle literal true with not", () => {
            let str = [
                'if not true',
                'then go to next card'
            ].join("\n");
            semanticMatchTest(str, "IfThenMultiline");
        });
        it("Can handle a literal false", () => {
            let str = [
                'if false',
                'then go to next card'
            ].join("\n");
            semanticMatchTest(str, "IfThenMultiline");
        });
        it("Can handle a literal false comparison", () => {
            let str = [
                'if myVariable is false',
                'then go to next card'
            ].join('\n');
            semanticMatchTest(str, "IfThenMultiline");
        });
        it("Can handle a literal false with not", () => {
            let str = [
                'if not false',
                'then go to next card'
            ].join("\n");
            semanticMatchTest(str, "IfThenMultiline");
        });
    });
});
