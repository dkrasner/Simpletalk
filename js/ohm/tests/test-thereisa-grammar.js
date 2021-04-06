/**
 * Tests for the 'there is a'command(s)
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
const semanticMatchFailTest = (str, semanticType) => {
    const typeMatch = g.match(str, semanticType);
    assert.isFalse(typeMatch.succeeded());
};

// Available system objects
const objects = [
    "background", "card", "area", "field", "button", "stack", "window",
    "toolbox", "drawing", "audio", "image"
];

describe("'there is a' ObjectSpecifier" , () => {
    it ("Basic (current card)", () => {
        const s = `there is a current card`;
        semanticMatchTest(s, "Conditional");
        semanticMatchTest(s, "ThereIsAnObjectConditional");
    });
    it ("Basic (wth id)", () => {
        objects.forEach((d) => {
            const s = `there is a ${d} 20`;
            semanticMatchTest(s, "Conditional");
            semanticMatchTest(s, "ThereIsAnObjectConditional");
        });
    });
    it ("By name of current stack", () => {
        objects.forEach((d) => {
            const s = `there is a ${d} "New" of current stack`;
            semanticMatchTest(s, "Conditional");
            semanticMatchTest(s, "ThereIsAnObjectConditional");
        });
    });
    it ("Basic (with name, wth id)", () => {
        objects.forEach((d) => {
            const s = `there is a ${d} "newPart 123" of card 20`;
            semanticMatchTest(s, "Conditional");
            semanticMatchTest(s, "ThereIsAnObjectConditional");
        });
    });
    it ("'Of this'", () => {
        objects.forEach((d) => {
            const s = `there is a  ${d} "newPart 123" of this stack`;
            semanticMatchTest(s, "Conditional");
            semanticMatchTest(s, "ThereIsAnObjectConditional");
        });
    });
    it ("Named of 'current'", () => {
        objects.forEach((d) => {
            const s = `there is a ${d} "newPart123" of current stack`;
            semanticMatchTest(s, "Conditional");
            semanticMatchTest(s, "ThereIsAnObjectConditional");
        });
    });
    it("no target or context (should fail)", () => {
        objects.forEach((d) => {
            const s = `there is a ${d}`;
            semanticMatchFailTest(s, "Conditional");
            semanticMatchFailTest(s, "ThereIsAnObjectConditional");
        });
    });
    it("Named without context (a)", () => {
        objects.forEach((d) => {
            const s = `there is a ${d} "newPart123"`;
            semanticMatchTest(s, "Conditional");
            semanticMatchTest(s, "ThereIsAnObjectConditional");
        });
    });
    it("Named without context (an)", () => {
        objects.forEach((d) => {
            const s = `there is an ${d} "newPart123"`;
            semanticMatchTest(s, "Conditional");
            semanticMatchTest(s, "ThereIsAnObjectConditional");
        });
    });
});
describe("'there is not a' ObjectSpecifier" , () => {
    it ("Basic (current card)", () => {
        const s = `there is not a current card`;
        semanticMatchTest(s, "Conditional");
        semanticMatchTest(s, "ThereIsNotAnObjectConditional");
    });
    it ("Basic (wth id)", () => {
        objects.forEach((d) => {
            const s = `there is not a ${d} 20`;
            semanticMatchTest(s, "Conditional");
            semanticMatchTest(s, "ThereIsNotAnObjectConditional");
        });
    });
    it("no target or context (should fail)", () => {
        objects.forEach((d) => {
            const s = `there is not a ${d}`;
            semanticMatchFailTest(s, "Conditional");
            semanticMatchFailTest(s, "ThereIsNotAnObjectConditional");
        });
    });
    it("Named without context (a)", () => {
        objects.forEach((d) => {
            const s = `there is not a ${d} "newPart123"`;
            semanticMatchTest(s, "Conditional");
            semanticMatchTest(s, "ThereIsNotAnObjectConditional");
        });
    });
    it("Named without context (an)", () => {
        objects.forEach((d) => {
            const s = `there is not an ${d} "newPart123"`;
            semanticMatchTest(s, "Conditional");
            semanticMatchTest(s, "ThereIsNotAnObjectConditional");
        });
    });
});
