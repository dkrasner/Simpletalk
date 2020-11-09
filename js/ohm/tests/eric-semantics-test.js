const chai = require('chai');
const assert = chai.assert;
const ohm = require("ohm-js");
const fs = require("fs");
const path = require("path");

const grammar = ohm.grammar(fs.readFileSync(path.resolve(__dirname, "../simpletalk.ohm")));
//const semantics = require(path.resolve(__dirname, "../semantics.js"));
import semantics from "../semantics.js";
const languageSemantics = grammar.createSemantics().addOperation('parse', semantics);

describe("Integer Literal Semantics", () => {
    it("Can parse a basic unsigned integer", () => {
        let match = grammar.match("22", "integerLiteral");
        assert.isTrue(match.succeeded());
        let result = languageSemantics(match).parse();
        assert.equal(result, 22);
    });
    it("Can parse a basic negative integer", () => {
        let match = grammar.match("-101123", "integerLiteral");
        assert.isTrue(match.succeeded());
        let result = languageSemantics(match).parse();
        assert.equal(result, -101123);
    });
});

describe("Float Literal Semantics", () => {
    it("Can parse a basic unsigned float", () => {
        let match = grammar.match("22.032", "floatLiteral");
        assert.isTrue(match.succeeded());
        let result = languageSemantics(match).parse();
        assert.equal(result, 22.032);
    });
    it("Can parse a basic negative float", () => {
        let match = grammar.match("-00.0003", "floatLiteral");
        assert.isTrue(match.succeeded());
        let result = languageSemantics(match).parse();
        assert.equal(result, -0.0003);
    });
});

describe("Any Literal Semantics", () => {
    it("Can parse a float from anyLiteral", () => {
        let match = grammar.match("-0.3", "anyLiteral");
        assert.isTrue(match.succeeded());
        let result = languageSemantics(match).parse();
        assert.equal(result, -0.3);
    });
    it("Can parse a string from anyLiteral", () => {
        let match = grammar.match(`"this is a test"`, "anyLiteral");
        assert.isTrue(match.succeeded());
        let result = languageSemantics(match).parse();
        assert.equal(result, "this is a test");
    });
});

describe("Variable Naming Semantics", () => {
    it("Can parse a basic name of a given variable", () => {
        let match = grammar.match("myCustomVariable", "variableName");
        assert.isTrue(match.succeeded());
        let result = languageSemantics(match).parse();
        assert.equal(result.name, "myCustomVariable");
    });
    it("Can identify variable as a variable object", () => {
        let match = grammar.match("myCustomVariable", "variableName");
        let result = languageSemantics(match).parse();
        assert.isTrue(result.isVariable);
    });
});
