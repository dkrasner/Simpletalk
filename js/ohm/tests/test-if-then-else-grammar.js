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
    it("Is recognized as a Statement", () => {
        let str = "if myVariable then go to next card";
        semanticMatchTest(str, "Statement");
    });
});

describe("Basic IfThenSingleline", () => {
    describe("Without 'else'", () => {
        it("Can handle basic comparison", () => {
            let str = [
                'if 2 = 2',
                'then go to next card'
            ].join('\n');
            semanticMatchTest(str, "IfThenSingleline");
        });
        it("Can handle comparison with a variable", () => {
            let str = [
                'if myVariable is 34',
                'then put 35 into myVariable'
            ].join('\n');
            semanticMatchTest(str, "IfThenSingleline");
        });
        it("Can handle a literal true", () => {
            let str = [
                'if true',
                'then go to next card'
            ].join('\n');
            semanticMatchTest(str, "IfThenSingleline");
        });
        it("Can handle a literal true comparison", () => {
            let str = [
                'if myVariable is true',
                'then go to next card'
            ].join("\n");
            semanticMatchTest(str, "IfThenSingleline");
        });
        it("Can handle literal true with not", () => {
            let str = [
                'if not true',
                'then go to next card'
            ].join("\n");
            semanticMatchTest(str, "IfThenSingleline");
        });
        it("Can handle a literal false", () => {
            let str = [
                'if false',
                'then go to next card'
            ].join("\n");
            semanticMatchTest(str, "IfThenSingleline");
        });
        it("Can handle a literal false comparison", () => {
            let str = [
                'if myVariable is false',
                'then go to next card'
            ].join('\n');
            semanticMatchTest(str, "IfThenSingleline");
        });
        it("Can handle a literal false with not", () => {
            let str = [
                'if not false',
                'then go to next card'
            ].join("\n");
            semanticMatchTest(str, "IfThenSingleline");
        });
        it("Is recognized as a Statement", () => {
            let str = [
                'if myVariable',
                'then go to next card'
            ].join("\n");
            semanticMatchTest(str, "Statement");
        });
    });
    describe("With 'else'", () => {
        it("Can handle basic comparison", () => {
            let str = [
                'if 2 = 2',
                'then go to next card',
                'else put 5 into myVariable'
            ].join("\n");
            semanticMatchTest(str, "IfThenSingleline");
        });
        it("Can handle comparison with variable", () => {
            let str = [
                'if myVariable > 35',
                'then put 35 into myVariable',
                'else put 1 into myVariable'
            ].join("\n");
            semanticMatchTest(str, "IfThenSingleline");
        });
        it("Can handle a literal true", () => {
            let str = [
                'if true',
                'then go to next card',
                'else put false into myResult'
            ].join("\n");
            semanticMatchTest(str, "IfThenSingleline");
        });
        it("Can handle a literal true with comparison", () => {
            let str = [
                'if myVariable is true',
                'then go to next card',
                'else go to previous card'
            ].join("\n");
            semanticMatchTest(str, "IfThenSingleline");
        });
        it("Can handle literal true with not", () => {
            let str = [
                'if not true',
                'then go to previous card',
                'else go to next card'
            ].join("\n");
            semanticMatchTest(str, "IfThenSingleline");
        });
        it("Can handle literal false", () => {
            let str = [
                'if false',
                'then go to previous card',
                'else go to next card'
            ].join("\n");
            semanticMatchTest(str, "IfThenSingleline");
        });
        it("Can handle a literal false with comparison", () => {
            let str = [
                'if myVariable is false',
                'then go to previous card',
                'else go to next card'
            ].join("\n");
            semanticMatchTest(str, "IfThenSingleline");
        });
        it("Can handle literal false with not", () => {
            let str = [
                'if not false',
                'then go to previous card',
                'else put "hello" into myString'
            ].join("\n");
            semanticMatchTest(str, "IfThenSingleline");
        });
        it("Is recognized as a Statement", () => {
            let str = [
                'if myVariable',
                'then go to next card',
                'else go to previous card'
            ].join("\n");
            semanticMatchTest(str, "Statement");
        });
    });
});

