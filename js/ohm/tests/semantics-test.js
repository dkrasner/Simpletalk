var ohm = require('ohm-js');
// Instantiate the grammar.
var fs = require('fs');
var g = ohm.grammar(fs.readFileSync('./js/ohm/simpletalk.ohm'));
import simpleTalkSemantics from '../semantics.js';

// mocha/chai
var chai = require('chai');
var assert = chai.assert;

let MockMessenger = {
    currentMsg: null,
    sendMessage: function(message){
        this.currentMsg = message;
    }
};


describe("SimpleTalk Semantics", function () {
    let semantics = g.createSemantics().addOperation('parse', simpleTalkSemantics);
    describe("Commands", function () {

        it('messageHandler (no params)', () => {
            let handler = `on mouseUp\n answer "hello"\nend mouseUp`;
            let match = g.match(handler, "messageHandler");
            assert.isTrue(match.succeeded());
            let handlerFunc = semantics(match).parse();
            handlerFunc(MockMessenger);
            assert.isNotNull(MockMessenger.currentMsg);
        });
    });
});
