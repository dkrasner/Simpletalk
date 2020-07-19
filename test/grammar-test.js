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
        it ("Not keyword symbol", function () {
            let match = g.match("myNewSymbol123", "symbol_keyword");
            assert.isTrue(match.failed());
        });
        it ("Keyword symbol", function () {
            let match = g.match("point", "symbol_keyword");
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
    describe("Keyword", function () {
        it ("Matching basic keywords", function () {
            let keywords = [
                "annuity", "compound", "numtochar", "chartonum"
            ];
            let match = null;
            keywords.forEach((k) => {
                match = g.match(k, 'keyword');
                if (!match.succeeded()){console.log(k)};
                assert.isTrue(match.succeeded());
            });
        });
        it ("Matching basic keywords (menu*)", function () {
            let match = g.match('menus', 'keyword');
            assert.isTrue(match.succeeded());
            match = g.match('menu', 'keyword');
            assert.isTrue(match.succeeded());
            match = g.match('menubar', 'keyword');
            assert.isTrue(match.succeeded());
            match = g.match('menuitem', 'keyword');
            assert.isTrue(match.succeeded());
            match = g.match('menuitems', 'keyword');
            assert.isTrue(match.succeeded());
        });
        it ("Matching basic keywords (char*)", function () {
            let match = g.match('characters', 'keyword');
            assert.isTrue(match.succeeded());
            match = g.match('character', 'keyword');
            assert.isTrue(match.succeeded());
            match = g.match('char', 'keyword');
            assert.isTrue(match.succeeded());
            match = g.match('chars', 'keyword');
            assert.isTrue(match.succeeded());
        });
        it ("Matching basic keywords (modifier keys)", function () {
            let match = g.match('characters', 'keyword');
            assert.isTrue(match.succeeded());
            match = g.match('commandkey', 'keyword');
            assert.isTrue(match.succeeded());
            match = g.match('cmdkey', 'keyword');
            assert.isTrue(match.succeeded());
            match = g.match('optionkey', 'keyword');
            assert.isTrue(match.succeeded());
            match = g.match('controlkey', 'keyword');
            assert.isTrue(match.succeeded());
            match = g.match('shiftkey', 'keyword');
            assert.isTrue(match.succeeded());
        });
        it ("Matching basic keywords (item*)", function () {
            let match = g.match('item', 'keyword');
            assert.isTrue(match.succeeded());
            match = g.match('items', 'keyword');
            assert.isTrue(match.succeeded());
        });
        it ("Matching basic keywords (*key)", function () {
            let match = g.match('tabkey', 'keyword');
            assert.isTrue(match.succeeded());
            match = g.match('enterkey', 'keyword');
            assert.isTrue(match.succeeded());
            match = g.match('arrowkey', 'keyword');
            assert.isTrue(match.succeeded());
        });
        it ("Matching basic keywords (actions)", function () {
            let keywords = [
                "add", "answer", "ask", "beep", "choose", "click", "close", "convert",
                "create", "debug", "delete", "dial", "disable", "dissolve", "divide", "drag", "edit",
                "enable", "enterinfield" , "export", "find", "get", "go", "hide" , "import", "lock",
                "mark" , "multiply", "open", "paint", "pass", "play", "pop", "push", "put",
                "read", "reset", "save", "scroll", "speak", "spray", "stack", "stacks", "set", "send", "show", "sort",
                "shrink", "stretch", "subtract", "unlock", "unmark", "wait", "wipe", "write", "zoom"
            ];
            let match = null;
            keywords.forEach((k) => {
                match = g.match(k, 'keyword');
                assert.isTrue(match.succeeded());
            });
        });
        it ("Matching basic keywords (click actions)", function () {
            let keywords = [
                "click", "clickh", "clickchunk", "clickloc", "clickline", "clicktext", "clickv"
            ];
            let match = null;
            keywords.forEach((k) => {
                match = g.match(k, 'keyword');
                assert.isTrue(match.succeeded());
            });
        });
        it ("Matching basic keywords (selected*)", function () {
            let keywords = [
                "selectedchunk", "selectedfield", "selectedline", "selectedloc", "selectedtext"
            ];
            let match = null;
            keywords.forEach((k) => {
                match = g.match(k, 'keyword');
                assert.isTrue(match.succeeded());
            });
        });
        it ("Matching basic keywords (math functions)", function () {
            let keywords = [
                "average", "min", "max", "sum", "random", "sqrt", "trunc", "sin",
                "cos", "tan", "atan", "exp", "exp1", "exp2", "ln", "ln1", "log2", "abs",
            ];
            let match = null;
            keywords.forEach((k) => {
                match = g.match(k, 'keyword');
                assert.isTrue(match.succeeded());
            });
        });
        it ("Matching basic keywords (n'th)", function () {
            let keywords = [
                "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth",
                "tenth", "last"
            ];
            let match = null;
            keywords.forEach((k) => {
                match = g.match(k, 'keyword');
                assert.isTrue(match.succeeded());
            });
        });
        it ("Matching basic keywords (gender)", function () {
            let keywords = [
                "male", "female", "neuter"
            ];
            let match = null;
            keywords.forEach((k) => {
                match = g.match(k, 'keyword');
                assert.isTrue(match.succeeded());
            });
        });
        it ("Matching basic keywords (found*)", function () {
            let keywords = [
                "foundchunk", "foundfield", "foundline", "foundtext"
            ];
            let match = null;
            keywords.forEach((k) => {
                match = g.match(k, 'keyword');
                if (!match.succeeded()){console.log(k)};
                assert.isTrue(match.succeeded());
            });
        });
        it ("Matching basic keywords (mouse*)", function () {
            let keywords = [
                "mouse", "mouseclick", "mouseloc"
            ];
            let match = null;
            keywords.forEach((k) => {
                match = g.match(k, 'keyword');
                if (!match.succeeded()){console.log(k)};
                assert.isTrue(match.succeeded());
            });
        });
        it ("Matching basic keywords (prepositions and related)", function () {
            let keywords = [
                "to", "using", "with", "without", "at", "from", "by", "for", "as", "of"
            ];
            let match = null;
            keywords.forEach((k) => {
                match = g.match(k, 'keyword');
                if (!match.succeeded()){console.log(k)};
                assert.isTrue(match.succeeded());
            });
        });
        it ("Matching basic keywords (quantifiers)", function () {
            let keywords = [
                "any", "all"
            ];
            let match = null;
            keywords.forEach((k) => {
                match = g.match(k, 'keyword');
                if (!match.succeeded()){console.log(k)};
                assert.isTrue(match.succeeded());
            });
        });
        it ("Matching basic keywords (types)", function () {
            let keywords = [
                "logical", "string", "number", "numeric", "datetime",
                "integer", "dateitems", "date", "time",  "times",
                "seconds", "secs", "sec", "bool", "boolean"
            ];
            let match = null;
            keywords.forEach((k) => {
                match = g.match(k, 'keyword');
                if (!match.succeeded()){console.log(k)};
                assert.isTrue(match.succeeded());
            });
        });
        it ("Matching basic keywords (buttons)", function () {
            let keywords = [
                "button", "buttons", "btn", "btns"
            ];
            let match = null;
            keywords.forEach((k) => {
                match = g.match(k, 'keyword');
                if (!match.succeeded()){console.log(k)};
                assert.isTrue(match.succeeded());
            });
        });
        it ("Matching basic keywords (shapes)", function () {
            let keywords = [
                "poly", "polygon", "round", "rect", "rectangle", "screenrect", "point", "line", "lines"
            ];
            let match = null;
            keywords.forEach((k) => {
                match = g.match(k, 'keyword');
                if (!match.succeeded()){console.log(k)};
                assert.isTrue(match.succeeded());
            });
        });
        it ("Matching basic keywords (objects)", function () {
            let keywords = [
                "file" , "tool" , "domenu", "script", "titlebar", "screen", "this", "text",
                "voice", "voices", "window", "windows", "dialog", "part", "parts", "id", "word", "words"
            ];
            let match = null;
            keywords.forEach((k) => {
                match = g.match(k, 'keyword');
                if (!match.succeeded()){console.log(k)};
                assert.isTrue(match.succeeded());
            });
        });
        it ("Matching basic keywords (conditionals)", function () {
            let keywords = [
                "until", "where", "while", "can", "forever"
            ];
            let match = null;
            keywords.forEach((k) => {
                match = g.match(k, 'keyword');
                if (!match.succeeded()){console.log(k)};
                assert.isTrue(match.succeeded());
            });
        });
        it ("Matching basic keywords (directionals)", function () {
            let keywords = [
                "down" , "up", "left", "right", "next", "offset", "prev", "previous"
            ];
            let match = null;
            keywords.forEach((k) => {
                match = g.match(k, 'keyword');
                if (!match.succeeded()){console.log(k)};
                assert.isTrue(match.succeeded());
            });
        });
        it ("Matching basic keywords (directionals)", function () {
            let keywords = [
                "bottom", "top", "center", "middle", "mid", "whole", "start"
            ];
            let match = null;
            keywords.forEach((k) => {
                match = g.match(k, 'keyword');
                if (!match.succeeded()){console.log(k)};
                assert.isTrue(match.succeeded());
            });
        });
        it ("matching basic keywords (background refs)", function () {
            let keywords = [
                "background", "backgrounds", "bkgnd", "bkgnds", "bg", "bgs"
            ];
            let match = null;
            keywords.forEach((k) => {
                match = g.match(k, 'keyword');
                if (!match.succeeded()){console.log(k)};
                assert.isTrue(match.succeeded());
            });
        });
        it ("matching basic keywords (card refs)", function () {
            let keywords = [
                "card", "cards", "cd", "cds"
            ];
            let match = null;
            keywords.forEach((k) => {
                match = g.match(k, 'keyword');
                if (!match.succeeded()){console.log(k)};
                assert.isTrue(match.succeeded());
            });
        });
        it ("matching basic keywords (field refs)", function () {
            let keywords = [
                "field", "fields", "fld", "flds"
            ];
            let match = null;
            keywords.forEach((k) => {
                match = g.match(k, 'keyword');
                if (!match.succeeded()){console.log(k)};
                assert.isTrue(match.succeeded());
            });
        });
        it ("matching basic keywords (param refs)", function () {
            let keywords = [
                "param", "params", "paramcount"
            ];
            let match = null;
            keywords.forEach((k) => {
                match = g.match(k, 'keyword');
                if (!match.succeeded()){console.log(k)};
                assert.isTrue(match.succeeded());
            });
        });
        it ("matching basic keywords (colors)", function () {
            let keywords = [
                "black", "gray", "grey", "white"
            ];
            let match = null;
            keywords.forEach((k) => {
                match = g.match(k, 'keyword');
                if (!match.succeeded()){console.log(k)};
                assert.isTrue(match.succeeded());
            });
        });
        it ("matching basic keywords (adjectives/adverbs)", function () {
            let keywords = [
                "short", "long", "ascending", "descending", "marked", "abbreviated", "abbrev", "abbr",
                "regular", "reg", "slowly", "slow", "fast", "very", "plain", "inverse",
                "international", "visual", "robotic", "english", "finding"
            ];
            let match = null;
            keywords.forEach((k) => {
                match = g.match(k, 'keyword');
                if (!match.succeeded()){console.log(k)};
                assert.isTrue(match.succeeded());
            });
        });
        it ("matching basic keywords (other objects)", function () {
            let keywords = [
                "sound", "speech", "systemversion", "diskspace", "commandkeydown", "checkpoint", "effect",
                "picture", "pict", "barn", "door", "checkerboard", "iris", "venetian", "blinds", "tick", "ticks",
                "messages", "msg", "box", "result", "value", "length", "keydown", "type", "pattern", "watcher",
                "variable",  "password", "selection", "tempo"
            ];
            let match = null;
            keywords.forEach((k) => {
                match = g.match(k, 'keyword');
                if (!match.succeeded()){console.log(k)};
                assert.isTrue(match.succeeded());
            });
        });
        it ("Not Matching basic keywords", function () {
            let match = g.match('found', 'keyword');
            assert.isTrue(match.failed());
        });
        it ("Not Matching basic keywords", function () {
            let match = g.match('menuBAD', 'keyword');
            assert.isTrue(match.failed());
        });
        it ("Not Matching basic keywords", function () {
            let match = g.match('exp3', 'keyword');
            assert.isTrue(match.failed());
        });
        it ("Not Matching basic keywords", function () {
            let match = g.match('clicklocchunk', 'keyword');
            assert.isTrue(match.failed());
        });
        it ("Not Matching basic keywords", function () {
            let match = g.match('beep ', 'keyword');
            assert.isTrue(match.failed());
        });
        it ("Not Matching basic keywords", function () {
            let match = g.match('beep123', 'keyword');
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
