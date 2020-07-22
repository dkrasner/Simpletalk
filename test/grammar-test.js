var ohm = require('ohm-js');
// Instantiate the grammar.
var fs = require('fs');
var g = ohm.grammar(fs.readFileSync('./js/ohm/simpletalk.ohm'));

var chai = require('chai');
var assert = chai.assert;


describe("SimpleTalk Grammar", function () {
    describe("Script Handler", function () {
        // TODO
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
    describe("Functions", function () {
        it ("Built in math functions", function () {
            let keyword = [
                "average", "min", "max", "sum", "random", "sqrt", "trunc", "sin",
                "cos", "tan", "atan", "exp", "ln", "abs",
            ];
            let match = null;
            keyword.forEach((k) => {
                match = g.match(k, 'builtInMathFunction');
                assert.isTrue(match.succeeded());
            });
        });
        it ("Modifier key functions", function () {
            let match = g.match('characters', 'keywordWC');
            assert.isTrue(match.succeeded());
            match = g.match('commandkey', 'keywordWC');
            assert.isTrue(match.succeeded());
            match = g.match('cmdkey', 'keywordWC');
            assert.isTrue(match.succeeded());
            match = g.match('optionkey', 'keywordWC');
            assert.isTrue(match.succeeded());
            match = g.match('controlkey', 'keywordWC');
            assert.isTrue(match.succeeded());
            match = g.match('shiftkey', 'keywordWC');
            assert.isTrue(match.succeeded());
        });
    });
    describe("Statement", function () {
        it ("Global Statement", function () {
            let match = g.match("global param1, param2", "statement");
            assert.isTrue(match.succeeded());
        });
    });
    describe("Symbol", function () {
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
        it ("Simple param list", function () {
            let match = g.match("param1, param2", "parameterList");
            assert.isTrue(match.succeeded());
        });
        it ("Param list with symbols", function () {
            let match = g.match("top, bottom, newparam123", "parameterList");
            assert.isTrue(match.succeeded());
        });
        it ("Bad param list (with spaces)", function () {
            let match = g.match("param1,param2", "parameterList");
            assert.isTrue(match.failed());
        });
        it ("Bad param list (bad symbol)", function () {
            let match = g.match("1symbolbad,param2", "parameterList");
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
    describe("Keyword", function () {
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
    describe("Testing comments", function () {
        it ("basic comment general match", function () {
            let match = g.match('--thisisabadcomment');
            assert.isTrue(match.succeeded());
        });
        it ("basic comment specific match", function () {
            let match = g.match('--thisisabadcomment', 'comment');
            assert.isTrue(match.succeeded());
        });
        it.skip("bad comment", function () {
            let match = g.match('--ab c');
            assert.isTrue(match.failed());
        });
    });
    });
})
