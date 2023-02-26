const ohm = require('ohm-js');
// Instantiate the grammar.
var fs = require('fs');
var g = ohm.grammar(fs.readFileSync('./js/ohm/simpletalk.ohm').toString());

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
String.prototype.unCapitalize = function () {
    return this.charAt(0).toLowerCase() + this.slice(1);
};

const objects = [
    "background", "card", "area", "field", "button", "stack", "window",
    "drawing", "audio", "image"
];

describe("SimpleTalk Grammar", () => {
    describe("Basic lexical", () => {
        it("`space` does not include any newline chars", () => {
            const newlineStr = `\n`;
            const crStr = `\r`;
            semanticMatchFailTest(newlineStr, 'space');
            semanticMatchFailTest(crStr, 'space');
        });
        it("simple comment", () => {
            const s = "--mycomment";
            matchAndsemanticMatchTest(s, 'comment');
        });
        it("simple comment with spaces", () => {
            const s = "-- mycomment part2";
            matchAndsemanticMatchTest(s, 'comment');
        });
        it("positive integer", () => {
            const s = "24";
            semanticMatchTest(s, 'integerLiteral');
        });
        it("negative integer", () => {
            const s = "-24";
            semanticMatchTest(s, 'integerLiteral');
            semanticMatchTest(s, 'anyLiteral');
        });
        it("positive float", () => {
            const s = "0.002";
            semanticMatchTest(s, 'floatLiteral');
            semanticMatchTest(s, 'anyLiteral');
        });
        it("negative float", () => {
            const s = "-0.011";
            semanticMatchTest(s, 'floatLiteral');
            semanticMatchTest(s, 'anyLiteral');
        });
        it('variable name (correct)', () => {
            const s = "myCustomVariable";
            semanticMatchTest(s, 'variableName');
        });
        it('variable name (incorrect)', () => {
            const s = "my-custom-variable";
            semanticMatchFailTest(s, 'variableName');
        });
    });

    describe("Invalid overall scripts", () => {
        it("Cannot match a script with invalid handler open/close", () => {
            let script = [
                'on click',
                '\t myMessage',
                'end click',
                '\n',
                'on myMessage',
                '\tsnswer "hello"',
                'on myMessage'
            ].join('\n');
            let match = g.match(script);
            assert.isFalse(match.succeeded());
        });
        it("Fails to match on script with top-level invalid handler def", () => {
            let script = [
                'on doMyThing what',
                '\tanswer what',
                'on doMyThing',
                '\n',
                'on click',
                '\tdoMyThing "doing it"',
                'end click'
            ].join('\n');
            assert.isTrue(g.match(script).failed());
        });
    });

    // TODO add more tests for handlers, comments, end etc
    describe("Messages", () => {
        it("Message name", () => {
            const strings = [
                "f", "F", "amessage", "aMessage", "aMessage"
            ];
            strings.forEach((s) => {
                semanticMatchTest(s, 'messageName');
            });
        });
        it("Bad message name", () => {
            const strings = [
                "1", "1m", "1M", "m1", "M1", " message", "then", "on", "end"
            ];
            strings.forEach((s) => {
                semanticMatchFailTest(s, 'messageName');
            });
        });
        it("Can parse message names beginning with 'do'", () => {
            let str = "doSomething";
            semanticMatchTest(str, 'messageName');
        });
        it("Message handler (no args, no statements)", () => {
            const s = `on myMessage\nend myMessage`;
            matchAndsemanticMatchTest(s, 'MessageHandler');
        });
        it("Message handler (args, no statements)", () => {
            const s = `on myNewMessage arg1, arg2\nend myNewMessage`;
            matchAndsemanticMatchTest(s, 'MessageHandler');
        });
        it('Does not match a message that has two handlerOpens', () => {
            let invalidStr = [
                'on myMessage',
                '\tsomeOtherMessage',
                'on myMessage'
            ].join('\n');
            let match = g.match(invalidStr);
            assert.isFalse(match.succeeded());
        });
        it("Built in message syntax", () => {
            const strings = [
                "close", "closeStack", "commandKeyDown", "quit"
            ];
            strings.forEach((s) => {
                semanticMatchTest(s, 'Message');
                semanticMatchTest(s, 'Message_system');
            });
        });
        describe("Authored in message syntax", () => {
            it('Understands message with no arguments', () => {
                let str = "myNewMessage";
                semanticMatchTest(str, 'Message');
                semanticMatchTest(str, 'Message_authoredMessage');
            });
            it('Understands message with one (variableName) argument', () => {
                let str = "myNewMessage arg1";
                semanticMatchTest(str, 'Message');
                semanticMatchTest(str, 'Message_authoredMessage');
            });
            it('Understands message with two (variableName) arguments', () => {
                let str = "myNewMessage arg1, arg2";
                semanticMatchTest(str, "Message");
                semanticMatchTest(str, "Message_authoredMessage");
            });
            it('Understands message with three (variableName) arguments', () => {
                let str = "myNewMessage arg1, arg2, arg3";
                semanticMatchTest(str, 'Message');
                semanticMatchTest(str, 'Message_authoredMessage');
            });
            it('Underastands message with one (integer literal) argument', () => {
                let str = "myNewMessage 50";
                semanticMatchTest(str, 'Message');
                semanticMatchTest(str, 'Message_authoredMessage');
            });
        });
        describe("Built in system messages", () => {
            const tests = [
                {
                    strings: [
                        "closeBackground", "closeButton", "closeCard", "closeField", "closeStack"
                    ],
                    name: "Close Object"
                },
                {
                    strings: [
                        "openBackground", "openButton", "openCard", "openField", "openStack"
                    ],
                    name: "Open Object"
                },
                {
                    strings: [
                        "deleteBackground", "deleteButton", "deleteCard", "deleteField", "deleteStack"
                    ],
                    name: "Delete Object"
                },
                {
                    strings: [
                        "newBackground", "newButton", "newCard", "newField", "newStack"
                    ],
                    name: "New Object"
                },
                {
                    strings: [
                        "mouseDoubleClick", "mouseDown", "mouseDownInPicture", "mouseEnter",
                        "mouseLeave", "mouseStillDown", "mouseUpInPicture", "mouseUp", "mouseWithin"
                    ],
                    name: "Mouse Event"
                },
                {
                    strings: [
                        "arrowKey", "commandKeyDown", "controlKey", "enterKey",
                        "functionKey", "keyDown", "returnKey", "tabKey"
                    ],
                    skipSpecific: true,
                    name: "Key Event"
                },
                {
                    strings: [
                        "systemEvent", "doMenu", "enterInField", "exitField", "help",
                        "hide menubar", "idle", "moveWindow", "quit", "resumeStack",
                        "resume", "returnInField", "show menubar", "sizeWindow", "startUp",
                        "suspendStack", "suspend"
                    ],
                    skipSpecific: true,
                    name: "Other System Messages"
                },
            ];
            tests.forEach((test) => {
                it(`${test.name}`, () => {
                    const cl = test.name.replace(" ", "").unCapitalize();
                    test.strings.forEach((s) => {
                        semanticMatchTest(s, 'Message');
                        semanticMatchTest(s, 'systemMessage');
                        if (!test.skipSpecific) {
                            semanticMatchTest(s, `systemMessage_${cl}`);
                        }
                    });
                });
            });
        });
    });
    describe("stringLiteral", () => {
        it('Can deal with a single word', () => {
            const s = '"test"';
            semanticMatchTest(s, 'stringLiteral');
        });
        it('Can deal with a sentence', () => {
            const s = '"this is a test"';
            semanticMatchTest(s, 'stringLiteral');
        });
        it('Can deal with a url', () => {
            const s = '"http://localhost:8000/js/objects/examples/bootstrap-example.html"';
            semanticMatchTest(s, 'stringLiteral');
        });
        it('Can deal with a path', () => {
            const s = '"../../examples/bootstrap-example.html"';
            semanticMatchTest(s, 'stringLiteral');
        });
        it('Can deal with whitespace', () => {
            const s = '" \t   hi \t  \s  "';
            semanticMatchTest(s, 'stringLiteral');
        });
        it('Can deal with characters that look like operators', () => {
            const s = `"hello ** this / is ^ a stringLiteral +"`;
            semanticMatchTest(s, 'stringLiteral');
        });
        it('Does not match if newline is present', () => {
            const s = '"this is a\t\ntest"';
            semanticMatchFailTest(s, 'stringLiteral');
        });
    });
    describe("punctuation", () => {
        it('Basic', () => {
            const strings = [":", ";", ".", ",", "?", "!", "-"];
            strings.forEach((s) => { semanticMatchTest(s, 'punctuation'); });
        });
        it('Does not match some examples', () => {
            const s = '"this is a\t\ntest"';
            const strings = ["a", " ", "/"];
            strings.forEach((s) => { semanticMatchFailTest(s, 'punctuation'); });
        });
    });
    describe("object Id", () => {
        it("Basic Id", () => {
            semanticMatchTest("myNewId", "objectId");
        });
        it("Id with constters and digits", () => {
            semanticMatchTest("newIdl123", "objectId");
        });
        it("Bad objetId (with space)", () => {
            semanticMatchFailTest(" badId", "objectId");
        });
        it("Bad objetId (with space)", () => {
            semanticMatchFailTest(" badId", "objectId");
        });
    });
    describe("Parameter List", () => {
        it("Single param list", () => {
            semanticMatchTest("param1", "ParameterList");
        });
        it("Simple param list", () => {
            semanticMatchTest("param1, param2", "ParameterList");
        });
        it("Param list with digits", () => {
            semanticMatchTest("12, 22, newparam123", "ParameterList");
        });
        it("Bad param list (without spaces)", () => {
            semanticMatchFailTest("param1,param2", "ParameterList");
        });
        it("Bad param list (space)", () => {
            semanticMatchFailTest("pa ram1, param2", "ParameterList");
        });
    });
    describe("Variable assignment", () => {
        it("Can parse put assignment command (string literal)", () => {
            const s = `put "hello" into myCustomVariable`;
            semanticMatchTest(s, 'Command_putVariable');
        });
        it("Can parse put assignment command (integer literal)", () => {
            const s = `put 22 into myCustomVariable`;
            semanticMatchTest(s, 'Command_putVariable');
        });
        it("Can parse put assignment command (float literal)", () => {
            const s = `put -0.12 into myCustomVariable`;
            semanticMatchTest(s, 'Command_putVariable');
        });
        it("Can parse put assignment command into global variable (float literal)", () => {
            const s = `put -0.12 into global myCustomVariable`;
            semanticMatchTest(s, 'Command_putVariable');
        });
    });
});
