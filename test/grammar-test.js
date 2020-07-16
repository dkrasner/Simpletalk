var ohm = require('ohm-js');
// Instantiate the grammar.
var fs = require('fs');
var g = ohm.grammar(fs.readFileSync('./js/ohm/simpletalk.ohm'));

var chai = require('chai');
var assert = chai.assert;


describe("SimpleTalk Grammar", function () {
    describe("Script Handler Tests", function () {
        // TODO
        });
    describe("Keyword Tests", function () {
        it ("Matching basic keywords", function () {
            let match = g.match('beep', 'keyword');
            assert.isTrue(match.succeeded());
        });
        it ("Matching basic keywords", function () {
            let match = g.match('mouse', 'keyword');
            assert.isTrue(match.succeeded());
        });
        it ("Matching basic keywords", function () {
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
            match = g.match('chartonum', 'keyword');
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
                "create", "debug", "delete", "dial", "disable", "divide", "drag", "edit",
                "enable", "enterinfield" , "export", "find", "get", "go", "hide" , "import", "lock",
                "mark" , "multiply", "open", "paint", "pass", "play", "pop", "push", "put",
                "read", "reset", "save", "scroll", "speak", "stack", "set", "send", "show", "sort",
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
                "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth"
            ];
            let match = null;
            keywords.forEach((k) => {
                match = g.match(k, 'keyword');
                if (!match.succeeded()){console.log(k)};
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
                "to", "with", "without", "at", "from", "by", "for", "as", "of"
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
                "logical", "number", "integer", "dateitems", "date", "time",  "seconds", "secs", "sec", "bool", "boolean"
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
