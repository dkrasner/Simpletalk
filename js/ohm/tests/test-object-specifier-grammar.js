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
    "button",
    "field",
    "stack",
    "window",
    "drawing",
    "image",
    "area",
    "audio",
];

const numbers = [
    "first",
    "second",
    "third",
    "fourth",
    "fifth",
    "sixth",
    "seventh",
    "eighth",
    "ninth",
    "tenth",
    "last"
];

describe("Terminal Specifier Tests", () => {
    it("thisSystemObject", () => {
        ['card', 'stack'].forEach(partName => {
            let str = `this ${partName}`;
            semanticMatchTest(str, "TerminalSpecifier");
        });
    });
    describe("Part by id tests", () => {
        it("Can parse a part by an integer literal id", () => {
            let str = `part id 24`;
            semanticMatchTest(str, 'TerminalSpecifier_partById');
        });
        it("Cannot parse a part by a float literal id", () => {
            let str = `part id 2.3`;
            semanticMatchFailTest(str, 'TerminalSpecifier_partById');
        });
        it("Can parse a part by an alphanumeric id", () => {
            let str = `part id 24ab22`;
            semanticMatchTest(str, 'TerminalSpecifier_partById');
        });
        it("Can parse a part with 'world' id", () => {
            let str = `part id world`;
            semanticMatchTest(str, 'TerminalSpecifier_partById');
        });
        it("Cannot parse a part by a basic object (stack, card etc) id", () => {
            partTypes.forEach(partName => {
                let str = `part id ${partName}`;
                semanticMatchFailTest(str, 'TerminalSpecifier_partById');
            });
        });
    });
    it('currentSystemObject (card and stack only)', () => {
        let valid = ["card", "stack"];
        let invalid = partTypes.filter(partName => {
            return !["card", "stack"].includes(partName);
        });
        let str = `current card`;
        semanticMatchTest(str, "PartialSpecifier");
        semanticMatchTest(str, "PartialSpecifier_currentCard");
        valid.forEach(partName => {
            str = `current ${partName}`;
            semanticMatchTest(str, "TerminalSpecifier");
            semanticMatchTest(str, "TerminalSpecifier_currentSystemObject");
        });
        invalid.forEach(invalidPart => {
            var str = `current ${invalidPart}`;
            semanticMatchFailTest(str, "TerminalSpecifier");
        });
    });
});

describe("Partial Specifier Tests", () => {
    describe("Part by name tests", () => {
        it("Can parse available system part refs by name", () => {
            partTypes.forEach(partName => {
                let str = `${partName} "some name"`;
                semanticMatchTest(str, 'PartialSpecifier_partByName');
            });
        });
        it("Can parse a literal part by name", () => {
            let str = `part "some part name here"`;
            semanticMatchTest(str, 'PartialSpecifier_partByName');
        });
    });
    describe("Part by index tests", () => {
        it("Can parse system parts by integer index", () => {
            partTypes.forEach(partName => {
                let str = `${partName} 22`;
                semanticMatchTest(str, 'PartialSpecifier_partByIndex');
            });
        });
        it("Can parse literal part by integer index", () => {
            let str = `part 23`;
            semanticMatchTest(str, 'PartialSpecifier_partByIndex');
        });
    });
    describe("Part by english numerical tests", () => {
        numbers.forEach(numericName => {
            it(`Can parse '${numericName}' system parts`, () => {
                partTypes.forEach(partName => {
                    let str = `${numericName} ${partName}`;
                    semanticMatchTest(str, 'PartialSpecifier_partByNumericalIndex');
                });
            });
            it(`Can parse '${numericName}' part literal`, () => {
                let str = `${numericName} part`;
                semanticMatchTest(str, 'PartialSpecifier_partByNumericalIndex');
            });
        });
    });
    describe("Part by target tests", () => {
        it("'target is a PartialSpecifier", () => {
            let str = "target";
            semanticMatchTest(str, 'PartialSpecifier_partByTarget');
        });
    });
});

describe("Queried Specifier Tests", () => {
    describe("Target tests", () => {
        it("Can parse 'target of'", () => {
            let str = "target of";
            semanticMatchTest(str, 'QueriedSpecifier_prefixed');
        });
        it("Can parse 'target of target of'", () => {
            let str = "target of target of";
            semanticMatchTest(str, 'QueriedSpecifier_nested');
        });
    });
});

describe("Compound Specifier Tests (non-terminal)", () => {
    describe('partByName of:', () => {
        it('partByName', () => {
            let str = `button "hello" of card "some card"`;
            semanticMatchTest(str, 'ObjectSpecifier_compoundQueryWithoutTerminal');
        });
        it("partByIndex", () => {
            let str = `button "hello there" of card 2`;
            semanticMatchTest(str, 'ObjectSpecifier_compoundQueryWithoutTerminal');
        });
        it("partByNumericalIndex", () => {
            let str = `button "hello there" of second card`;
            semanticMatchTest(str, 'ObjectSpecifier_compoundQueryWithoutTerminal');
        });
        it("compoundSpecifierWithoutTerminal", () => {
            let str = `button "hello" of card 3 of stack "home stack"`;
            semanticMatchTest(str, 'ObjectSpecifier_compoundQueryWithoutTerminal');
        });
        it("compoundSpecifierWithTerminal", () => {
            let str = `button "myButton" of card 5 of current stack`;
            semanticMatchTest(str, 'ObjectSpecifier_compoundQueryWithTerminal');
        });
        it("Compound with 'target of this' system object", () => {
            let str = "target of target of";
            partTypes.forEach(partName => {
                let str = `target of this ${partName}`;
                semanticMatchTest(str, 'ObjectSpecifier');
            });
        });
    });
});
