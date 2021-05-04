import chai from 'chai';
import ohm from 'ohm-js';
const assert = chai.assert;
const expect = chai.expect;

import interpreterSemantics from '../../ohm/interpreter-semantics.js';

let testLanguageGrammar = ohm.grammar(window.grammar);

describe("Arithmetic Interpreter Tests", () => {
    let semantics;
    before(() => {
        semantics = testLanguageGrammar.createSemantics();
        semantics.addOperation(
            'interpret',
            interpreterSemantics(null, window.System)
        );
    });

    it("Can add", () => {
        let input = "5 + 5";
        let expected = "10";
        let matchObject = testLanguageGrammar.match(input, "Expression");
        assert.isTrue(matchObject.succeeded());
        let result = semantics(matchObject).interpret();
        assert.equal(expected, result);
    });
    it("Can add with parantheses", () => {
        let input = "(5 + 5)";
        let expected = "10";
        let matchObject = testLanguageGrammar.match(input, "Expression");
        assert.isTrue(matchObject.succeeded());
        let result = semantics(matchObject).interpret();
        assert.equal(expected, result);
    });
    it("Can subtract", () => {
        let input = "5 - 5";
        let expected = "0";
        let matchObject = testLanguageGrammar.match(input, "Expression");
        assert.isTrue(matchObject.succeeded());
        let result = semantics(matchObject).interpret();
        assert.equal(expected, result);
    });
    it("Can subtract with parantheses", () => {
        let input = "(5 - 5)";
        let expected = "0";
        let matchObject = testLanguageGrammar.match(input, "Expression");
        assert.isTrue(matchObject.succeeded());
        let result = semantics(matchObject).interpret();
        assert.equal(expected, result);
    });
    it("Can divide", () => {
        let input = "6 / 5";
        let expected = "1.2";
        let matchObject = testLanguageGrammar.match(input, "Expression");
        assert.isTrue(matchObject.succeeded());
        let result = semantics(matchObject).interpret();
        assert.equal(expected, result);
    });
    it("Can divide with parantheses", () => {
        let input = "(6 / 5)";
        let expected = "1.2";
        let matchObject = testLanguageGrammar.match(input, "Expression");
        assert.isTrue(matchObject.succeeded());
        let result = semantics(matchObject).interpret();
        assert.equal(expected, result);
    });
    it("Can modulo divide", () => {
        let input = "5 % 5";
        let expected = "0";
        let matchObject = testLanguageGrammar.match(input, "Expression");
        assert.isTrue(matchObject.succeeded());
        let result = semantics(matchObject).interpret();
        assert.equal(expected, result);
    });
    it("Can modulo divide with parantheses", () => {
        let input = "(5 % 5)";
        let expected = "0";
        let matchObject = testLanguageGrammar.match(input, "Expression");
        assert.isTrue(matchObject.succeeded());
        let result = semantics(matchObject).interpret();
        assert.equal(expected, result);
    });
    it("Error add without numerals", () => {
        let input = "5 + \"a\"";
        let matchObject = testLanguageGrammar.match(input, "Expression");
        assert.isTrue(matchObject.succeeded());
        expect(function(){
            semantics(matchObject).interpret();
        }).to.throw();
    });
    it("Error add with parantheses without numerals", () => {
        let input = "(5 + \"a\")";
        let matchObject = testLanguageGrammar.match(input, "Expression");
        assert.isTrue(matchObject.succeeded());
        expect(function(){
            semantics(matchObject).interpret();
        }).to.throw();
    });
    it("Error subtract without numerals", () => {
        let input = "5 - \"a\"";
        let matchObject = testLanguageGrammar.match(input, "Expression");
        assert.isTrue(matchObject.succeeded());
        expect(function(){
            semantics(matchObject).interpret();
        }).to.throw();
    });
    it("Error subtract with parantheses without numerals", () => {
        let input = "(5 - \"a\")";
        let matchObject = testLanguageGrammar.match(input, "Expression");
        assert.isTrue(matchObject.succeeded());
        expect(function(){
            semantics(matchObject).interpret();
        }).to.throw();
    });
    it("Error divide without numerals", () => {
        let input = "6 / \"a\"";
        let matchObject = testLanguageGrammar.match(input, "Expression");
        assert.isTrue(matchObject.succeeded());
        expect(function(){
            semantics(matchObject).interpret();
        }).to.throw();
    });
    it("Error divide with parantheses without numerals", () => {
        let input = "(6 / \"a\")";
        let matchObject = testLanguageGrammar.match(input, "Expression");
        assert.isTrue(matchObject.succeeded());
        expect(function(){
            semantics(matchObject).interpret();
        }).to.throw();
    });
    it("Error modulo divide without numerals", () => {
        let input = "5 % \"a\"";
        let matchObject = testLanguageGrammar.match(input, "Expression");
        assert.isTrue(matchObject.succeeded());
        expect(function(){
            semantics(matchObject).interpret();
        }).to.throw();
    });
    it("Error modulo divide with parantheses without numerals", () => {
        let input = "(5 % \"a\")";
        let matchObject = testLanguageGrammar.match(input, "Expression");
        assert.isTrue(matchObject.succeeded());
        expect(function(){
            semantics(matchObject).interpret();
        }).to.throw();
    });
    it("Error add strings", () => {
        let input = "\"a\" + \"a\"";
        let matchObject = testLanguageGrammar.match(input, "Expression");
        assert.isTrue(matchObject.succeeded());
        expect(function(){
            semantics(matchObject).interpret();
        }).to.throw();
    });
});
