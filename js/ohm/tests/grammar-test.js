var ohm = require('ohm-js');
// Instantiate the grammar.
var fs = require('fs');
var g = ohm.grammar(fs.readFileSync('./js/ohm/simpletalk.ohm'));

var chai = require('chai');
var assert = chai.assert;


describe("SimpleTalk Grammar", function () {
    // TODO add more tests for handlers, comments, end etc
    describe("Script Handler", function () {
        it ("Message handler (args, single statement)", function () {
            let s = `on myNewMessage arg1, arg2
            global var1, var\nend myNewMessage`
            let match = g.match(s);
            assert.isTrue(match.succeeded())
            match = g.match(s, 'messageHandler');
            assert.isTrue(match.succeeded())
        });
        it ("Function handler (args, statements)", function () {
            let s = `function myNewFunc(arg1, arg2)
            global var1, var
            global var1, var\nend myNewFunc`
            let match = g.match(s);
            assert.isTrue(match.succeeded())
            match = g.match(s, 'functionHandler');
            assert.isTrue(match.succeeded())
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
            let match = g.match(s, 'messageHandler');
            assert.isTrue(match.succeeded());
        });
        it ("Message handler (args, no statements)", function () {
            let s = `on myNewMessage arg1, arg2\nend myNewMessage`
            let match = g.match(s, 'messageHandler');
            assert.isTrue(match.succeeded());
        });
        it ("Message handler (args, single statement)", function () {
            let s = `on myNewMessage arg1, arg2
            global var1, var\nend myNewMessage`
            let match = g.match(s, 'messageHandler');
            assert.isTrue(match.succeeded())
        });
        it ("Message handler (args, statements)", function () {
            let s = `on myNewMessage arg1, arg2
            global var1, var
            global var1, var\nend myNewMessage`
            let match = g.match(s, 'messageHandler');
            assert.isTrue(match.succeeded())
        });
        it ("Message handler (args, statements with 'pass' control flow)", function () {
            let s = `on myNewMessage arg1, arg2
            global var1, var
            global var1, var
            pass myNewMessage\nend myNewMessage`
            let match = g.match(s, 'messageHandler');
            assert.isTrue(match.succeeded())
        });
        it ("Message handler (args, statements with 'exit' control flow)", function () {
            let s = `on myNewMessage arg1, arg2
            global var1, var
            exit myNewMessage\nend myNewMessage`
            let match = g.match(s, 'messageHandler');
            assert.isTrue(match.succeeded())
            s = `on myNewMessage arg1, arg2
            global var1, var
            global var1, var
            exit to SimpleCard\nend myNewMessage`
            match = g.match(s, 'messageHandler');
            assert.isTrue(match.succeeded())
        });
        it ("Bad Message handler (missing 'on' keyword)", function () {
            let s = `notkeyword myNewMessage arg1, arg2
            global var1, var
            global var1, var\nend myNewMessage`
            let match = g.match(s, 'messageHandler');
            assert.isTrue(match.failed())
        });
        it ("Bad Message handler (missing 'end' keyword)", function () {
            let s = `on myNewMessage arg1, arg2
            global var1, var
            global var1, var\nmyNewMessage`
            let match = g.match(s, 'messageHandler');
            assert.isTrue(match.failed())
        });
        it ("Bad Message handler ('()')", function () {
            let s = `on myNewMessage(arg1, arg2)
            global var1, var
            global var1, var\nend myNewMessage`
            let match = g.match(s, 'messageHandler');
            assert.isTrue(match.failed())
        });
        it ("Built in message syntax", function () {
            let strings = [
                "close", "closeStack", "commandKeyDown", "quit"
            ];
            let match = null;
            strings.forEach((s) => {
                match = g.match(s, 'message');
                assert.isTrue(match.succeeded());
                match = g.match(s, 'message_system');
                assert.isTrue(match.succeeded());
            });
        });
        it ("Authored in message syntax", function () {
            let strings = [
                "myNewMessage", "myNewMessage arg1", "myNewMessage arg1, arg2", "myNewMessage 50"
            ];
            let match = null;
            strings.forEach((s) => {
                match = g.match(s, 'message');
                assert.isTrue(match.succeeded());
                match = g.match(s, 'message_authoredMessage');
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
                    match = g.match(s, 'message');
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
                    match = g.match(s, 'message');
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
                    match = g.match(s, 'message');
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
                    match = g.match(s, 'message');
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
                    match = g.match(s, 'message');
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
                    match = g.match(s, 'message');
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
                    match = g.match(s, 'message');
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
            let match = g.match(s, 'functionHandler');
            assert.isTrue(match.succeeded());
        });
        it ("Function handler (args, no statements)", function () {
            let s = `function myNewFunc(arg1, arg2)\nend myNewFunc`
            let match = g.match(s, 'functionHandler');
            assert.isTrue(match.succeeded());
        });
        it ("Function handler (args, single statement)", function () {
            let s = `function myNewFunc(arg1, arg2)
            global var1, var\nend myNewFunc`
            let match = g.match(s, 'functionHandler');
            assert.isTrue(match.succeeded())
        });
        it ("Function handler (args, statements)", function () {
            let s = `function myNewFunc(arg1, arg2)
            global var1, var
            global var1, var\nend myNewFunc`
            let match = g.match(s, 'functionHandler');
            assert.isTrue(match.succeeded())
        });
        it ("Function handler (args, statements with 'pass' control flow)", function () {
            let s = `function myNewFunc(arg1, arg2)
            global var1, var
            global var1, var
            pass myNewFunc\nend myNewFunc`
            let match = g.match(s, 'functionHandler');
            assert.isTrue(match.succeeded())
        });
        it ("Function handler (args, statements with 'exit' control flow)", function () {
            let s = `function myNewFunc(arg1, arg2)
            global var1, var
            exit myNewFunc\nend myNewFunc`
            let match = g.match(s, 'functionHandler');
            assert.isTrue(match.succeeded())
            s = `function myNewFunc(arg1, arg2)
            global var1, var
            global var1, var
            exit to SimpleCard\nend myNewFunc`
            match = g.match(s, 'functionHandler');
            assert.isTrue(match.succeeded())
        });
        it ("Bad Function handler (missing 'function' keyword)", function () {
            let s = `funct myNewFunc(arg1, arg2)
            global var1, var
            global var1, var\nend myNewFunc`
            let match = g.match(s, 'functionHandler');
            assert.isTrue(match.failed())
        });
        it ("Bad Function handler (missing 'end' keyword)", function () {
            let s = `function myNewFunc(arg1, arg2)
            global var1, var
            global var1, var\nmyNewFunc`
            let match = g.match(s, 'functionHandler');
            assert.isTrue(match.failed())
        });
        it ("Bad Function handler (missing '()')", function () {
            let s = `function myNewFunc arg1, arg2
            global var1, var
            global var1, var\nend myNewFunc`
            let match = g.match(s, 'functionHandler');
            assert.isTrue(match.failed())
        });
        it ("Built in function syntax", function () {
            let strings = [
                "average()", "tan()", "mouseClick()", "sin(30)"
            ];
            let match = null;
            strings.forEach((s) => {
                match = g.match(s, 'function');
                assert.isTrue(match.succeeded());
                match = g.match(s, 'function_builtInFunction');
                assert.isTrue(match.succeeded());
            });
        });
        it ("Authored in function syntax", function () {
            let strings = [
                "myNewFun()", "myNewFun(arg1)", "myNewFun(arg1, arg2)", "myNewFun(50)"
            ];
            let match = null;
            strings.forEach((s) => {
                match = g.match(s, 'function');
                assert.isTrue(match.succeeded());
                match = g.match(s, 'function_authoredFunction');
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
            let match = g.match("global param1, param2", "statement");
            assert.isTrue(match.succeeded());
        });
    });
    describe("Statement List", function () {
        it ("Single statement statement list", function () {
            let s = `global param1, param2\n`;
            let match = g.match(s, "statementList");
            assert.isTrue(match.succeeded());
        });
        it ("Bad single statement statement list (no newline)", function () {
            let s = `global param1, param2`;
            let match = g.match(s, "statementList");
            assert.isTrue(match.failed());
        });
        it ("Multi statement statement list", function () {
            let s = ` global param1, param2\n
            global param1, param2\n`
            ;
            let match = g.match(s, "statementList");
            assert.isTrue(match.succeeded());
        });
        it ("Bad multi statement statement list (no newline)", function () {
            let s = ` global param1, param2\t
            global param1, param2\n`
            ;
            let match = g.match(s, "statementList");
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
                    match = g.match(s, 'expression');
                    assert.isTrue(match.succeeded());
                    match = g.match(s, 'factor');
                    assert.isTrue(match.succeeded());
                    match = g.match(s, 'factor_integer');
                    assert.isTrue(match.succeeded());
                });
            });
            it ("Not Integer", function () {
                let strings = [
                    "1.0", "12.222", "abc123"
                ];
                let match = null;
                strings.forEach((s) => {
                    match = g.match(s, 'factor_integer');
                    assert.isTrue(match.failed());
                });
            });
            it ("Float", function () {
                let strings = [
                    "1.0", "12.23"
                ];
                let match = null;
                strings.forEach((s) => {
                    match = g.match(s, 'expression');
                    assert.isTrue(match.succeeded());
                    match = g.match(s, 'factor');
                    assert.isTrue(match.succeeded());
                    match = g.match(s, 'factor_float');
                    assert.isTrue(match.succeeded());
                });
            });
            it ("Not Integer", function () {
                let strings = [
                    "10", "abc123"
                ];
                let match = null;
                strings.forEach((s) => {
                    match = g.match(s, 'factor_float');
                    assert.isTrue(match.failed());
                });
            });
            it ("Literal", function () {
                let strings = [
                    "abc", "abc10", "ABC1"
                ];
                let match = null;
                strings.forEach((s) => {
                    match = g.match(s, 'expression');
                    assert.isTrue(match.succeeded());
                    match = g.match(s, 'factor');
                    assert.isTrue(match.succeeded());
                    match = g.match(s, 'factor_literal');
                    assert.isTrue(match.succeeded());
                });
            });
            it ("Not Literal", function () {
                let strings = [
                    "10abc", "10", "1ABC1", "1.1"
                ];
                let match = null;
                strings.forEach((s) => {
                    match = g.match(s, 'factor_literal');
                    assert.isTrue(match.failed());
                });
            });
            it ("Negated", function () {
                let strings = [
                    "-abc", "-10.10", "-1"
                ];
                let match = null;
                strings.forEach((s) => {
                    match = g.match(s, 'expression');
                    assert.isTrue(match.succeeded());
                    match = g.match(s, 'factor');
                    assert.isTrue(match.succeeded());
                    match = g.match(s, 'factor_negation');
                    assert.isTrue(match.succeeded());
                });
            });
            it ("Not negation", function () {
                let strings = [
                    "abc", "10", "ABC1", "1.1"
                ];
                let match = null;
                strings.forEach((s) => {
                    match = g.match(s, 'factor_negation');
                    assert.isTrue(match.failed());
                });
            });
            it ("Negation", function () {
                let strings = [
                    "-abc", "-10.10", "-1"
                ];
                let match = null;
                strings.forEach((s) => {
                    match = g.match(s, 'expression');
                    assert.isTrue(match.succeeded());
                    match = g.match(s, 'factor_negation');
                    assert.isTrue(match.succeeded());
                });
            });
            it ("Not negation", function () {
                let strings = [
                    "abc", "10", "ABC1", "1.1"
                ];
                let match = null;
                strings.forEach((s) => {
                    match = g.match(s, 'factor_negation');
                    assert.isTrue(match.failed());
                });
            });
            it ("Logical Negation", function () {
                let strings = [
                    "not abc", "not 1", "not 10.10", "not (abc10)"
                ];
                let match = null;
                strings.forEach((s) => {
                    match = g.match(s, 'expression');
                    assert.isTrue(match.succeeded());
                    match = g.match(s, 'factor');
                    assert.isTrue(match.succeeded());
                    match = g.match(s, 'factor_logicalNegation');
                    assert.isTrue(match.succeeded());
                });
            });
            it ("Not logical negation", function () {
                let strings = [
                    "abc", "10", "ABC1", "1.1"
                ];
                let match = null;
                strings.forEach((s) => {
                    match = g.match(s, 'factor_logicalNegation');
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
                match = g.match(s, 'expression');
                assert.isTrue(match.succeeded());
                match = g.match(s, 'expression_parenthetical');
                assert.isTrue(match.succeeded());
            });
        });
        it ("Not Parenthetical", function () {
            let strings = [
                "1", "12.2", "abc10"
            ];
            let match = null;
            strings.forEach((s) => {
                match = g.match(s, 'expression_parenthetical');
                assert.isTrue(match.failed());
            });
        });
    });
    describe("Id", function () {
        it ("Basic Id", function () {
            let match = g.match("myNewId", "id");
            assert.isTrue(match.succeeded());
        });
        it ("Id with letters and digits", function () {
            let match = g.match("newIdl123", "id");
            assert.isTrue(match.succeeded());
        });
        it ("Bad id (with space)", function () {
            let match = g.match(" badId", "id");
            assert.isTrue(match.failed());
        });
        it ("Bad id (with space)", function () {
            let match = g.match(" badId", "id");
            assert.isTrue(match.failed());
        });
        it ("Bad id (digit start)", function () {
            let match = g.match("1badId", "id");
            assert.isTrue(match.failed());
        });
    });
    describe("Parameter List", function () {
        it ("Single param list", function () {
            let match = g.match("param1", "parameterList");
            assert.isTrue(match.succeeded());
        });
        it ("Simple param list", function () {
            let match = g.match("param1, param2", "parameterList");
            assert.isTrue(match.succeeded());
        });
        it ("Param list with digits", function () {
            let match = g.match("12, 22, newparam123", "parameterList");
            assert.isTrue(match.succeeded());
        });
        it ("Bad param list (without spaces)", function () {
            let match = g.match("param1,param2", "parameterList");
            assert.isTrue(match.failed());
        });
        it ("Bad param list (space)", function () {
            let match = g.match("pa ram1, param2", "parameterList");
            assert.isTrue(match.failed());
        });
        it ("Bad param list (start space)", function () {
            let match = g.match(" param1, param2", "parameterList");
            assert.isTrue(match.failed());
        });
    });
    describe("Global Statement", function () {
        it ("Basic global statement", function () {
            let match = g.match("global param1, param2", "globalStatement");
            assert.isTrue(match.succeeded());
        });
        it ("Bad global statement (no space)", function () {
            let match = g.match("globalparam1, param2", "globalStatement");
            assert.isTrue(match.failed());
        });
        it ("Bad global statement (starts with space)", function () {
            let match = g.match(" global param1, param2", "globalStatement");
            assert.isTrue(match.failed());
        });
    });
    describe("Commands", function () {
        it ("arrowKey (go to another card)", function () {
            let direction = ["up", "down", "left", "right"];
            direction.forEach((d) => {
                let match = g.match("arrowKey " + d, "command_arrowCardNavigation");
                assert.isTrue(match.succeeded());
                match = g.match("arrowKey " + d, "command");
                assert.isTrue(match.succeeded());
                match = g.match("arrowKey " + d, "statement");
                assert.isTrue(match.succeeded());
            });
        });
        it ("Bad command (no space)", function () {
            let match = g.match("arrowKeyup", "command");
            assert.isTrue(match.failed());
        });
        it ("Bad command (starts with space)", function () {
            let match = g.match(" arrowKey up", "command");
            assert.isTrue(match.failed());
        });
    });
    describe.skip("Symbol", function () {
        it ("Authored symbol", function () {
            let match = g.match("myNewSymbol", "symbol_authored");
            assert.isTrue(match.succeeded());
        });
        it ("Authored symbol", function () {
            let match = g.match("myNewSymbol123", "symbol_authored");
            assert.isTrue(match.succeeded());
        });
        it ("Badly Authored symbol", function () {
            let match = g.match(" myNewSymbol123", "symbol_authored");
            assert.isTrue(match.failed());
        });
        it ("Badly Authored symbol", function () {
            let match = g.match("1myNewSymbol123", "symbol_authored");
            assert.isTrue(match.failed());
        });
        it ("Not keywordWC symbol", function () {
            let match = g.match("myNewSymbol123", "symbol_keywordWC");
            assert.isTrue(match.failed());
        });
        it ("Keyword symbol", function () {
            let match = g.match("point", "symbol_keywordWC");
            assert.isTrue(match.succeeded());
        });
        it ("Authored or Keyword symbol", function () {
            let match = g.match("point", "symbol");
            assert.isTrue(match.succeeded());
        });
        it ("Authored or Keyword symbol", function () {
            let match = g.match("aPrettyGoodSymbol123", "symbol");
            assert.isTrue(match.succeeded());
        });
        it ("Neither Authored nor Keyword symbol", function () {
            let match = g.match("1notaGoodSymbol123", "symbol");
            assert.isTrue(match.failed());
        });
    });
    describe.skip("Keyword", function () {
        it ("Matching basic keywords", function () {
            let keywordWCs = [
                "do", "next", "else", "on", "end", "pass", "exit", "repeat",
                "function", "return", "global", "send", "if", "then"
            ];
            let match = null;
            keywordWCs.forEach((k) => {
                match = g.match(k, 'keyword');
                assert.isTrue(match.succeeded());
            });
        });
        it ("Matching basic keywordWCs", function () {
            let keywordWCs = [
                "annuity", "compound", "numtochar", "chartonum"
            ];
            let match = null;
            keywordWCs.forEach((k) => {
                match = g.match(k, 'keywordWC');
                assert.isTrue(match.succeeded());
            });
        });
        it ("Matching basic keywordWCs (menu*)", function () {
            let match = g.match('menus', 'keywordWC');
            assert.isTrue(match.succeeded());
            match = g.match('menu', 'keywordWC');
            assert.isTrue(match.succeeded());
            match = g.match('menubar', 'keywordWC');
            assert.isTrue(match.succeeded());
            match = g.match('menuitem', 'keywordWC');
            assert.isTrue(match.succeeded());
            match = g.match('menuitems', 'keywordWC');
            assert.isTrue(match.succeeded());
        });
        it ("Matching basic keywordWCs (char*)", function () {
            let match = g.match('characters', 'keywordWC');
            assert.isTrue(match.succeeded());
            match = g.match('character', 'keywordWC');
            assert.isTrue(match.succeeded());
            match = g.match('char', 'keywordWC');
            assert.isTrue(match.succeeded());
            match = g.match('chars', 'keywordWC');
            assert.isTrue(match.succeeded());
        });
        it ("Matching basic keywordWCs (item*)", function () {
            let match = g.match('item', 'keywordWC');
            assert.isTrue(match.succeeded());
            match = g.match('items', 'keywordWC');
            assert.isTrue(match.succeeded());
        });
        it ("Matching basic keywordWCs (*key)", function () {
            let match = g.match('tabkey', 'keywordWC');
            assert.isTrue(match.succeeded());
            match = g.match('enterkey', 'keywordWC');
            assert.isTrue(match.succeeded());
            match = g.match('arrowkey', 'keywordWC');
            assert.isTrue(match.succeeded());
        });
        it ("Matching basic keywordWCs (actions)", function () {
            let keywordWCs = [
                "add", "answer", "ask", "beep", "choose", "click", "close", "convert",
                "create", "debug", "delete", "dial", "disable", "dissolve", "divide", "drag", "edit",
                "enable", "enterinfield" , "export", "find", "get", "go", "hide" , "import", "lock",
                "mark" , "multiply", "open", "paint",  "play", "pop", "push", "put",
                "read", "reset", "save", "scroll", "speak", "spray", "stack", "stacks", "set",  "show", "sort",
                "shrink", "stretch", "subtract", "unlock", "unmark", "wait", "wipe", "write", "zoom"
            ];
            let match = null;
            keywordWCs.forEach((k) => {
                match = g.match(k, 'keywordWC');
                assert.isTrue(match.succeeded());
            });
        });
        it ("Matching basic keywordWCs (click actions)", function () {
            let keywordWCs = [
                "click", "clickh", "clickchunk", "clickloc", "clickline", "clicktext", "clickv"
            ];
            let match = null;
            keywordWCs.forEach((k) => {
                match = g.match(k, 'keywordWC');
                assert.isTrue(match.succeeded());
            });
        });
        it ("Matching basic keywordWCs (selected*)", function () {
            let keywordWCs = [
                "selectedchunk", "selectedfield", "selectedline", "selectedloc", "selectedtext"
            ];
            let match = null;
            keywordWCs.forEach((k) => {
                match = g.match(k, 'keywordWC');
                assert.isTrue(match.succeeded());
            });
        });
        it ("Matching basic keywordWCs (n'th)", function () {
            let keywordWCs = [
                "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth",
                "tenth", "last"
            ];
            let match = null;
            keywordWCs.forEach((k) => {
                match = g.match(k, 'keywordWC');
                assert.isTrue(match.succeeded());
            });
        });
        it ("Matching basic keywordWCs (gender)", function () {
            let keywordWCs = [
                "male", "female", "neuter"
            ];
            let match = null;
            keywordWCs.forEach((k) => {
                match = g.match(k, 'keywordWC');
                assert.isTrue(match.succeeded());
            });
        });
        it ("Matching basic keywordWCs (found*)", function () {
            let keywordWCs = [
                "foundchunk", "foundfield", "foundline", "foundtext"
            ];
            let match = null;
            keywordWCs.forEach((k) => {
                match = g.match(k, 'keywordWC');
                assert.isTrue(match.succeeded());
            });
        });
        it ("Matching basic keywordWCs (mouse*)", function () {
            let keywordWCs = [
                "mouse", "mouseclick", "mouseloc"
            ];
            let match = null;
            keywordWCs.forEach((k) => {
                match = g.match(k, 'keywordWC');
                assert.isTrue(match.succeeded());
            });
        });
        it ("Matching basic keywordWCs (prepositions and related)", function () {
            let keywordWCs = [
                "to", "using", "with", "without", "at", "from", "by", "for", "as", "of"
            ];
            let match = null;
            keywordWCs.forEach((k) => {
                match = g.match(k, 'keywordWC');
                assert.isTrue(match.succeeded());
            });
        });
        it ("Matching basic keywordWCs (quantifiers)", function () {
            let keywordWCs = [
                "any", "all"
            ];
            let match = null;
            keywordWCs.forEach((k) => {
                match = g.match(k, 'keywordWC');
                assert.isTrue(match.succeeded());
            });
        });
        it ("Matching basic keywordWCs (types)", function () {
            let keywordWCs = [
                "logical", "string", "number", "numeric", "datetime",
                "integer", "dateitems", "date", "time",  "times",
                "seconds", "secs", "sec", "bool", "boolean"
            ];
            let match = null;
            keywordWCs.forEach((k) => {
                match = g.match(k, 'keywordWC');
                assert.isTrue(match.succeeded());
            });
        });
        it ("Matching basic keywordWCs (buttons)", function () {
            let keywordWCs = [
                "button", "buttons", "btn", "btns"
            ];
            let match = null;
            keywordWCs.forEach((k) => {
                match = g.match(k, 'keywordWC');
                assert.isTrue(match.succeeded());
            });
        });
        it ("Matching basic keywordWCs (shapes)", function () {
            let keywordWCs = [
                "poly", "polygon", "round", "rect", "rectangle", "screenrect", "point", "line", "lines"
            ];
            let match = null;
            keywordWCs.forEach((k) => {
                match = g.match(k, 'keywordWC');
                assert.isTrue(match.succeeded());
            });
        });
        it ("Matching basic keywordWCs (objects)", function () {
            let keywordWCs = [
                "file" , "tool" , "domenu", "script", "titlebar", "screen", "this", "text",
                "voice", "voices", "window", "windows", "dialog", "part", "parts", "id", "word", "words"
            ];
            let match = null;
            keywordWCs.forEach((k) => {
                match = g.match(k, 'keywordWC');
                assert.isTrue(match.succeeded());
            });
        });
        it ("Matching basic keywordWCs (conditionals)", function () {
            let keywordWCs = [
                "until", "where", "while", "can", "forever"
            ];
            let match = null;
            keywordWCs.forEach((k) => {
                match = g.match(k, 'keywordWC');
                assert.isTrue(match.succeeded());
            });
        });
        it ("Matching basic keywordWCs (directionals)", function () {
            let keywordWCs = [
                "down" , "up", "left", "right", "next", "offset", "prev", "previous"
            ];
            let match = null;
            keywordWCs.forEach((k) => {
                match = g.match(k, 'keywordWC');
                assert.isTrue(match.succeeded());
            });
        });
        it ("Matching basic keywordWCs (directionals)", function () {
            let keywordWCs = [
                "bottom", "top", "center", "middle", "mid", "whole", "start"
            ];
            let match = null;
            keywordWCs.forEach((k) => {
                match = g.match(k, 'keywordWC');
                assert.isTrue(match.succeeded());
            });
        });
        it ("matching basic keywordWCs (background refs)", function () {
            let keywordWCs = [
                "background", "backgrounds", "bkgnd", "bkgnds", "bg", "bgs"
            ];
            let match = null;
            keywordWCs.forEach((k) => {
                match = g.match(k, 'keywordWC');
                assert.isTrue(match.succeeded());
            });
        });
        it ("matching basic keywordWCs (card refs)", function () {
            let keywordWCs = [
                "card", "cards", "cd", "cds"
            ];
            let match = null;
            keywordWCs.forEach((k) => {
                match = g.match(k, 'keywordWC');
                assert.isTrue(match.succeeded());
            });
        });
        it ("matching basic keywordWCs (field refs)", function () {
            let keywordWCs = [
                "field", "fields", "fld", "flds"
            ];
            let match = null;
            keywordWCs.forEach((k) => {
                match = g.match(k, 'keywordWC');
                assert.isTrue(match.succeeded());
            });
        });
        it ("matching basic keywordWCs (param refs)", function () {
            let keywordWCs = [
                "param", "params", "paramcount"
            ];
            let match = null;
            keywordWCs.forEach((k) => {
                match = g.match(k, 'keywordWC');
                assert.isTrue(match.succeeded());
            });
        });
        it ("matching basic keywordWCs (colors)", function () {
            let keywordWCs = [
                "black", "gray", "grey", "white"
            ];
            let match = null;
            keywordWCs.forEach((k) => {
                match = g.match(k, 'keywordWC');
                assert.isTrue(match.succeeded());
            });
        });
        it ("matching basic keywordWCs (adjectives/adverbs)", function () {
            let keywordWCs = [
                "short", "long", "ascending", "descending", "marked", "abbreviated", "abbrev", "abbr",
                "regular", "reg", "slowly", "slow", "fast", "very", "plain", "inverse",
                "international", "visual", "robotic", "english", "finding"
            ];
            let match = null;
            keywordWCs.forEach((k) => {
                match = g.match(k, 'keywordWC');
                assert.isTrue(match.succeeded());
            });
        });
        it ("matching basic keywordWCs (other objects)", function () {
            let keywordWCs = [
                "sound", "speech", "systemversion", "diskspace", "commandkeydown", "checkpoint", "effect",
                "picture", "pict", "barn", "door", "checkerboard", "iris", "venetian", "blinds", "tick", "ticks",
                "messages", "msg", "box", "result", "value", "length", "keydown", "type", "pattern", "watcher",
                "variable",  "password", "selection", "tempo"
            ];
            let match = null;
            keywordWCs.forEach((k) => {
                match = g.match(k, 'keywordWC');
                assert.isTrue(match.succeeded());
            });
        });
        it ("Not Matching basic keywordWCs", function () {
            let match = g.match('found', 'keywordWC');
            assert.isTrue(match.failed());
        });
        it ("Not Matching basic keywordWCs", function () {
            let match = g.match('menuBAD', 'keywordWC');
            assert.isTrue(match.failed());
        });
        it ("Not Matching basic keywordWCs", function () {
            let match = g.match('exp3', 'keywordWC');
            assert.isTrue(match.failed());
        });
        it ("Not Matching basic keywordWCs", function () {
            let match = g.match('clicklocchunk', 'keywordWC');
            assert.isTrue(match.failed());
        });
        it ("Not Matching basic keywordWCs", function () {
            let match = g.match('beep ', 'keywordWC');
            assert.isTrue(match.failed());
        });
        it ("Not Matching basic keywordWCs", function () {
            let match = g.match('beep123', 'keywordWC');
            assert.isTrue(match.failed());
        });
    describe.skip("Testing comments", function () {
        it ("basic comment general match", function () {
            let match = g.match('--thisisabadcomment');
            assert.isTrue(match.succeeded());
        });
        it ("basic comment specific match", function () {
            let match = g.match('--thisisabadcomment', 'comment');
            assert.isTrue(match.succeeded());
        });
        it ("bad comment", function () {
            let match = g.match('--ab c');
            assert.isTrue(match.failed());
        });
    });
    });
})
