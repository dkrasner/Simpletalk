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

describe("Object Specifier Semantics", () => {
    describe("thisSystemObject ('this card' etc)", () => {
        let sourceString = "this card";
        it('Can parse correctly', () => {
            let match = grammar.match(sourceString, "ObjectSpecifier_thisSystemObject");
            assert.isTrue(match.succeeded());
        });
        it('Can apply semantics correctly', () => {
            let match = grammar.match(sourceString, "ObjectSpecifier_thisSystemObject");
            let result = languageSemantics(match).parse();
            assert.exists(result);
            assert.equal(result.context, 'this');
            assert.equal(result.objectType, 'card');
        });
    });
    describe("currentSystemObject ('current stack' etc)", () => {
        let sourceString = "current stack";
        it('Can parse correctly', () => {
            let match = grammar.match(sourceString, "ObjectSpecifier_currentSystemObject");
            assert.isTrue(match.succeeded());
        });
        it('Can apply semantics correctly', () => {
            let match = grammar.match(sourceString, "ObjectSpecifier_currentSystemObject");
            let result = languageSemantics(match).parse();
            assert.exists(result);
            assert.equal(result.context, 'current');
            assert.equal(result.objectType, 'stack');
        });
    });
    describe("partById ('part 22' etc)", () => {
        let sourceString = "part 22";
        it('Can parse correctly', () => {
            let match = grammar.match(sourceString, "ObjectSpecifier_partById");
            assert.isTrue(match.succeeded());
        });
        it('Can apply semantics correctly', () => {
            let match = grammar.match(sourceString, "ObjectSpecifier_partById");
            let result = languageSemantics(match).parse();
            assert.exists(result);
            assert.equal(result.objectType, 'part');
            assert.equal(result.objectId, '22');
        });
    });
    describe(`partByName ('part "thisNamedPart"' etc)`, () => {
        let sourceString = `stack "thisNamedPart"`;
        it('Can parse correctly', () => {
            let match = grammar.match(sourceString, "ObjectSpecifier_partByName");
            assert.isTrue(match.succeeded());
        });
        it('Can apply semantics correctly', () => {
            let match = grammar.match(sourceString, "ObjectSpecifier_partByName");
            let result = languageSemantics(match).parse();
            assert.exists(result);
            assert.equal(result.objectType, 'stack');
            assert.equal(result.name, "thisNamedPart");
        });
    });
});

describe("Command setProperty Semantics", () => {
    describe("Basic without inClause", () => {
        it('Can parse when setting a string literal', () => {
            let source = `set "name" to "some literal"`;
            let match = grammar.match(source, 'Command_setProperty');
            assert.isTrue(match.succeeded());
        });
        it('Can apply semantics when setting a string literal', () => {
            let source = `set "name" to "some literal"`;
            let match = grammar.match(source, "Command_setProperty");
            let result = languageSemantics(match).parse();
            assert.exists(result);
            assert.equal(
                result.args[0],
                "name"
            );
            assert.equal(
                result.args[1],
                "some literal"
            );
        });
        it('Can parse when setting to a variable name', () => {
            let source = `set "name" to myVariable`;
            let match = grammar.match(source, 'Command_setProperty');
            assert.isTrue(match.succeeded());
        });
        it('Can apply semantics when setting to variable', () => {
            let source = `set "name" to myVariable`;
            let match = grammar.match(source, "Command_setProperty");
            let result = languageSemantics(match).parse();
            assert.exists(result);
            assert.equal(
                result.args[0],
                "name"
            );
            assert.isTrue(result.args[1].isVariable);
            assert.equal(
                result.args[1].name,
                'myVariable'
            );
        });
    });
});
