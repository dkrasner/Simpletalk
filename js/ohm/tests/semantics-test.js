var ohm = require('ohm-js');
// Instantiate the grammar.
var fs = require('fs');
var g = ohm.grammar(fs.readFileSync('./js/ohm/simpletalk.ohm'));
import simpleTalkSemantics from '../semantics.js';

// mocha/chai
var chai = require('chai');
var assert = chai.assert;


describe("SimpleTalk Semantics", function () {
    let semantics = g.createSemantics().addOperation('parse', simpleTalkSemantics);
    describe("Commands", function () {
        it ("Arrow card navigation", function () {
            let direction = ["up", "down", "left", "right"];
            direction.forEach((d) => {
                let match = g.match("arrowKey " + d, "command_arrowCardNavigation");
                //console.log(match);
                assert.isTrue(match.succeeded());
                assert.equal(semantics(match).parse(), d);
            });
        });
    });
});
