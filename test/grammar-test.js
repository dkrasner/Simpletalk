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
            let keywords = ['add', 'answer', 'ask', 'beep', 'choose', 'click', 'close',
                'convert', 'create', 'debug', 'delete', 'dial', 'disable', 'divide',
                'drag', 'edit', 'enable', 'export', 'find', "get", "go", "hide", "import", "lock",
                "mark" , "open", "paint", "pass", "play", "pop", "push", "put"
            ];
            let match = g.match('add', 'keyword');
            assert.isTrue(match.succeeded());
            keywords.forEach((k) => {
                match = g.match(k, 'keyword');
                assert.isTrue(match.succeeded());
            });
        });
        it ("Not Matching basic keywords", function () {
            let match = g.match('menuBAD', 'keyword');
            assert.isTrue(match.failed());
        });
        it ("Not Matching basic keywords", function () {
            let match = g.match(' beep', 'keyword');
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