describe("Basic IfThenMultiline", () => {
    describe("Without else", () => {
        it('Can handle basic comparison', () => {
            let str = [
                'if 2 = 2',
                'then',
                'doSomething',
                'go to next card',
                'answer "You navigated"',
                'end if'
            ].join('\n');
            semanticMatchTest(str, "IfThenMultiline");
        });
        it('Can handle comparison with a variable', () => {
            let str = [
                'if 2 = myVariable',
                'then',
                'doSomething',
                'go to next card',
                'answer "You navigated"',
                'end if'
            ].join('\n');
            semanticMatchTest(str, "IfThenMultiline");
        });
        it('Can handle a literal true', () => {
            let str = [
                'if true',
                'then',
                'doSomething',
                'go to next card',
                'answer "You navigated"',
                'end if'
            ].join('\n');
            semanticMatchTest(str, "IfThenMultiline");
        });
        it('Can handle a literal true comparison', () => {
            let str = [
                'if myVariable is true',
                'then',
                'doSomething',
                'go to next card',
                'answer "You navigated"',
                'end if'
            ].join('\n');
            semanticMatchTest(str, "IfThenMultiline");
        });
        it('Can handle a literal true with not', () => {
            let str = [
                'if not true',
                'then',
                'doSomething',
                'go to next card',
                'answer "You navigated"',
                'end if'
            ].join('\n');
            semanticMatchTest(str, "IfThenMultiline");
        });
        it('Can handle literal false', () => {
            let str = [
                'if false',
                'then',
                'doSomething',
                'go to next card',
                'answer "You navigated"',
                'end if'
            ].join('\n');
            semanticMatchTest(str, "IfThenMultiline");
        });
        it('Can handle a literal false with comparison', () => {
            let str = [
                'if myVariable is false',
                'then',
                'doSomething',
                'go to next card',
                'answer "You navigated"',
                'end if'
            ].join('\n');
            semanticMatchTest(str, "IfThenMultiline");
        });
        it('Can handle literal false with not', () => {
            let str = [
                'if not false',
                'then',
                'doSomething',
                'go to next card',
                'answer "You navigated"',
                'end if'
            ].join('\n');
            semanticMatchTest(str, "IfThenMultiline");
        });
        it('Is recognized as a Statement', () => {
            let str = [
                'if true',
                'then',
                'doSomething',
                'go to next card',
                'answer "You navigated"',
                'end if'
            ].join('\n');
            semanticMatchTest(str, "Statement");
        });
    });
    describe('With else', () => {
        it('Can handle basic comparison', () => {
            let str = [
                'if 2 = 2',
                'then',
                'doSomething',
                'go to next card',
                'answer "You navigated"',
                'else',
                'doSomeOtherThing',
                'go to previous card',
                'end if'
            ].join('\n');
            semanticMatchTest(str, "IfThenMultiline");
        });
        it('Can handle comparison with a variable', () => {
            let str = [
                'if myVariable is 2',
                'then',
                'doSomething',
                'go to next card',
                'answer "You navigated"',
                'else',
                'doSomeOtherThing',
                'go to previous card',
                'end if'
            ].join('\n');
            semanticMatchTest(str, "IfThenMultiline");
        });
        it('Can handle a literal true', () => {
            let str = [
                'if true',
                'then',
                'doSomething',
                'go to next card',
                'answer "You navigated"',
                'else',
                'doSomeOtherThing',
                'go to previous card',
                'end if'
            ].join('\n');
            semanticMatchTest(str, "IfThenMultiline");
        });
        it('Can handle a literal true comparison', () => {
            let str = [
                'if myVariable is true',
                'then',
                'doSomething',
                'go to next card',
                'answer "You navigated"',
                'else',
                'doSomeOtherThing',
                'go to previous card',
                'end if'
            ].join('\n');
            semanticMatchTest(str, "IfThenMultiline");
        });
        it('Can handle a literal true with not', () => {
            let str = [
                'if not true',
                'then',
                'doSomething',
                'go to next card',
                'answer "You navigated"',
                'else',
                'doSomeOtherThing',
                'go to previous card',
                'end if'
            ].join('\n');
            semanticMatchTest(str, "IfThenMultiline");
        });
        it('Can handle a literal false', () => {
            let str = [
                'if false',
                'then',
                'doSomething',
                'go to next card',
                'answer "You navigated"',
                'else',
                'doSomeOtherThing',
                'go to previous card',
                'end if'
            ].join('\n');
            semanticMatchTest(str, "IfThenMultiline");
        });
        it('Can handle a literal false comparison', () => {
            let str = [
                'if myVariable is false',
                'then',
                'doSomething',
                'go to next card',
                'answer "You navigated"',
                'else',
                'doSomeOtherThing',
                'go to previous card',
                'end if'
            ].join('\n');
            semanticMatchTest(str, "IfThenMultiline");
        });
        it('Can handle a literal false with not', () => {
            let str = [
                'if not false',
                'then',
                'doSomething',
                'go to next card',
                'answer "You navigated"',
                'else',
                'doSomeOtherThing',
                'go to previous card',
                'end if'
            ].join('\n');
            semanticMatchTest(str, "IfThenMultiline");
        });
        it('Is recognized as a Statement', () => {
            let str = [
                'if true',
                'then',
                'doSomething',
                'go to next card',
                'answer "You navigated"',
                'else',
                'doSomeOtherThing',
                'go to previous card',
                'end if'
            ].join('\n');
            semanticMatchTest(str, "Statement");
        });
    });
});
