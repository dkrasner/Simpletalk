/**
 * String and stringLiteral
 * related grammatical tests
 **/
const ohm = require('ohm-js');
// Instantiate the grammar.
var fs = require('fs');
var g = ohm.grammar(fs.readFileSync('./js/ohm/simpletalk.ohm').toString());

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

describe("Basic stringLiteral", () => {
    it('Can deal with a single word', () => {
        const s = '"test"';
        semanticMatchTest(s, 'stringLiteral');
        semanticMatchTest(s, 'Factor');
    });
    it('Can deal with a sentence', () => {
        const s = '"this is a test"';
        semanticMatchTest(s, 'stringLiteral');
        semanticMatchTest(s, 'Factor');
    });
    it('Can deal with a url', () => {
        const s = '"http://localhost:8000/js/objects/examples/bootstrap-example.html"';
        semanticMatchTest(s, 'stringLiteral');
        semanticMatchTest(s, 'Factor');
    });
    it('Can deal with a path', () => {
        const s = '"../../examples/bootstrap-example.html"';
        semanticMatchTest(s, 'stringLiteral');
        semanticMatchTest(s, 'Factor');
    });
    it('Can deal with whitespace', () => {
        const s = '" \t   hi \t  \s  "';
        semanticMatchTest(s, 'stringLiteral');
        semanticMatchTest(s, 'Factor');
    });
    it('Can deal with characters that look like operators', () => {
        const s = `"hello ** this / is ^ a stringLiteral +"`;
        semanticMatchTest(s, 'stringLiteral');
        semanticMatchTest(s, 'Factor');
    });
    it('Does not match if newline is present', () => {
        const s = '"this is a\t\ntest"';
        semanticMatchFailTest(s, 'stringLiteral');
        semanticMatchFailTest(s, 'Factor');
    });
});

describe("Concatenation Tests", () => {
    it("Can concat two stringLiterals", () => {
        let s = `"some first string" & "some second string"`;
        semanticMatchTest(s, "Expression");
        semanticMatchTest(s, "Expression_stringConcatExpr");
    });
    it("Can concat two stringLiterals containing & symbol", () => {
        let s = `"& this is the string" & "this is another && string"`;
        semanticMatchTest(s, "Expression");
        semanticMatchTest(s, "Expression_stringConcatExpr");
    });
    it("Can concat a stringLiteral and a variableName", () => {
        let s = `"This is the first part" & someStringVar`;
        semanticMatchTest(s, "Expression");
        semanticMatchTest(s, "Expression_stringConcatExpr");
    });
    it("Can concat a variableName and a stringLiteral", () => {
        let s = `someStringVar & "This is a string"`;
        semanticMatchTest(s, "Expression");
        semanticMatchTest(s, "Expression_stringConcatExpr");
    });
    it("Can concat two variableNames", () => {
        let s = `firstStringVar & secondStringVar`;
        semanticMatchTest(s, "Expression");
        semanticMatchTest(s, "Expression_stringConcatExpr");
    });
    it("Can concat several relevant rules at once", () => {
        let s = `myStringVar & "This is a literal string" & anotherVar & "Some string with & symbol"`;
        semanticMatchTest(s, "Expression");
        semanticMatchTest(s, "Expression_stringConcatExpr");
    });
});
