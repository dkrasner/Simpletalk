/**
 * Tests dealing with user-defined commands
 * and messages
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


describe('Basic Definitions', () => {
    it('Can understand an arbitrary handler definition with no args', () => {
        let str = `on myCustomCommand\n\tanswer "hello"\nend myCustomCommand`;
        semanticMatchTest(str, 'MessageHandler');
    });
    it('Can understand an arbitrary handler definition with 1 argument', () => {
        let str = `on myCustomCommand firstArg\n\tanswer firstArg\nend myCustomCommand`;
        semanticMatchTest(str, 'MessageHandler');
    });
    it('Can understand an arbitrary handler definition with 2 arguments', () => {
        let str = `on myCustomCommand firstArg, secondArg\n\tanswer secondArg\nend myCustomCommand`;
        semanticMatchTest(str, 'MessageHandler');
    });
    it('Can understand an arbitrary handler definition with 3 arguments', () => {
        let str = `on myCustomCommand firstArg, secondArg, thirdArg\n\tanswer thirdArg\nend myCustomCommand`;
        semanticMatchTest(str, 'MessageHandler');
    });
});

describe('Basic Arbitrary Message Statments (ie used handler bodies)', () => {
    it('Can parse a simple message statement with no arguments', () => {
        let str = "myCustomCommand";
        semanticMatchTest(str, "Command");
        semanticMatchTest(str, "Command_arbitraryCommand");
    });
    it('Can parse a simple message statement with one argument (a variable)', () => {
        let str = "myCustomCommand someArgument";
        semanticMatchTest(str, "Command");
        semanticMatchTest(str, "Command_arbitraryCommand");
    });
    it('Can parse a simple message statement with two arguments (both variables)', () => {
        let str = "myCustomCommand someArgument, someOtherArgument";
        semanticMatchTest(str, "Command");
        semanticMatchTest(str, "Command_arbitraryCommand");
    });
    it('Can parse a simple message statement with three arguments (all variables)', () => {
        let str = "myCustomCommand someArg, anotherArg, aThirdArg";
        semanticMatchTest(str, "Command");
        semanticMatchTest(str, "Command_arbitraryCommand");
    });
});

describe("Arbitrary Message Statements with literal arguments", () => {
    describe('String literals', () => {
        it('with one argument', () => {
            let str = `myCustomMessage "hello"`;
            semanticMatchTest(str, "Command");
            semanticMatchTest(str, "Command_arbitraryCommand");
        });
        it('with two arguments', () => {
            let str = `myCustomMessage "hello", "world"`;
            semanticMatchTest(str, "Command");
            semanticMatchTest(str, "Command_arbitraryCommand");
        });
        it('with three arguments', () => {
            let str = `myCustomMessage "hello", "world", "Again!"`;
            semanticMatchTest(str, "Command");
            semanticMatchTest(str, "Command_arbitraryCommand");
        });
    });
    describe('Integer literals', () => {
        it('with one argument, positive', () => {
            let str = `myCustomCommand 234`;
            semanticMatchTest(str, "Command");
            semanticMatchTest(str, "Command_arbitraryCommand");
        });
        it('with one argument, negative', () => {
            let str = `myCustomCommand -1123`;
            semanticMatchTest(str, "Command");
            semanticMatchTest(str, "Command_arbitraryCommand");
        });
        it('with two arguments, positive', () => {
            let str = `myCustomCommand 1231234, 345`;
            semanticMatchTest(str, "Command");
            semanticMatchTest(str, "Command_arbitraryCommand");
        });
        it('with two arguments, negative', () => {
            let str = `myCustomCommand -12355656, -4`;
            semanticMatchTest(str, "Command");
            semanticMatchTest(str, "Command_arbitraryCommand");
        });
        it('with three arguments, positive', () => {
            let str = `myCustomCommand 9079, 1, 59`;
            semanticMatchTest(str, "Command");
            semanticMatchTest(str, "Command_arbitraryCommand");
        });
        it('with three arguments, negative', () => {
            let str = `myCustomCommand -3, -999, -234587`;
            semanticMatchTest(str, "Command");
            semanticMatchTest(str, "Command_arbitraryCommand");
        });
    });
    describe('Float literals', () => {
        it('with one argument, positive', () => {
            let str = `myCustomCommand 0.2`;
            semanticMatchTest(str, "Command");
            semanticMatchTest(str, "Command_arbitraryCommand");
        });
        it('with one argument, negative', () => {
            str = `myCustomCommand -0.034`;
            semanticMatchTest(str, "Command");
            semanticMatchTest(str, "Command_arbitraryCommand");
        });
        it('with two arguments, positive', () => {
            let str = `myCustomCommand 2435234453.2, 0.00001`;
            semanticMatchTest(str, "Command");
            semanticMatchTest(str, "Command_arbitraryCommand");
        });
        it('with two arguments, negative', () => {
            let str = `myCustomCommand -00.0001, -2342345.8`;
            semanticMatchTest(str, "Command");
            semanticMatchTest(str, "Command_arbitraryCommand");
        });
        it('with three arguments, positive', () => {
            let str = `myCustomCommand 0.4, 1111.03, 99.9`;
            semanticMatchTest(str, "Command");
            semanticMatchTest(str, "Command_arbitraryCommand");
        });
        it('with three arguments, negative', () => {
            let str = `myCustomCommand -0.4, -1111.03, -99.9`;
            semanticMatchTest(str, "Command");
            semanticMatchTest(str, "Command_arbitraryCommand");
        });
    });
});

describe('Arbitrary Message Statements with Expressions as Args', () => {
    describe('One argument statements', () => {
        it('Addition Expression', () => {
            let str = `myCustomCommand 1 + 2`;
            semanticMatchTest(str, "Command");
            semanticMatchTest(str, "Command_arbitraryCommand");
        });
        it('Long addition expression', () => {
            let str = `myCustomCommand 1 + 2 + 3 + 55 + -0.1`;
            semanticMatchTest(str, "Command");
            semanticMatchTest(str, "Command_arbitraryCommand");
        });
        it('Multiplication expression', () => {
            let str = `myCustomCommand 2 * -3.1`;
            semanticMatchTest(str, "Command");
            semanticMatchTest(str, "Command_arbitraryCommand");
        });
    });
    describe('Two argument statements', () => {
        it('Addition expressions', () => {
            let str = `myCustomCommand 1 + 2, 55 + -0.14`;
            semanticMatchTest(str, "Command");
            semanticMatchTest(str, "Command_arbitraryCommand");
        });
        it('Multiplication expressions', () => {
            let str = `myCustomCommand 12 * 100, -3.7 * 5`;
            semanticMatchTest(str, "Command");
            semanticMatchTest(str, "Command_arbitraryCommand");
        });
    });
});

describe('Example Custom Script', () => {
    let script = [
        'on myCustomMessage firstArg, secondArg, thirdArg',
        '\tanswer firstArg',
        '\tanswer secondArg',
        '\nanswer thirdArg',
        'end myCustomMessage',
        '',
        'on click',
        '\tmyCustomMessage -0.3, 2 * 9, someVariableName',
        'end click'
    ].join("\n");
    it('Can parse the example script without error', () => {
        matchTest(script);
    });
});
