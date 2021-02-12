/** Test grammar of the new 'tell' command **/
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

describe('#tell command tests', () => {
    describe("Simple ObjectSpecifiers", () => {
        it("Can tell this card to perform some arbitrary command with args", () => {
            let str = `tell this card to myCustomCommand 3, "hello", -0.5`;
            semanticMatchTest(str, 'Command_tellCommand');
        });
        it("Can tell a nested specifier to perform an arbitrary command", () => {
            let str = `tell second button of card 5 of stack "myStack" to myCustomCommand 3, "hello", -0.3`;
            semanticMatchTest(str, 'Command_tellCommand');
        });
    });
});
