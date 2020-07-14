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
            let match = g.match('right', 'keyword');
            assert.isTrue(match.succeeded());
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
