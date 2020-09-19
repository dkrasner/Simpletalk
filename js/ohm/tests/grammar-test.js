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
    describe("Script Handler", () => {
        it ("Message handler (args, single statement)", () => {
            const s = `on myNewMessage arg1, arg2
            global var1, var\nend myNewMessage`;
            matchAndsemanticMatchTest(s, 'MessageHandler');
        });
        it ("Function handler (args, statements)", () => {
            const s = `function myNewFunc(arg1, arg2)
            global var1, var
            global var1, var\nend myNewFunc`;
            matchAndsemanticMatchTest(s, 'FunctionHandler');
        });
    });
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
        it ("Message handler (args, single statement)", () => {
            const s = `on myNewMessage arg1, arg2
            global var1, var\nend myNewMessage`
            matchAndsemanticMatchTest(s, 'MessageHandler')
        });
        it ("Message handler (args, statements)", () => {
            const s = `on myNewMessage arg1, arg2
            global var1, var
            global var1, var\nend myNewMessage`
            matchAndsemanticMatchTest(s, 'MessageHandler')
        });
        it ("Message handler (args, statements with 'pass' control flow)", () => {
            const s = `on myNewMessage arg1, arg2
            global var1, var
            global var1, var
            pass myNewMessage\nend myNewMessage`
            matchAndsemanticMatchTest(s, 'MessageHandler')
        });
        it ("Message handler (args, statements with 'exit' control flow)", () => {
            const s = `on myNewMessage arg1, arg2
            global var1, var
            exit myNewMessage\nend myNewMessage`
            matchAndsemanticMatchTest(s, 'MessageHandler')

            const s2 = `on myNewMessage arg1, arg2
            global var1, var
            global var1, var
            exit to SimpleCard\nend myNewMessage`
            matchAndsemanticMatchTest(s2, 'MessageHandler')
        });
        it ("Bad Message handler (missing 'on' keyword)", () => {
            const s = `notkeyword myNewMessage arg1, arg2
            global var1, var
            global var1, var\nend myNewMessage`
            semanticMatchFailTest(s, 'MessageHandler');
        });
        it ("Bad Message handler (missing 'end' keyword)", () => {
            const s = `on myNewMessage arg1, arg2
            global var1, var
            global var1, var\nmyNewMessage`
            semanticMatchFailTest(s, 'MessageHandler');
        });
        it ("Bad Message handler ('()')", () => {
            const s = `on myNewMessage(arg1, arg2)
            global var1, var
            global var1, var\nend myNewMessage`
            semanticMatchFailTest(s, 'MessageHandler');
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
    describe("Functions", () => {
        it ("Function name", () => {
            const strings = [
                "f", "F", "f1", "F1", "afunction", "aFunction", "aFunction123"
            ];
            strings.forEach((s) => {
                semanticMatchTest(s, 'functionName');
            });
        });
        it ("Bad function name", () => {
            const strings = [
                "1", "1f", "1F", " function", "then", "on", "end"
            ];
            strings.forEach((s) => {
                semanticMatchFailTest(s, 'functionName');
            });
        });
        it ("Function handler (no args, no statements)", () => {
            const s = `function myNewFunc()\nend myNewFunc`
            semanticMatchTest(s, 'FunctionHandler')
        });
        it ("Function handler (args, no statements)", () => {
            const s = `function myNewFunc(arg1, arg2)\nend myNewFunc`
            semanticMatchTest(s, 'FunctionHandler')
        });
        it ("Function handler (args, single statement)", () => {
            const s = `function myNewFunc(arg1, arg2)
            global var1, var\nend myNewFunc`
            semanticMatchTest(s, 'FunctionHandler')
        });
        it ("Function handler (args, statements)", () => {
            const s = `function myNewFunc(arg1, arg2)
            global var1, var
            global var1, var\nend myNewFunc`
            semanticMatchTest(s, 'FunctionHandler')
        });
        it ("Function handler (args, statements with 'pass' control flow)", () => {
            const s = `function myNewFunc(arg1, arg2)
            global var1, var
            global var1, var
            pass myNewFunc\nend myNewFunc`
            semanticMatchTest(s, 'FunctionHandler')
        });
        it ("Function handler (args, statements with 'exit' control flow)", () => {
            const s = `function myNewFunc(arg1, arg2)
            global var1, var
            exit myNewFunc\nend myNewFunc`
            semanticMatchTest(s, 'FunctionHandler')

            const t = `function myNewFunc(arg1, arg2)
            global var1, var
            global var1, var
            exit to SimpleCard\nend myNewFunc`
            semanticMatchTest(t, 'FunctionHandler')
        });
        it ("Bad Function handler (missing 'function' keyword)", () => {
            const s = `funct myNewFunc(arg1, arg2)
            global var1, var
            global var1, var\nend myNewFunc`
            semanticMatchFailTest(s, 'FunctionHandler')
        });
        it ("Bad Function handler (missing 'end' keyword)", () => {
            const s = `function myNewFunc(arg1, arg2)
            global var1, var
            global var1, var\nmyNewFunc`
            semanticMatchFailTest(s, 'FunctionHandler')
        });
        it ("Bad Function handler (missing '()')", () => {
            const s = `function myNewFunc arg1, arg2
            global var1, var
            global var1, var\nend myNewFunc`
            semanticMatchFailTest(s, 'FunctionHandler')
        });
        it ("Built in function syntax", () => {
            const strings = [
                "average()", "tan()", "mouseClick()", "sin(30)", "sin(30, 45)"
            ];
            strings.forEach((s) => {
                semanticMatchTest(s, 'Function')
                semanticMatchTest(s, 'Function_builtInFunction');
            });
        });
        it ("Authored in function syntax", () => {
            const strings = [
                "myNewFun()", "myNewFun(arg1)", "myNewFun(arg1, arg2)", "myNewFun(50)"
            ];
            strings.forEach((s) => {
                semanticMatchTest(s, 'Function')
                semanticMatchTest(s, 'Function_authoredFunction');
            });
        });
        it ("Built in math functions", () => {
            const strings = [
                "average", "min", "max", "sum", "random", "sqrt", "trunc", "sin",
                "cos", "tan", "atan", "exp", "ln", "abs",
            ];
            strings.forEach((s) => {
                semanticMatchTest(s, 'builtInFunction');
            });
        });
        it ("Modifier key functions", () => {
            const strings = [
                "commandkey", "optionkey", "controlkey", "shiftkey"
            ];
            strings.forEach((s) => {
                semanticMatchTest(s, 'builtInFunction');
            });
        });
        it ("Basic built in functions", () => {
            const strings = [
                "charToNum", "date", "length", "menus", "mouse", "mouseClick"
            ];
            strings.forEach((s) => {
                semanticMatchTest(s, 'builtInFunction');
            });
        });
    });
    describe("Statement", () => {
        it ("Global Statement", () => {
            semanticMatchTest("global param1, param2", "Statement");
        });
    });
    describe("Statement List", () => {
        it ("Single statement statement list", () => {
            const s = `global param1, param2\n`;
            semanticMatchTest(s, "StatementList");
        });
        it ("Bad single statement statement list (no newline)", () => {
            const s = `global param1, param2`;
            semanticMatchFailTest(s, "StatementList");
        });
        it ("Multi statement statement list", () => {
            const s = ` global param1, param2\nglobal param1, param2\n`;
            semanticMatchTest(s, "StatementList");
        });
        it ("Bad multi statement statement list (no newline)", () => {
            const s = ` global param1, param2\tglobal param1, param2\n`;
            semanticMatchFailTest(s, "StatementList");
        });
    });
    describe("Expressions", () => {
        describe("Factor", () => {
            it ("Integer", () => {
                const strings = [
                    "1", "12"
                ];
                strings.forEach((s) => {
                    semanticMatchTest(s, 'Expression');
                    semanticMatchTest(s, 'Factor');
                    semanticMatchTest(s, 'Factor_integer');
                });
            });
            it ("Not Integer", () => {
                const strings = [
                    "1.0", "12.222", "abc123"
                ];
                strings.forEach((s) => {
                    semanticMatchFailTest(s, 'Factor_integer');
                });
            });
            it ("Float", () => {
                const strings = [
                    "1.0", "12.23"
                ];
                strings.forEach((s) => {
                    semanticMatchTest(s, 'Expression');
                    semanticMatchTest(s, 'Factor');
                    semanticMatchTest(s, 'Factor_float');
                });
            });
            it ("Not Float", () => {
                const strings = [
                    "10.1", "abc123"
                ];
                strings.forEach((s) => {
                    semanticMatchFailTest(s, 'Factor_integer')
                });
            });
            it ("Literal", () => {
                const strings = [
                    "abc", "abc10", "ABC1"
                ];
                strings.forEach((s) => {
                    semanticMatchTest(s, 'Expression');
                    semanticMatchTest(s, 'Factor');
                    semanticMatchTest(s, 'Factor_literal');
                });
            });
            it ("Not Literal", () => {
                const strings = [
                    "10abc", "10", "1ABC1", "1.1"
                ];
                strings.forEach((s) => {
                    semanticMatchFailTest(s, 'Factor_literal')
                });
            });
            it ("Negated", () => {
                const strings = [
                    "-abc", "-10.10", "-1"
                ];
                strings.forEach((s) => {
                    semanticMatchTest(s, 'Expression');
                    semanticMatchTest(s, 'Factor');
                    semanticMatchTest(s, 'Factor_negation');
                });
            });
            it ("Not negation", () => {
                const strings = [
                    "abc", "10", "ABC1", "1.1"
                ];
                strings.forEach((s) => {
                    semanticMatchFailTest(s, 'Factor_negation')
                });
            });
            describe("Logical Negation", () => {
                it('Matches negation on alpha character string', () => {
                    const s = "not abc";
                    semanticMatchTest(s, 'Expression');
                    semanticMatchTest(s, 'Factor');
                    semanticMatchTest(s, 'Factor_logicalNegation');
                });
                it('Matches negation on alpha integer string', () => {
                    const s = "not 10";
                    semanticMatchTest(s, 'Expression');
                    semanticMatchTest(s, 'Factor');
                    semanticMatchTest(s, 'Factor_logicalNegation');
                });
                it('Matches negation on alpha float string', () => {
                    const s = "not 10.99";
                    semanticMatchTest(s, 'Expression');
                    semanticMatchTest(s, 'Factor');
                    semanticMatchTest(s, 'Factor_logicalNegation');
                });
                it('Matches negation on alpha parenthetical alpha string', () => {
                    const s = "not (abc1)";
                    semanticMatchTest(s, 'Expression');
                    semanticMatchTest(s, 'Factor');
                    semanticMatchTest(s, 'Factor_logicalNegation');
                });
            });
            it ("Not logical negation", () => {
                const strings = [
                    "abc", "10", "ABC1", "1.1"
                ];
                strings.forEach((s) => {
                    semanticMatchFailTest(s, 'Factor_logicalNegation');
                });
            });
        });
        it ("Parenthetical", () => {
            const strings = [
                "(1)", "(12.2)", "(abc10)", "( abc )"
            ];
            strings.forEach((s) => {
                semanticMatchTest(s, 'Expression');
                semanticMatchTest(s, 'Expression_parenthetical');
            });
        });
        it ("Not Parenthetical", () => {
            const strings = [
                "1", "12.2", "abc10"
            ];
            strings.forEach((s) => {
                semanticMatchTest(s, 'Expression');
                semanticMatchFailTest(s, 'Expression_parenthetical');
            });
        });
    });
    describe("stringLiteral", () => {
        it('Can deal with a single word', () => {
            const s = '"this is a test"';
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
    describe("Global Statement", () => {
        it ("Basic global statement", () => {
            semanticMatchTest("global param1, param2", "GlobalStatement");
        });
        it ("Bad global statement (no space)", () => {
            semanticMatchFailTest("globalparam1, param2", "GlobalStatement");
        });
    });
    describe("Commands", () => {
        describe("Go To", () => {
            it ("go to direction", () => {
                const direction = ["next", "previous"];
                direction.forEach((d) => {
                    const s = `go to ${d}`;
                    semanticMatchTest(s, "Command");
                    semanticMatchTest(s, "Command_goToDirection");
                    semanticMatchTest(s, "Statement");
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
        });
        describe("Remove Model", () => {
            it ("Basic Remove (no id)", () => {
                const direction = ["stack", "background", "card", "button"];
                direction.forEach((d) => {
                    const s = `remove model ${d}`;
                    semanticMatchTest(s, "Command");
                    semanticMatchTest(s, "Command_removeModel");
                    semanticMatchTest(s, "Statement");
                });
            });
            it ("Basic Remove (with id)", () => {
                const direction = ["stack", "background", "card", "button"];
                direction.forEach((d) => {
                    const s = `remove model ${d} 20`;
                    semanticMatchTest(s, "Command");
                    semanticMatchTest(s, "Command_removeModel");
                    semanticMatchTest(s, "Statement");
                });
            });
            it ("Bad remove (world)", () => {
                const s = "remove model world"
                semanticMatchFailTest(s, "Command_removeModel")
                semanticMatchFailTest(s, "Command")
            });
        });
        describe("Add Model", () => {
            it ("Basic Add (no id)", () => {
                const direction = ["stack", "background", "card", "button"];
                direction.forEach((d) => {
                    const s = `add model ${d}`;
                    semanticMatchTest(s, "Command");
                    semanticMatchTest(s, "Command_addModel");
                    semanticMatchTest(s, "Statement");
                });
            });
            it ("Bad add (world)", () => {
                const s = "add model world"
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
        it ("Bad go to: invalid structure", () => {
            const s = "go to next card 42";
            semanticMatchFailTest(s, "Command");
        });
        it ("Bad command (arbitrary with digits)", () => {
            semanticMatchFailTest("1234arrowKe", "Command");
        });
        it ("Bad command (arbitrary with space)", () => {
            semanticMatchFailTest("aCommand another", "Command");
        });
    });
});
