/**
 * Test Comments in the grammar
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
}
const semanticMatchTest = (str, semanticType) => {
    const typeMatch = g.match(str, semanticType);
    assert.isTrue(typeMatch.succeeded());
}
const matchAndsemanticMatchTest = (str, semanticType) => {
    matchTest(str);
    const typeMatch = g.match(str, semanticType);
    assert.isTrue(typeMatch.succeeded());
}
const semanticMatchFailTest = (str, semanticType) => {
    const typeMatch = g.match(str, semanticType);
    assert.isFalse(typeMatch.succeeded());
}
String.prototype.unCapitalize = function() {
    return this.charAt(0).toLowerCase() + this.slice(1);
}

describe("Comment Grammar Tests", () => {
    describe("Basic", () => {
        it("Can parse a basic comment", () => {
            let str = "-- this is a comment";
            semanticMatchTest(str, "comment");
        });
        it("Can parse a comment with special characters", () => {
            let str = "-- !@#$%^&%& -- -^^@%#";
            semanticMatchTest(str, "comment");
        });
        it("Can parse an empty comment", () => {
            let str = "--";
            semanticMatchTest(str, "comment");
        });
    });
    describe("Full line comments", () => {
        it("Can parse a single line comment", () => {
            let str = "-- this is a comment that takes up a whole line\n";
            semanticMatchTest(str, "StatementLine");
        });
        it("Can match a block of comment lines", () => {
            let str = [
                '-- this is the first line of the comment block',
                '-- this is the second line of the comment block',
                '--this is the last line of the -- comment block\n'
            ].join("\n");
            semanticMatchTest(str, "CommentLines");
        });
    });
    describe("Inline comments", () => {
        it("Can handle a comment that comes after a command (parses Statement)", () => {
            let str = "put 5 into myVar -- the variable we will use";
            semanticMatchTest(str, "Statement");
        });
    });

    describe("Comprehensive Tests", () => {
        it("Can handle comments between message handlers", () => {
            let str = [
                'on myMessageOne',
                '\tdoSomething',
                'end myMessageOne',
                '\n',
                '-- This is a block of comment',
                '-- between handlers#$%$',
                '\n',
                'on doSomething',
                'answer "hello"',
                'end doSomething'
            ].join('\n');
            matchTest(str, 'Script');
        });

        it("Can handle comments at the inside top of a handler", () => {
            let str = [
                'on myCustomHandler foo1, foo2',
                '-- this is a comment that documents the',
                '-- handler @#$$&^',
                'doSomethingElse',
                'end myCustomHandler'
            ].join("\n");
            semanticMatchTest(str, 'MessageHandler');
        });
    });
});
