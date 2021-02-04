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

const partTypes = [
    "card",
    "background",
    "container",
    "button",
    "field",
    "stack",
    "window",
    "toolbox",
    "drawing",
    "svg"
];

describe("Terminal Specifier Tests", () => {
    it("thisSystemObject", () => {
        partTypes.forEach(partName => {
            let str = `this ${partName}`;
            semanticMatchTest(str, "TerminalSpecifier");
        });
    });
    it('currentSystemObject (card, background,  and stack only)', () => {
        let valid = ['card', 'stack', 'background'];
        let invalid = partTypes.filter(partName => {
            return !valid.includes(partName);
        });
        valid.forEach(validPart => {
            var str = `current ${validPart}`;
            semanticMatchTest(str, "TerminalSpecifier");
        });
        invalid.forEach(invalidPart => {
            var str = `current ${invalidPart}`;
            semanticMatchFailTest(str, "TerminalSpecifier");
        });
    });
});

describe("Partial Specifier Tests", () => {
    describe("Part by id tests", () => {
        it("Can parse a part by an integer literal id", () => {
            
        });
    });
});
