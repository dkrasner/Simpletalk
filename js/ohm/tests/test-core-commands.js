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
const matchAndsemanticMatchTest = (str, semanticType) => {
    matchTest(str);
    const typeMatch = g.match(str, semanticType);
    assert.isTrue(typeMatch.succeeded());
};
const semanticMatchFailTest = (str, semanticType) => {
    const typeMatch = g.match(str, semanticType);
    assert.isFalse(typeMatch.succeeded());
};
String.prototype.unCapitalize = function() {
    return this.charAt(0).toLowerCase() + this.slice(1);
};

const objects = [
    "card", "area", "field", "button", "stack", "window",
    "drawing", "audio", "image"
];

describe("Core commands", () => {
    describe("Go To", () => {
        it ("go to direction with no object fails", () => {
            const direction = ["next", "previous"];
            direction.forEach((d) => {
                const s = `go to ${d}`;
                semanticMatchFailTest(s, "Command");
            });
        });
        it ("go to with object", () => {
            const direction = ["next", "previous"];
            direction.forEach((d) => {
                const s = `go to ${d} card`;
                semanticMatchTest(s, "Command");
                semanticMatchTest(s, "Command_goToDirection");
                semanticMatchTest(s, "Statement");
            });
        });
        it ("go to by index", () => {
            const s = "go to card 2";
            semanticMatchTest(s, "Command");
            semanticMatchTest(s, "Command_goToByObjectSpecifier");
            semanticMatchTest(s, "Statement");
        });
        it ("go to by id", () => {
            const s = "go to stack id 2";
            semanticMatchTest(s, "Command");
            semanticMatchTest(s, "Command_goToByObjectSpecifier");
            semanticMatchTest(s, "Statement");
        });
        it ("go to by name", () => {
            const s = 'go to stack "cool stack"';
            semanticMatchTest(s, "Command");
            semanticMatchTest(s, "Command_goToByObjectSpecifier");
            semanticMatchTest(s, "Statement");
        });
        it ("go to website", () => {
            const s = 'go to website "http//coolsite.awesome"';
            semanticMatchTest(s, "Command");
            semanticMatchTest(s, "Command_goToWebsite");
            semanticMatchTest(s, "Statement");
        });
        it ("Bad go to: invalid object", () => {
            const s = "go to card";
            semanticMatchFailTest(s, "Command");
        });
        it ("Bad go to: invalid structure", () => {
            const s = "go to next card 42";
            semanticMatchFailTest(s, "Command");
        });
    });
    describe("Delete", () => {
        it ("Basic Remove Model (no id)", () => {
            const direction = ["stack", "background", "card", "button"];
            direction.forEach((d) => {
                const s = `delete this ${d}`;
                semanticMatchTest(s, "Command");
                semanticMatchTest(s, "Command_deleteModel");
                semanticMatchTest(s, "Statement");
            });
        });
        it ("Basic Remove model (with id)", () => {
            const direction = ["stack", "background", "card", "button"];
            direction.forEach((d) => {
                const s = `delete ${d} 20`;
                semanticMatchTest(s, "Command");
                semanticMatchTest(s, "Command_deleteModel");
                semanticMatchTest(s, "Statement");
            });
        });
        it ("Remove property with object specifier", () => {
            const s = `delete property "MyProp" from this button`;
            semanticMatchTest(s, "Command");
            semanticMatchTest(s, "Command_deleteProperty");
            semanticMatchTest(s, "Statement");
        });
        it ("Remove property without object specifier", () => {
            const s = `delete property "MyProp"`;
            semanticMatchTest(s, "Command");
            semanticMatchTest(s, "Command_deleteProperty");
            semanticMatchTest(s, "Statement");
        });
        it.skip ("Bad delete (world)", () => {
            const s = "delete this world";
            semanticMatchFailTest(s, "Command_deleteModel");
            semanticMatchFailTest(s, "Command");
        });
    });
    describe("Answer", () => {
        it ("simple answer", () => {
            const s = "answer \"42\"";
            semanticMatchTest(s, "Command");
            semanticMatchTest(s, "Command_answer");
            semanticMatchTest(s, "Statement");
        });
        it ("bad answer", () => {
            const s = "answer \"42\" \"42\"";
            semanticMatchFailTest(s, "Command");
        });
    });
    describe("Set", () => {
        it ("Set someProperty with id", () => {

            objects.forEach((d) => {
                const s = `set "someProperty" to "some value" in ${d} id 10`;
                semanticMatchTest(s, "Command");
                semanticMatchTest(s, "Command_setProperty");
                semanticMatchTest(s, "Statement");
            });
        });
        it ("Set someProperty (in context)", () => {
            objects.forEach((d) => {
                const s = `set "someProperty" to "some value"`;
                semanticMatchTest(s, "Command");
                semanticMatchTest(s, "Command_setProperty");
                semanticMatchTest(s, "Statement");
            });
        });
        it("Set background color in this", () => {
            objects.forEach((d) => {
                const s = `set "someProperty" to "some value" in this ${d}`;
                semanticMatchTest(s, "Command");
                semanticMatchTest(s, "Command_setProperty");
                semanticMatchTest(s, "Statement");
            });
        });
        it("Set background color in current", () => {
            let s = `set "someProperty" to "some value" in current stack`;
            semanticMatchTest(s, "Command");
            semanticMatchTest(s, "Command_setProperty");
            semanticMatchTest(s, "Statement");
            s = `set "someProperty" to "some value" in current card`;
            semanticMatchTest(s, "Command");
            semanticMatchTest(s, "Command_setProperty");
            semanticMatchTest(s, "Statement");
        });
        it("Set variable prop name to some value this", () => {
            objects.forEach((d) => {
                const s = `set aVar to "some value" in this ${d}`;
                semanticMatchTest(s, "Command");
                semanticMatchTest(s, "Command_setProperty");
                semanticMatchTest(s, "Statement");
            });
        });
        it("Set target (objectSpecifier, in context)", () => {
            objects.forEach((d) => {
                const s = `set "target" to first ${d} of current card`;
                semanticMatchTest(s, "Command");
                semanticMatchTest(s, "Command_setProperty");
                semanticMatchTest(s, "Statement");
            });
        });
        it("Set target (objectSpecifier)", () => {
            objects.forEach((d) => {
                const s = `set "target" to first button of current card in this ${d}`;
                semanticMatchTest(s, "Command");
                semanticMatchTest(s, "Command_setProperty");
                semanticMatchTest(s, "Statement");
            });
        });
    });
    describe("Arbitrary", () => {
        it ("arbitrary command", () => {
            const s = "anythinggoes";
            semanticMatchTest(s, "Command");
            semanticMatchTest(s, "Statement");
        });
    });
    it ("Bad command (arbitrary with digits)", () => {
        semanticMatchFailTest("1234arrowKe", "Command");
    });
});
