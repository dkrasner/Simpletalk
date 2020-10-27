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
            const s = "--mycomment"
            matchAndsemanticMatchTest(s, 'comment')
        });
        it("simple comment with spaces", () => {
            const s = "-- mycomment part2"
            matchAndsemanticMatchTest(s, 'comment')
        });
        it("comment with weird chars doesn't count", () => {
            const s = "-- mycomment $"
            semanticMatchFailTest(s, 'comment')
            const t = "-- mycomment \n"
            semanticMatchFailTest(s, 'comment')
        });
    });
    // TODO add more tests for handlers, comments, end etc
    describe("Messages", () => {
        it ("Message name", () => {
            const strings = [
                "f", "F", "amessage", "aMessage", "aMessage"
            ];
            strings.forEach((s) => {
                semanticMatchTest(s, 'messageName')
            });
        });
        it ("Bad message name", () => {
            const strings = [
                "1", "1m", "1M", "m1", "M1", " message", "then", "on", "end"
            ];
            strings.forEach((s) => {
                semanticMatchFailTest(s, 'messageName')
            });
        });
        it ("Message handler (no args, no statements)", () => {
            const s = `on myMessage\nend myMessage`
            matchAndsemanticMatchTest(s, 'MessageHandler')
        });
        it ("Message handler (args, no statements)", () => {
            const s = `on myNewMessage arg1, arg2\nend myNewMessage`
            matchAndsemanticMatchTest(s, 'MessageHandler')
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
        it ("Authored in message syntax", () => {
            const strings = [
                "myNewMessage", "myNewMessage arg1", "myNewMessage arg1, arg2", "myNewMessage 50"
            ];
            strings.forEach((s) => {
                semanticMatchTest(s, 'Message');
                semanticMatchTest(s, 'Message_authoredMessage');
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
            ]
            tests.forEach( (test) => {
                it(`${test.name}`, () => {
                    const cl = test.name.replace(" ", "").unCapitalize()
                    test.strings.forEach((s) => {
                        semanticMatchTest(s, 'Message');
                        semanticMatchTest(s, 'systemMessage');
                        if (!test.skipSpecific) {
                            semanticMatchTest(s, `systemMessage_${cl}`);
                        }
                    })
                })
            })
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
                    semanticMatchFailTest(s, "Command")
                });
            });
            it ("go to with object", () => {
                const direction = ["next", "previous"];
                direction.forEach((d) => {
                    const s = `go to ${d} card`
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
                semanticMatchFailTest(s, "Command")
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
                const s = "delete this world"
                semanticMatchFailTest(s, "Command_deleteModel")
                semanticMatchFailTest(s, "Command")
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
                const s = "add world to card"
                semanticMatchFailTest(s, "Command_addModel")
                semanticMatchFailTest(s, "Command")
            });
            it ("Bad add (invalid context)", () => {
                const s = "add button to new stack"
                semanticMatchFailTest(s, "Command_addModel")
                semanticMatchFailTest(s, "Command")
            });
        });
        describe("Answer", () => {
            it ("simple answer", () => {
                const s = "answer \"42\""
                semanticMatchTest(s, "Command");
                semanticMatchTest(s, "Command_answer");
                semanticMatchTest(s, "Statement");
            });
            it ("bad answer", () => {
                const s = "answer \"42\" \"42\""
                semanticMatchFailTest(s, "Command")
            });
        });
        describe("Set", () => {
            it ("Set backgroundColor with id", () => {
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
                semanticMatchFailTest(s, "Command")
            });
        });
        describe("Arbitrary", () => {
            it ("arbitrary command", () => {
                const s = "anythinggoes"
                semanticMatchTest(s, "Command");
                semanticMatchTest(s, "Statement");
            });
            it ("bad arbitrary", () => {
                const s = "abc def"
                semanticMatchFailTest(s, "Command")
            });
        });
        it ("Bad command (arbitrary with digits)", () => {
            semanticMatchFailTest("1234arrowKe", "Command");
        });
        it ("Bad command (arbitrary with space)", () => {
            semanticMatchFailTest("aCommand another", "Command");
        });
    });
});
