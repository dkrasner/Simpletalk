/**
 * Test of Expression and Factor in 
 * grammar parsing.
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


describe('Arithmetic', () => {
    describe('Basic addition', () => {
        it('Can parse a basic literal addition as Expression', () => {
            let str = "2 + 2";
            semanticMatchTest(str, "Expression");
            semanticMatchTest(str, "Expression_addExpr");
        });
        it('Can parse a parens addition as a Factor and Expression', () => {
            let str = "(2 + 2)";
            semanticMatchTest(str, "Factor");
            semanticMatchTest(str, "Expression");
        });
        it('Can parse a basic literal subtraction as Expression', () => {
            let str = "2 - 2";
            semanticMatchTest(str, "Expression");
            semanticMatchTest(str, "Expression_minusExpr");
        });
        it('Can parse a parens subtraction as a Factor and Expression', () => {
            let str = "(2 - 2)";
            semanticMatchTest(str, "Factor");
            semanticMatchTest(str, "Expression");
        });
        it('Can parse a basic literal division as Expression', () => {
            let str = "2 / 2";
            semanticMatchTest(str, "Expression");
            semanticMatchTest(str, "Expression_divideExpr");
        });
        it('Can parse a parens division as a Factor and Expression', () => {
            let str = "(2 / 2)";
            semanticMatchTest(str, "Factor");
            semanticMatchTest(str, "Expression");
        });
        it('Can parse a basic literal modulo division as Expression', () => {
            let str = "2 % 2";
            semanticMatchTest(str, "Expression");
            semanticMatchTest(str, "Expression_moduloDivideExpr");
        });
        it('Can parse a parens modulo division as a Factor and Expression', () => {
            let str = "(2 % 2)";
            semanticMatchTest(str, "Factor");
            semanticMatchTest(str, "Expression");
        });
    });
});

describe('Variable Names', () => {
    it('Can parse a variable name as a Factor', () => {
        let str = 'myCustomVar';
        semanticMatchTest(str, "Factor");
    });
    it('Can parse a variable name as an Expression', () => {
        let str = 'myCustomVar';
        semanticMatchTest(str, "Expression");
    });
});

describe('String Literals', () => {
    it('Can parse a string literal into a Factor', () => {
        let str = '"This is my ... / string literal"';
        semanticMatchTest(str, "Factor");
    });
    it('Can parse a string literal into an Expression', () => {
        let str = '"This is my ... / string literal"';
        semanticMatchTest(str, "Expression");
    });
    it('Can parse a string literal that looks like other expression', () => {
        let str = `"5 + 5"`;
        semanticMatchTest(str, 'stringLiteral');
    });
});

describe('Integer Literals', () => {
    it('Can parse an integer literal into a Factor', () => {
        let str = "22";
        semanticMatchTest(str, "Factor");
    });
    it('Can parse a negative integer literal into a Factor', () => {
        let str = "-111";
        semanticMatchTest(str, "Factor");
    });
    it('Can parse an integer literal into an Expression', () => {
        let str = "22";
        semanticMatchTest(str, "Expression");
    });
    it('Can parse a negative integer literal into an Expression', () => {
        let str = "-22";
        semanticMatchTest(str, "Expression");
    });
});

describe("Float Literals", () => {
    it('Can parse a float literal into a Factor', () => {
        let str = "01.2201";
        semanticMatchTest(str, "Factor");
    });
    it('Can parse a negative float literal into a Factor', () => {
        let str = "-01.2201";
        semanticMatchTest(str, "Factor");
    });
    it('Can parse a float literal into an Expression', () => {
        let str = "00.0001";
        semanticMatchTest(str, "Expression");
    });
    it('Can parse a negative float literal into an Expression', () => {
        let str = "-00.001";
        semanticMatchTest(str, "Expression");
    });
});


describe("Expression Lists (Command Args)", () => {
    it('Can parse a basic two-expression list', () => {
        let str = "1 + 2, 3 + 4";
        semanticMatchTest(str, "CommandArgumentList");
    });
    it('Can parse a parenthetical two-expression list', () => {
        let str = "(1 + 2), (3 + 1.04)";
        semanticMatchTest(str, "CommandArgumentList");
    });
    it('Can parse a float literal and string literal two-expression list', () => {
        let str = `-0.4, "hello there!"`;
        semanticMatchTest(str, "CommandArgumentList");
    });
});

describe("Factors", () => {
    it("Not factor via 'not' (basic)", () => {
        let str = `not 3`;
        semanticMatchTest(str, "Factor_notFactor");
    });
    it("Not factor via 'not' (with expression)", () => {
        let str = `not the "text" of first button`;
        semanticMatchTest(str, "Factor_notFactor");
    });
});
