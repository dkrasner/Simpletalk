/**
 * Tests for the add and add/to command(s)
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
    "drawing", "audio", "image"
];

describe("Add Model", () => {
    it ("Basic Add (no id)", () => {
        objects.forEach((d) => {
            const s = `add ${d} to current card`;
            semanticMatchTest(s, "Command");
            semanticMatchTest(s, "Command_addModelTo");
            semanticMatchTest(s, "Statement");
        });
    });
    it ("Basic Add (wth id)", () => {
        objects.forEach((d) => {
            const s = `add ${d} to card 20`;
            semanticMatchTest(s, "Command");
            semanticMatchTest(s, "Command_addModelTo");
            semanticMatchTest(s, "Statement");
        });
    });
    it ("Add to 'this'", () => {
        objects.forEach((d) => {
            const s = `add ${d} to this stack`;
            semanticMatchTest(s, "Command");
            semanticMatchTest(s, "Command_addModelTo");
            semanticMatchTest(s, "Statement");
        });
    });
    it ("Add to 'current'", () => {
        objects.forEach((d) => {
            const s = `add ${d} to current stack`;
            semanticMatchTest(s, "Command");
            semanticMatchTest(s, "Command_addModelTo");
            semanticMatchTest(s, "Statement");
        });
    });
    it ("Basic Add (with name, no id)", () => {
        objects.forEach((d) => {
            const s = `add ${d} "newPart 123" to current card`;
            semanticMatchTest(s, "Command");
            semanticMatchTest(s, "Command_addModelTo");
            semanticMatchTest(s, "Statement");
        });
    });
    it ("Basic Add (with name, wth id)", () => {
        objects.forEach((d) => {
            const s = `add ${d} "newPart 123" to card 20`;
            semanticMatchTest(s, "Command");
            semanticMatchTest(s, "Command_addModelTo");
            semanticMatchTest(s, "Statement");
        });
    });
    it ("Add named to 'this'", () => {
        objects.forEach((d) => {
            const s = `add ${d} "newPart 123" to this stack`;
            semanticMatchTest(s, "Command");
            semanticMatchTest(s, "Command_addModelTo");
            semanticMatchTest(s, "Statement");
        });
    });
    it ("Add named to 'current'", () => {
        objects.forEach((d) => {
            const s = `add ${d} "newPart123" to current stack`;
            semanticMatchTest(s, "Command");
            semanticMatchTest(s, "Command_addModelTo");
            semanticMatchTest(s, "Statement");
        });
    });
    it("Add (no target or context)", () => {
        objects.forEach((d) => {
            const s = `add ${d}`;
            semanticMatchTest(s, "Command");
            semanticMatchTest(s, "Command_addModel");
            semanticMatchFailTest(s, "Command_addModelTo");
            semanticMatchTest(s, "Statement");
        });
    });
    it("Add named without context", () => {
        objects.forEach((d) => {
            const s = `add ${d} "newPart123"`;
            semanticMatchTest(s, "Command");
            semanticMatchTest(s, "Command_addModel");
            semanticMatchTest(s, "Statement");
        });
    });
    it ("Bad add (world)", () => {
        const s = "add world to card";
        semanticMatchFailTest(s, "Command_addModel");
        semanticMatchFailTest(s, "Command_addModelTo");
        semanticMatchFailTest(s, "Command");
    });
    it ("Bad add (invalid context)", () => {
        const s = "add button to new stack";
        semanticMatchFailTest(s, "Command_addModel");
        semanticMatchFailTest(s, "Command_addModelTo");
        semanticMatchFailTest(s, "Command");
    });
});

describe("Add Property", () => {
    it("Add property with object specifier", () => {
        let s = `add property "NewProp" to current card`;
        semanticMatchTest(s, "Command");
        semanticMatchTest(s, "Command_addProperty");
        semanticMatchTest(s, "Statement");
        s = `add property "NewProp" to this button`;
        semanticMatchTest(s, "Command");
        semanticMatchTest(s, "Command_addProperty");
        semanticMatchTest(s, "Statement");
    });
    it("Add property without object specifier", () => {
        let s = `add property "NewProp"`;
        semanticMatchTest(s, "Command");
        semanticMatchTest(s, "Command_addProperty");
        semanticMatchTest(s, "Statement");
    });
});
