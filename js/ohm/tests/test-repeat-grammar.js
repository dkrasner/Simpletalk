/**
 * Repeat Grammar Tests
 * --------------------------------
 * Tests the grammar of looping constructs
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

describe("RepeatControlForm tests", () => {
    describe("forNumTimes", () => {
        it("Can do basic repeat of literal integer", () => {
            let str = "repeat for 5 times";
            semanticMatchTest(str, "RepeatControlForm_forNumTimes");
        });
        it("Can do basic repeat of variable (assume integer)", () => {
            let str = "repeat for myCustomNum times";
            semanticMatchTest(str, "RepeatControlForm_forNumTimes");
        });
        it("Fails when attempting to do a float literal", () => {
            let str = "repeat for 0.5 times";
            semanticMatchFailTest(str, "RepeatControlForm_forNumTimes");
        });
        it("Fails when attemting to use a string literal", () => {
            let str = `repeat for "3" times`;
            semanticMatchFailTest(str, "RepeatControlForm_forNumTimes");
        });
    });
    describe("untilCondition", () => {
        it("Can do a boolean literal", () => {
            let str = `repeat until true`;
            semanticMatchTest(str, "RepeatControlForm_untilCondition");
        });
        it("Can do a variable name as the condition", () => {
            let str = `repeat until myVariable`;
            semanticMatchTest(str, "RepeatControlForm_untilCondition");
        });
        it("Can use a conditional statement of literals", () => {
            let str = `repeat until 2 > 3`;
            semanticMatchTest(str, "RepeatControlForm_untilCondition");
        });
        it("Can use a conditional that has variable name(s)", () => {
            let str = `repeat until myVariable is 5`;
            semanticMatchTest(str, "RepeatControlForm_untilCondition");
        });
    });
    describe("whileCondition", () => {
       it("Can do a boolean literal", () => {
            let str = `repeat while true`;
            semanticMatchTest(str, "RepeatControlForm_whileCondition");
        });
        it("Can do a variable name as the condition", () => {
            let str = `repeat while myVariable`;
            semanticMatchTest(str, "RepeatControlForm_whileCondition");
        });
        it("Can use a conditional statement of literals", () => {
            let str = `repeat while 2 > 3`;
            semanticMatchTest(str, "RepeatControlForm_whileCondition");
        });
        it("Can use a conditional that has variable name(s)", () => {
            let str = `repeat while myVariable is 5`;
            semanticMatchTest(str, "RepeatControlForm_whileCondition");
        }); 
    });
    describe("withStartFinish", () => {
        it("Can use a basic variable name with literal integer range", () => {
            let str = `repeat with myNum = 0 to 100`;
            semanticMatchTest(str, "RepeatControlForm_withStartFinish");
        });
    });
    describe("forever", () => {
        it("Can understand the forever repeat", () => {
            let str = `repeat `;
            semanticMatchTest(str, "RepeatControlForm_forever");
        });
    });
});

describe("RepeatBlock tests", () => {
    it("forNumTimes", () => {
        let str = [
            "repeat for 5 times",
            "doSomething",
            "go to next card",
            "end repeat"
        ].join("\n");
        semanticMatchTest(str, "RepeatBlock");
    });
    it('untilCondition', () => {
        let str = [
            "repeat until myVariable >= 20.5",
            "doSomething myVariable",
            "go to card myVariable",
            "end repeat"
        ].join("\n");
        semanticMatchTest(str, "RepeatBlock");
    });
    it("whileCondition", () => {
        let str = [
            "repeat while myVariable >= 20.5",
            "doSomething myVariable",
            "go to card myVariable",
            "end repeat"
        ].join("\n");
        semanticMatchTest(str, "RepeatBlock");
    });
    it("withStartFinish", () => {
        let str = [
            "repeat with myNum = 0 to 6",
            "doSomething myVariable",
            "go to card myVariable",
            "end repeat"
        ].join("\n");
        semanticMatchTest(str, "RepeatBlock");
    });
    it("forever", () => {
        let str = [
            "repeat",
            "doSomething myVariable",
            "go to card myVariable",
            "end repeat"
        ].join("\n");
        semanticMatchTest(str, "RepeatBlock");
    });
});
