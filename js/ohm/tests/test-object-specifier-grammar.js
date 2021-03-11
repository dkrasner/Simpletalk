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
    "container",
    "button",
    "field",
    "stack",
    "window",
    "toolbox",
    "drawing",
    "audio",
    "image"
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
    });
    it('currentSystemObject (card and stack only)', () => {
        let valid = ['card', 'stack'];
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
    });
});
