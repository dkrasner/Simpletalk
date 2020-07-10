var g = require('../js/semantics').g;

var chai = require('chai');
var assert = chai.assert;


describe("SimpleTalk Grammar", function () {
    describe("First Test", function () {
        it ("should return true", function () {
            let match = g.match('1 + (2 - 3) + 4');
            assert.isTrue(match.succeeded());
        });
        it ("should return false", function () {
            let match = g.match('sdfsdf1 + (2 - 3) + 4');
            assert.isTrue(match.failed());
        });
    });
})
