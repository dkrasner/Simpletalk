var ohm = require('ohm-js');
// Instantiate the grammar.
var fs = require('fs');
var g = ohm.grammar(fs.readFileSync('./js/ohm/simpletalk.ohm'));

var chai = require('chai');
var assert = chai.assert;


describe("SimpleTalk Grammar", function () {
    describe("Basic lexical", () => {
        it("`space` does not include any newline chars", () => {
            let newlineStr = `\n`;
            let crStr = `\r`;
            let newlineMatch = g.match(newlineStr, 'space');
            let crMatch = g.match(crStr, 'space');
            assert.isFalse(newlineMatch.succeeded());
            assert.isFalse(crMatch.succeeded());
        });
    });
    // TODO add more tests for handlers, comments, end etc
    describe("Script Handler", function () {
        it ("Message handler (args, single statement)", function () {
            let s = `on myNewMessage arg1, arg2
            global var1, var\nend myNewMessage`;
            let match = g.match(s);
            assert.isTrue(match.succeeded());
            match = g.match(s, 'MessageHandler');
            assert.isTrue(match.succeeded());
        });
        it ("Function handler (args, statements)", function () {
            let s = `function myNewFunc(arg1, arg2)
            global var1, var
            global var1, var\nend myNewFunc`;
            let match = g.match(s);
            assert.isTrue(match.succeeded());
            match = g.match(s, 'FunctionHandler');
            assert.isTrue(match.succeeded());
        });
    });
    describe("Messages", function () {
        it ("Message name", function () {
            let strings = [
                "f", "F", "amessage", "aMessage", "aMessage"
            ];
            let match = null;
            strings.forEach((s) => {
                match = g.match(s, 'messageName');
                assert.isTrue(match.succeeded());
            });
        });
        it ("Bad message name", function () {
            let strings = [
                "1", "1m", "1M", "m1", "M1", " message", "then", "on", "end"
            ];
            let match = null;
            strings.forEach((s) => {
                match = g.match(s, 'messageName');
                assert.isTrue(match.failed());
            });
        });
        it ("Message handler (no args, no statements)", function () {
            let s = `on myMessage\nend myMessage`
            let match = g.match(s, 'MessageHandler');
            assert.isTrue(match.succeeded());
        });
        it ("Message handler (args, no statements)", function () {
            let s = `on myNewMessage arg1, arg2\nend myNewMessage`
            let match = g.match(s, 'MessageHandler');
            assert.isTrue(match.succeeded());
        });
        it ("Message handler (args, single statement)", function () {
            let s = `on myNewMessage arg1, arg2
            global var1, var\nend myNewMessage`
            let match = g.match(s, 'MessageHandler');
            assert.isTrue(match.succeeded())
        });
        it ("Message handler (args, statements)", function () {
            let s = `on myNewMessage arg1, arg2
            global var1, var
            global var1, var\nend myNewMessage`
            let match = g.match(s, 'MessageHandler');
            assert.isTrue(match.succeeded())
        });
        it ("Message handler (args, statements with 'pass' control flow)", function () {
            let s = `on myNewMessage arg1, arg2
            global var1, var
            global var1, var
            pass myNewMessage\nend myNewMessage`
            let match = g.match(s, 'MessageHandler');
            assert.isTrue(match.succeeded())
        });
        it ("Message handler (args, statements with 'exit' control flow)", function () {
            let s = `on myNewMessage arg1, arg2
            global var1, var
            exit myNewMessage\nend myNewMessage`
            let match = g.match(s, 'MessageHandler');
            assert.isTrue(match.succeeded())
            s = `on myNewMessage arg1, arg2
            global var1, var
            global var1, var
            exit to SimpleCard\nend myNewMessage`
            match = g.match(s, 'MessageHandler');
            assert.isTrue(match.succeeded())
        });
        it ("Bad Message handler (missing 'on' keyword)", function () {
            let s = `notkeyword myNewMessage arg1, arg2
            global var1, var
            global var1, var\nend myNewMessage`
            let match = g.match(s, 'MessageHandler');
            assert.isTrue(match.failed())
        });
        it ("Bad Message handler (missing 'end' keyword)", function () {
            let s = `on myNewMessage arg1, arg2
            global var1, var
            global var1, var\nmyNewMessage`
            let match = g.match(s, 'MessageHandler');
            assert.isTrue(match.failed())
        });
        it ("Bad Message handler ('()')", function () {
            let s = `on myNewMessage(arg1, arg2)
            global var1, var
            global var1, var\nend myNewMessage`
            let match = g.match(s, 'MessageHandler');
            assert.isTrue(match.failed())
        });
        it ("Built in message syntax", function () {
            let strings = [
                "close", "closeStack", "commandKeyDown", "quit"
            ];
            let match = null;
            strings.forEach((s) => {
                match = g.match(s, 'Message');
                assert.isTrue(match.succeeded());
                match = g.match(s, 'Message_system');
                assert.isTrue(match.succeeded());
            });
        });
        it ("Authored in message syntax", function () {
            let strings = [
                "myNewMessage", "myNewMessage arg1", "myNewMessage arg1, arg2", "myNewMessage 50"
            ];
            let match = null;
            strings.forEach((s) => {
                match = g.match(s, 'Message');
                assert.isTrue(match.succeeded());
                match = g.match(s, 'Message_authoredMessage');
                assert.isTrue(match.succeeded());
            });
        });
        describe("Built in system messages", function () {
            it ("Close Object", function () {
                let strings = [
                    "closeBackground", "closeButton", "closeCard", "closeField", "closeStack"
                ];
                let match = null;
                strings.forEach((s) => {
                    match = g.match(s, 'Message');
                    assert.isTrue(match.succeeded());
                    match = g.match(s, 'systemMessage');
                    assert.isTrue(match.succeeded());
                    match = g.match(s, 'systemMessage_closeObject');
                    assert.isTrue(match.succeeded());
                });
            });
            it ("Open Object", function () {
                let strings = [
                    "openBackground", "openButton", "openCard", "openField", "openStack"
                ];
                let match = null;
                strings.forEach((s) => {
                    match = g.match(s, 'Message');
                    assert.isTrue(match.succeeded());
                    match = g.match(s, 'systemMessage');
                    assert.isTrue(match.succeeded());
                    match = g.match(s, 'systemMessage_openObject');
                    assert.isTrue(match.succeeded());
                });
            });
            it ("Delete Object", function () {
                let strings = [
                    "deleteBackground", "deleteButton", "deleteCard", "deleteField", "deleteStack"
                ];
                let match = null;
                strings.forEach((s) => {
                    match = g.match(s, 'Message');
                    assert.isTrue(match.succeeded());
                    match = g.match(s, 'systemMessage');
                    assert.isTrue(match.succeeded());
                    match = g.match(s, 'systemMessage_deleteObject');
                    assert.isTrue(match.succeeded());
                });
            });
            it ("New Object", function () {
                let strings = [
                    "newBackground", "newButton", "newCard", "newField", "newStack"
                ];
                let match = null;
                strings.forEach((s) => {
                    match = g.match(s, 'Message');
                    assert.isTrue(match.succeeded());
                    match = g.match(s, 'systemMessage');
                    assert.isTrue(match.succeeded());
                    match = g.match(s, 'systemMessage_newObject');
                    assert.isTrue(match.succeeded());
                });
            });
            it ("Mouse Events", function () {
                let strings = [
                    "mouseDoubleClick", "mouseDown", "mouseDownInPicture", "mouseEnter",
                    "mouseLeave", "mouseStillDown", "mouseUpInPicture", "mouseUp", "mouseWithin"
                ];
                let match = null;
                strings.forEach((s) => {
                    match = g.match(s, 'Message');
                    assert.isTrue(match.succeeded());
                    match = g.match(s, 'systemMessage');
                    assert.isTrue(match.succeeded());
                    match = g.match(s, 'systemMessage_mouseEvent');
                    assert.isTrue(match.succeeded());
                });
            });
            it ("Key Events", function () {
                let strings = [
                    "arrowKey", "commandKeyDown", "controlKey", "enterKey",
                    "functionKey", "keyDown", "returnKey", "tabKey"
                ];
                let match = null;
                strings.forEach((s) => {
                    match = g.match(s, 'Message');
                    assert.isTrue(match.succeeded());
                    match = g.match(s, 'systemMessage');
                    assert.isTrue(match.succeeded());
                });
            });
            it ("Other system messages", function () {
                let strings = [
                    "systemEvent", "doMenu", "enterInField" , "exitField", "help",
                    "hide menubar", "idle", "moveWindow", "quit", "resumeStack",
                    "resume", "returnInField", "show menubar", "sizeWindow", "startUp",
                    "suspendStack", "suspend"
                ];
                let match = null;
                strings.forEach((s) => {
                    match = g.match(s, 'Message');
                    assert.isTrue(match.succeeded());
                    match = g.match(s, 'systemMessage');
                    assert.isTrue(match.succeeded());
                });
            });
        });
    });
    describe("Functions", function () {
        it ("Function name", function () {
            let strings = [
                "f", "F", "f1", "F1", "afunction", "aFunction", "aFunction123"
            ];
            let match = null;
            strings.forEach((s) => {
                match = g.match(s, 'functionName');
                assert.isTrue(match.succeeded());
            });
        });
        it ("Bad function name", function () {
            let strings = [
                "1", "1f", "1F", " function", "then", "on", "end"
            ];
            let match = null;
            strings.forEach((s) => {
                match = g.match(s, 'functionName');
                assert.isTrue(match.failed());
            });
        });
        it ("Function handler (no args, no statements)", function () {
            let s = `function myNewFunc()\nend myNewFunc`
            let match = g.match(s, 'FunctionHandler');
            assert.isTrue(match.succeeded());
        });
        it ("Function handler (args, no statements)", function () {
            let s = `function myNewFunc(arg1, arg2)\nend myNewFunc`
            let match = g.match(s, 'FunctionHandler');
            assert.isTrue(match.succeeded());
        });
        it ("Function handler (args, single statement)", function () {
            let s = `function myNewFunc(arg1, arg2)
            global var1, var\nend myNewFunc`
            let match = g.match(s, 'FunctionHandler');
            assert.isTrue(match.succeeded())
        });
        it ("Function handler (args, statements)", function () {
            let s = `function myNewFunc(arg1, arg2)
            global var1, var
            global var1, var\nend myNewFunc`
            let match = g.match(s, 'FunctionHandler');
            assert.isTrue(match.succeeded())
        });
        it ("Function handler (args, statements with 'pass' control flow)", function () {
            let s = `function myNewFunc(arg1, arg2)
            global var1, var
            global var1, var
            pass myNewFunc\nend myNewFunc`
            let match = g.match(s, 'FunctionHandler');
            assert.isTrue(match.succeeded())
        });
        it ("Function handler (args, statements with 'exit' control flow)", function () {
            let s = `function myNewFunc(arg1, arg2)
            global var1, var
            exit myNewFunc\nend myNewFunc`
            let match = g.match(s, 'FunctionHandler');
            assert.isTrue(match.succeeded())
            s = `function myNewFunc(arg1, arg2)
            global var1, var
            global var1, var
            exit to SimpleCard\nend myNewFunc`
            match = g.match(s, 'FunctionHandler');
            assert.isTrue(match.succeeded())
        });
        it ("Bad Function handler (missing 'function' keyword)", function () {
            let s = `funct myNewFunc(arg1, arg2)
            global var1, var
            global var1, var\nend myNewFunc`
            let match = g.match(s, 'FunctionHandler');
            assert.isTrue(match.failed())
        });
        it ("Bad Function handler (missing 'end' keyword)", function () {
            let s = `function myNewFunc(arg1, arg2)
            global var1, var
            global var1, var\nmyNewFunc`
            let match = g.match(s, 'FunctionHandler');
            assert.isTrue(match.failed())
        });
        it ("Bad Function handler (missing '()')", function () {
            let s = `function myNewFunc arg1, arg2
            global var1, var
            global var1, var\nend myNewFunc`
            let match = g.match(s, 'FunctionHandler');
            assert.isTrue(match.failed())
        });
        it ("Built in function syntax", function () {
            let strings = [
                "average()", "tan()", "mouseClick()", "sin(30)"
            ];
            let match = null;
            strings.forEach((s) => {
                match = g.match(s, 'Function');
                assert.isTrue(match.succeeded());
                match = g.match(s, 'Function_builtInFunction');
                assert.isTrue(match.succeeded());
            });
        });
        it ("Authored in function syntax", function () {
            let strings = [
                "myNewFun()", "myNewFun(arg1)", "myNewFun(arg1, arg2)", "myNewFun(50)"
            ];
            let match = null;
            strings.forEach((s) => {
                match = g.match(s, 'Function');
                assert.isTrue(match.succeeded());
                match = g.match(s, 'Function_authoredFunction');
                assert.isTrue(match.succeeded());
            });
        });
        it ("Built in math functions", function () {
            let strings = [
                "average", "min", "max", "sum", "random", "sqrt", "trunc", "sin",
                "cos", "tan", "atan", "exp", "ln", "abs",
            ];
            let match = null;
            strings.forEach((s) => {
                match = g.match(s, 'builtInFunction');
                assert.isTrue(match.succeeded());
            });
        });
        it ("Modifier key functions", function () {
            let strings = [
                "commandkey", "optionkey", "controlkey", "shiftkey"
            ];
            let match = null;
            strings.forEach((s) => {
                match = g.match(s, 'builtInFunction');
                assert.isTrue(match.succeeded());
            });
        });
        it ("Basic built in functions", function () {
            let strings = [
                "charToNum", "date", "length", "menus", "mouse", "mouseClick"
            ];
            let match = null;
            strings.forEach((s) => {
                match = g.match(s, 'builtInFunction');
                assert.isTrue(match.succeeded());
            });
        });
    });
    describe("Statement", function () {
        it ("Global Statement", function () {
            let match = g.match("global param1, param2", "Statement");
            assert.isTrue(match.succeeded());
        });
    });
    describe("Statement List", function () {
        it ("Single statement statement list", function () {
            let s = `global param1, param2\n`;
            let match = g.match(s, "StatementList");
            assert.isTrue(match.succeeded());
        });
        it ("Bad single statement statement list (no newline)", function () {
            let s = `global param1, param2`;
            let match = g.match(s, "StatementList");
            assert.isTrue(match.failed());
        });
        it ("Multi statement statement list", function () {
            let s = ` global param1, param2\nglobal param1, param2\n`;
            let match = g.match(s, "StatementList");
            assert.isTrue(match.succeeded());
        });
        it ("Bad multi statement statement list (no newline)", function () {
            let s = ` global param1, param2\tglobal param1, param2\n`;
            let match = g.match(s, "StatementList");
            assert.isTrue(match.failed());
        });
    });
    describe("Expressions", function () {
        describe("Factor", function () {
            it ("Integer", function () {
                let strings = [
                    "1", "12"
                ];
                let match = null;
                strings.forEach((s) => {
                    match = g.match(s, 'Expression');
                    assert.isTrue(match.succeeded());
                    match = g.match(s, 'Factor');
                    assert.isTrue(match.succeeded());
                    match = g.match(s, 'Factor_integer');
                    assert.isTrue(match.succeeded());
                });
            });
            it ("Not Integer", function () {
                let strings = [
                    "1.0", "12.222", "abc123"
                ];
                let match = null;
                strings.forEach((s) => {
                    match = g.match(s, 'Factor_integer');
                    assert.isTrue(match.failed());
                });
            });
            it ("Float", function () {
                let strings = [
                    "1.0", "12.23"
                ];
                let match = null;
                strings.forEach((s) => {
                    match = g.match(s, 'Expression');
                    assert.isTrue(match.succeeded());
                    match = g.match(s, 'Factor');
                    assert.isTrue(match.succeeded());
                    match = g.match(s, 'Factor_float');
                    assert.isTrue(match.succeeded());
                });
            });
            it ("Not Integer", function () {
                let strings = [
                    "10", "abc123"
                ];
                let match = null;
                strings.forEach((s) => {
                    match = g.match(s, 'Factor_float');
                    assert.isTrue(match.failed());
                });
            });
            it ("Literal", function () {
                let strings = [
                    "abc", "abc10", "ABC1"
                ];
                let match = null;
                strings.forEach((s) => {
                    match = g.match(s, 'Expression');
                    assert.isTrue(match.succeeded());
                    match = g.match(s, 'Factor');
                    assert.isTrue(match.succeeded());
                    match = g.match(s, 'Factor_literal');
                    assert.isTrue(match.succeeded());
                });
            });
            it ("Not Literal", function () {
                let strings = [
                    "10abc", "10", "1ABC1", "1.1"
                ];
                let match = null;
                strings.forEach((s) => {
                    match = g.match(s, 'Factor_literal');
                    assert.isTrue(match.failed());
                });
            });
            it ("Negated", function () {
                let strings = [
                    "-abc", "-10.10", "-1"
                ];
                let match = null;
                strings.forEach((s) => {
                    match = g.match(s, 'Expression');
                    assert.isTrue(match.succeeded());
                    match = g.match(s, 'Factor');
                    assert.isTrue(match.succeeded());
                    match = g.match(s, 'Factor_negation');
                    assert.isTrue(match.succeeded());
                });
            });
            it ("Not negation", function () {
                let strings = [
                    "abc", "10", "ABC1", "1.1"
                ];
                let match = null;
                strings.forEach((s) => {
                    match = g.match(s, 'Factor_negation');
                    assert.isTrue(match.failed());
                });
            });
            it ("Negation", function () {
                let strings = [
                    "-abc", "-10.10", "-1"
                ];
                let match = null;
                strings.forEach((s) => {
                    match = g.match(s, 'Expression');
                    assert.isTrue(match.succeeded());
                    match = g.match(s, 'Factor_negation');
                    assert.isTrue(match.succeeded());
                });
            });
            it ("Not negation", function () {
                let strings = [
                    "abc", "10", "ABC1", "1.1"
                ];
                let match = null;
                strings.forEach((s) => {
                    match = g.match(s, 'Factor_negation');
                    assert.isTrue(match.failed());
                });
            });
            describe("Logical Negation", () => {
                it('Matches negation on alpha character string', () => {
                    let string = "not abc";
                    let exprMatch = g.match(string, 'Expression');
                    assert.isTrue(exprMatch.succeeded());
                    let factorMatch = g.match(string, 'Factor');
                    assert.isTrue(factorMatch.succeeded());
                    let factLogNegationMatch = g.match(string, 'Factor_logicalNegation');
                    assert.isTrue(factLogNegationMatch.succeeded());
                });
                it('Matches negation on alpha integer string', () => {
                    let string = "not 10";
                    let exprMatch = g.match(string, 'Expression');
                    assert.isTrue(exprMatch.succeeded());
                    let factorMatch = g.match(string, 'Factor');
                    assert.isTrue(factorMatch.succeeded());
                    let factLogNegationMatch = g.match(string, 'Factor_logicalNegation');
                    assert.isTrue(factLogNegationMatch.succeeded());
                });
                it('Matches negation on alpha float string', () => {
                    let string = "not 10.99";
                    let exprMatch = g.match(string, 'Expression');
                    assert.isTrue(exprMatch.succeeded());
                    let factorMatch = g.match(string, 'Factor');
                    assert.isTrue(factorMatch.succeeded());
                    let factLogNegationMatch = g.match(string, 'Factor_logicalNegation');
                    assert.isTrue(factLogNegationMatch.succeeded());
                });
                it('Matches negation on alpha parenthetical alpha string', () => {
                    let string = "not (abc1)";
                    let exprMatch = g.match(string, 'Expression');
                    assert.isTrue(exprMatch.succeeded());
                    let factorMatch = g.match(string, 'Factor');
                    assert.isTrue(factorMatch.succeeded());
                    let factLogNegationMatch = g.match(string, 'Factor_logicalNegation');
                    assert.isTrue(factLogNegationMatch.succeeded());
                });
            });
            it ("Not logical negation", function () {
                let strings = [
                    "abc", "10", "ABC1", "1.1"
                ];
                let match = null;
                strings.forEach((s) => {
                    match = g.match(s, 'Factor_logicalNegation');
                    assert.isTrue(match.failed());
                });
            });
        });
        it ("Parenthetical", function () {
            let strings = [
                "(1)", "(12.2)", "(abc10)", "( abc )"
            ];
            let match = null;
            strings.forEach((s) => {
                match = g.match(s, 'Expression');
                assert.isTrue(match.succeeded());
                match = g.match(s, 'Expression_parenthetical');
                assert.isTrue(match.succeeded());
            });
        });
        it ("Not Parenthetical", function () {
            let strings = [
                "1", "12.2", "abc10"
            ];
            let match = null;
            strings.forEach((s) => {
                match = g.match(s, 'Expression_parenthetical');
                assert.isTrue(match.failed());
            });
        });
    });
    describe("stringLiteral", () => {
        it('Can deal with a single word', () => {
            let sourceCode = '"this is a test"';
            let match = g.match(sourceCode, 'stringLiteral');
            assert.isTrue(match.succeeded());
        });
        it('Can deal with whitespace', () => {
            let sourceCode = '" \t   hi \t  \s  "';
            let match = g.match(sourceCode, 'stringLiteral');
            assert.isTrue(match.succeeded());
        });
        it('Does not match if newline is present', () => {
            let sourceCode = '"this is a\t\ntest"';
            match = g.match(sourceCode, 'stringLiteral');
            assert.isTrue(match.failed());
        });
    });
    describe("object Id", function () {
        it ("Basic Id", function () {
            let match = g.match("myNewId", "objectId");
            assert.isTrue(match.succeeded());
        });
        it ("Id with letters and digits", function () {
            let match = g.match("newIdl123", "objectId");
            assert.isTrue(match.succeeded());
        });
        it ("Bad objetId (with space)", function () {
            let match = g.match(" badId", "objectId");
            assert.isTrue(match.failed());
        });
        it ("Bad objetId (with space)", function () {
            let match = g.match(" badId", "objectId");
            assert.isTrue(match.failed());
        });
    });
    describe("Parameter List", function () {
        it ("Single param list", function () {
            let match = g.match("param1", "ParameterList");
            assert.isTrue(match.succeeded());
        });
        it ("Simple param list", function () {
            let match = g.match("param1, param2", "ParameterList");
            assert.isTrue(match.succeeded());
        });
        it ("Param list with digits", function () {
            let match = g.match("12, 22, newparam123", "ParameterList");
            assert.isTrue(match.succeeded());
        });
        it ("Bad param list (without spaces)", function () {
            let match = g.match("param1,param2", "ParameterList");
            assert.isTrue(match.failed());
        });
        it ("Bad param list (space)", function () {
            let match = g.match("pa ram1, param2", "ParameterList");
            assert.isTrue(match.failed());
        });
    });
    describe("Global Statement", function () {
        it ("Basic global statement", function () {
            let match = g.match("global param1, param2", "GlobalStatement");
            assert.isTrue(match.succeeded());
        });
        it ("Bad global statement (no space)", function () {
            let match = g.match("globalparam1, param2", "GlobalStatement");
            assert.isTrue(match.failed());
        });
    });
    describe("Commands", function () {
        it ("arrowKey (go to another card)", function () {
            let direction = ["next", "previous"];
            direction.forEach((d) => {
                let match = g.match("go to " + d, "Command_goTo");
                assert.isTrue(match.succeeded());
                match = g.match("go to " + d, "Command");
                assert.isTrue(match.succeeded());
                match = g.match("go to " + d, "Statement");
                assert.isTrue(match.succeeded());
            });
        });
        it ("Bad command (arbitrary with digits)", function () {
            let match = g.match("1234arrowKe", "Command");
            assert.isTrue(match.failed());
        });
        it ("Bad command (arbitrary with space)", function () {
            let match = g.match("aCommand another", "Command");
            assert.isTrue(match.failed());
        });
    });
});
