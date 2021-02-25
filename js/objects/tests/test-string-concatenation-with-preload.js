import chai from 'chai';
import ohm from 'ohm-js';
const assert = chai.assert;
const expect = chai.expect;

import interpreterSemantics from '../../ohm/interpreter-semantics.js';

let testLanguageGrammar = ohm.grammar(window.grammar);

describe("String Concatenation Interpreter Tests", () => {
    let semantics;
    before(() => {
        semantics = testLanguageGrammar.createSemantics();
        semantics.addOperation(
            'interpret',
            interpreterSemantics(null, window.System)
        );
    });

    it("Can concatenate two string literals", () => {
        let input = `"Hello, " & "world!"`;
        let expected = "Hello, world!";
        let matchObject = testLanguageGrammar.match(input, "Expression");
        assert.isTrue(matchObject.succeeded());
        let result = semantics(matchObject).interpret();
        assert.equal(expected, result);
    });

    it("Can concatenate an integer literal and a string literal", () => {
        let input = `-2 & " times!"`;
        let expected = "-2 times!";
        let matchObject = testLanguageGrammar.match(input, "Expression");
        assert.isTrue(matchObject.succeeded());
        let result = semantics(matchObject).interpret();
        assert.equal(expected, result);
    });

    it("Can concatenate two integer literals", () => {
        let input = `-2 & 3`;
        let expected = "-23";
        let matchObject = testLanguageGrammar.match(input, "Expression");
        assert.isTrue(matchObject.succeeded());
        let result = semantics(matchObject).interpret();
        assert.equal(expected, result);
    });

    it("Can concatenate an expression and a string literal", () => {
        let input = `"Value is: " & (-1 * (5 + 2.01))`;
        let expected = "Value is: -7.01";
        let matchObject = testLanguageGrammar.match(input, "Expression");
        assert.isTrue(matchObject.succeeded());
        let result = semantics(matchObject).interpret();
        assert.equal(expected, result);
    });

    it("Can concatenate a complex example (4 items)", () => {
        let input = `"Hello, you have " & -2 & " items available and " & (2 + (3 * 4)) & " points!"`;
        let expected = "Hello, you have -2 items available and 14 points!";
        let matchObject = testLanguageGrammar.match(input, "Expression");
        assert.isTrue(matchObject.succeeded());
        let result = semantics(matchObject).interpret();
        assert.equal(expected, result);
    });
});
