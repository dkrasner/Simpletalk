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
        it("positive integer", () =>{
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
        it ("Message name", () => {
            const strings = [
                "f", "F", "amessage", "aMessage", "aMessage"
            ];
            strings.forEach((s) => {
                semanticMatchTest(s, 'messageName');
            });
        });
        it ("Bad message name", () => {
            const strings = [
                "1", "1m", "1M", "m1", "M1", " message", "then", "on", "end"
            ];
            strings.forEach((s) => {
                semanticMatchFailTest(s, 'messageName');
            });
        });
        it ("Can parse message names beginning with 'do'", () => {
            let str = "doSomething";
            semanticMatchTest(str, 'messageName');
        });
        it ("Message handler (no args, no statements)", () => {
            const s = `on myMessage\nend myMessage`;
            matchAndsemanticMatchTest(s, 'MessageHandler');
        });
        it ("Message handler (args, no statements)", () => {
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
        it ("Built in message syntax", () => {
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
                {strings: [
                    "closeBackground", "closeButton", "closeCard", "closeField", "closeStack"
                ],
                name: "Close Object"},
                {strings: [
                    "openBackground", "openButton", "openCard", "openField", "openStack"
                ],
                name: "Open Object"},
                {strings: [
                    "deleteBackground", "deleteButton", "deleteCard", "deleteField", "deleteStack"
                ],
                name: "Delete Object"},
                {strings: [
                    "newBackground", "newButton", "newCard", "newField", "newStack"
                ],
                name: "New Object"},
                {strings: [
                    "mouseDoubleClick", "mouseDown", "mouseDownInPicture", "mouseEnter",
                    "mouseLeave", "mouseStillDown", "mouseUpInPicture", "mouseUp", "mouseWithin"
                ],
                name: "Mouse Event"},
                {strings: [
                    "arrowKey", "commandKeyDown", "controlKey", "enterKey",
                    "functionKey", "keyDown", "returnKey", "tabKey"
                ],
                skipSpecific: true,
                name: "Key Event"},
                {strings: [
                    "systemEvent", "doMenu", "enterInField" , "exitField", "help",
                    "hide menubar", "idle", "moveWindow", "quit", "resumeStack",
                    "resume", "returnInField", "show menubar", "sizeWindow", "startUp",
                    "suspendStack", "suspend"
                ],
                skipSpecific: true,
                name: "Other System Messages"},
            ];
            tests.forEach( (test) => {
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
            strings.forEach((s) => {semanticMatchTest(s, 'punctuation')});
        });
        it('Does not match some examples', () => {
            const s = '"this is a\t\ntest"';
            const strings = ["a", " ", "/"];
            strings.forEach((s) => {semanticMatchFailTest(s, 'punctuation')});
        });
    });
    describe("object Id", () => {
        it ("Basic Id", () => {
            semanticMatchTest("myNewId", "objectId");
        });
        it ("Id with constters and digits", () => {
            semanticMatchTest("newIdl123", "objectId");
        });
        it ("Bad objetId (with space)", () => {
            semanticMatchFailTest(" badId", "objectId");
        });
        it ("Bad objetId (with space)", () => {
            semanticMatchFailTest(" badId", "objectId");
        });
    });
    describe("Parameter List", () => {
        it ("Single param list", () => {
            semanticMatchTest("param1", "ParameterList");
        });
        it ("Simple param list", () => {
            semanticMatchTest("param1, param2", "ParameterList");
        });
        it ("Param list with digits", () => {
            semanticMatchTest("12, 22, newparam123", "ParameterList");
        });
        it ("Bad param list (without spaces)", () => {
            semanticMatchFailTest("param1,param2", "ParameterList");
        });
        it ("Bad param list (space)", () => {
            semanticMatchFailTest("pa ram1, param2", "ParameterList");
        });
    });
    describe("Commands", () => {
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
            it ("go to by reference", () => {
                const s = "go to card 42";
                semanticMatchTest(s, "Command");
                semanticMatchTest(s, "Command_goToByReference");
                semanticMatchTest(s, "Statement");
            });
            it ("Bad go to: invalid object", () => {
                const s = "go to world 42";
                semanticMatchFailTest(s, "Command");
            });
            it ("Bad go to: invalid structure", () => {
                const s = "go to next card 42";
                semanticMatchFailTest(s, "Command");
            });
        });
        describe("Remove Model", () => {
            it ("Basic Remove (no id)", () => {
                const direction = ["stack", "background", "card", "button"];
                direction.forEach((d) => {
                    const s = `delete this ${d}`;
                    semanticMatchTest(s, "Command");
                    semanticMatchTest(s, "Command_deleteModel");
                    semanticMatchTest(s, "Statement");
                });
            });
            it ("Basic Remove (with id)", () => {
                const direction = ["stack", "background", "card", "button"];
                direction.forEach((d) => {
                    const s = `delete ${d} 20`;
                    semanticMatchTest(s, "Command");
                    semanticMatchTest(s, "Command_deleteModel");
                    semanticMatchTest(s, "Statement");
                });
            });
            it ("Bad delete (world)", () => {
                const s = "delete this world";
                semanticMatchFailTest(s, "Command_deleteModel");
                semanticMatchFailTest(s, "Command");
            });
        });
        describe("Add Model", () => {
            it ("Basic Add (no id)", () => {
                const objects = [
                    "background", "card", "container", "field", "button", "stack", "window",
                    "toolbox", "drawing", "svg"
                ];
                objects.forEach((d) => {
                    const s = `add ${d} to card`;
                    semanticMatchTest(s, "Command");
                    semanticMatchTest(s, "Command_addModel");
                    semanticMatchTest(s, "Statement");
                });
            });
            it ("Basic Add (wth id)", () => {
                const objects = [
                    "background", "card", "container", "field", "button", "stack", "window",
                    "toolbox", "drawing", "svg"
                ];
                objects.forEach((d) => {
                    const s = `add ${d} to card 20`;
                    semanticMatchTest(s, "Command");
                    semanticMatchTest(s, "Command_addModel");
                    semanticMatchTest(s, "Statement");
                });
            });
            it ("Add to 'this'", () => {
                const objects = [
                    "background", "card", "container", "field", "button", "stack", "window",
                    "toolbox", "drawing", "svg"
                ];
                objects.forEach((d) => {
                    const s = `add ${d} to this stack`;
                    semanticMatchTest(s, "Command");
                    semanticMatchTest(s, "Command_addModel");
                    semanticMatchTest(s, "Statement");
                });
            });
            it ("Add to 'current'", () => {
                const objects = [
                    "background", "card", "container", "field", "button", "stack", "window",
                    "toolbox", "drawing", "svg"
                ];
                objects.forEach((d) => {
                    const s = `add ${d} to current stack`;
                    semanticMatchTest(s, "Command");
                    semanticMatchTest(s, "Command_addModel");
                    semanticMatchTest(s, "Statement");
                });
            });
            it ("Basic Add (with name, no id)", () => {
                const objects = [
                    "background", "card", "container", "field", "button", "stack", "window",
                    "toolbox", "drawing", "svg"
                ];
                objects.forEach((d) => {
                    const s = `add ${d} "newPart 123" to card`;
                    semanticMatchTest(s, "Command");
                    semanticMatchTest(s, "Command_addModel");
                    semanticMatchTest(s, "Statement");
                });
            });
            it ("Basic Add (with name, wth id)", () => {
                const objects = [
                    "background", "card", "container", "field", "button", "stack", "window",
                    "toolbox", "drawing", "svg"
                ];
                objects.forEach((d) => {
                    const s = `add ${d} "newPart 123" to card 20`;
                    semanticMatchTest(s, "Command");
                    semanticMatchTest(s, "Command_addModel");
                    semanticMatchTest(s, "Statement");
                });
            });
            it ("Add named to 'this'", () => {
                const objects = [
                    "background", "card", "container", "field", "button", "stack", "window",
                    "toolbox", "drawing", "svg"
                ];
                objects.forEach((d) => {
                    const s = `add ${d} "newPart 123" to this stack`;
                    semanticMatchTest(s, "Command");
                    semanticMatchTest(s, "Command_addModel");
                    semanticMatchTest(s, "Statement");
                });
            });
            it ("Add named to 'current'", () => {
                const objects = [
                    "background", "card", "container", "field", "button", "stack", "window",
                    "toolbox", "drawing", "svg"
                ];
                objects.forEach((d) => {
                    const s = `add ${d} "newPart123" to current stack`;
                    semanticMatchTest(s, "Command");
                    semanticMatchTest(s, "Command_addModel");
                    semanticMatchTest(s, "Statement");
                });
            });
            it ("Add (no target or context)", () => {
                const objects = [
                    "background", "card", "container", "field", "button", "stack", "window",
                    "toolbox", "drawing", "svg"
                ];
                objects.forEach((d) => {
                    const s = `add ${d}`;
                    semanticMatchTest(s, "Command");
                    semanticMatchTest(s, "Command_addModel");
                    semanticMatchTest(s, "Statement");
                });
            });
            it ("Add named (no target or context)", () => {
                const objects = [
                    "background", "card", "container", "field", "button", "stack", "window",
                    "toolbox", "drawing", "svg"
                ];
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
                semanticMatchFailTest(s, "Command");
            });
            it ("Bad add (invalid context)", () => {
                const s = "add button to new stack";
                semanticMatchFailTest(s, "Command_addModel");
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
            it.skip ("Set backgroundColor with id", () => {
                const objects = ["background", "card", "container", "field", "button", "stack", "window"];
                objects.forEach((d) => {
                    const s = `set "backgroundColor" to "blue" in ${d} 10`;
                    semanticMatchTest(s, "Command");
                    semanticMatchTest(s, "Command_setProperty");
                    semanticMatchTest(s, "Statement");
                });
            });
            it ("Set backgroundColor (no target)", () => {
                const objects = ["background", "card", "container", "field", "button", "stack", "window"];
                objects.forEach((d) => {
                    const s = `set "backgroundColor" to "blue"`;
                    semanticMatchTest(s, "Command");
                    semanticMatchTest(s, "Command_setProperty");
                    semanticMatchTest(s, "Statement");
                });
            });
            it ("Set background color in this or current", () => {
                const objects = ["background", "card", "container", "field", "button", "stack", "window"];
                ["this", "current"].forEach((context) => {
                    objects.forEach((d) => {
                        const s = `set "backgroundColor" to "blue" in ${context} ${d}`;
                        semanticMatchTest(s, "Command");
                        semanticMatchTest(s, "Command_setProperty");
                        semanticMatchTest(s, "Statement");
                    });
                });
            });
            it ("Bad construction (no quotes)", () => {
                const s = `set backgroundColor to "blue" in card 10`;
                semanticMatchFailTest(s, "Command");
            });
        });
        describe("Respond To", () => {
            it ("respond to click in button", () => {
                const s = 'respond to "click" in this button';
                semanticMatchTest(s, "Command");
                semanticMatchTest(s, "Command_eventRespond");
                semanticMatchTest(s, "Statement");
            });
            it ("respond to customEvent in button", () => {
                const s = 'respond to "customEvent" in this button';
                semanticMatchTest(s, "Command");
                semanticMatchTest(s, "Command_eventRespond");
                semanticMatchTest(s, "Statement");
            });
            it ("respond to customEvent in named card", () => {
                const s = 'respond to "customEvent" in card "new card"';
                semanticMatchTest(s, "Command");
                semanticMatchTest(s, "Command_eventRespond");
                semanticMatchTest(s, "Statement");
            });
            it ("Bad construction (no quotes)", () => {
                const s = 'respond to click in this button';
                semanticMatchFailTest(s, "Command");
            });
            it ("Bad construction (bad target)", () => {
                const s = 'respond to "click" in this noObject';
                semanticMatchFailTest(s, "Command");
            });
        });
        describe("Ignore", () => {
            it ("ignore click in button", () => {
                const s = 'ignore "click" in this button';
                semanticMatchTest(s, "Command");
                semanticMatchTest(s, "Command_eventIgnore");
                semanticMatchTest(s, "Statement");
            });
            it ("ignore customEvent in button", () => {
                const s = 'ignore "customEvent" in this button';
                semanticMatchTest(s, "Command");
                semanticMatchTest(s, "Command_eventIgnore");
                semanticMatchTest(s, "Statement");
            });
            it ("ignore customEvent in named card", () => {
                const s = 'ignore "customEvent" in card "new card"';
                semanticMatchTest(s, "Command");
                semanticMatchTest(s, "Command_eventIgnore");
                semanticMatchTest(s, "Statement");
            });
            it ("Bad construction (no quotes)", () => {
                const s = 'ignore click in this button';
                semanticMatchFailTest(s, "Command");
            });
            it ("Bad construction (bad target)", () => {
                const s = 'ignore "click" in this noObject';
                semanticMatchFailTest(s, "Command");
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
    });
});
