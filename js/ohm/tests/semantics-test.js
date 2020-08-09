var ohm = require('ohm-js');
// Instantiate the grammar.
var fs = require('fs');
var g = ohm.grammar(fs.readFileSync('./js/ohm/simpletalk.ohm'));

// mocha/chai
var chai = require('chai');
var assert = chai.assert;

import Part from '../../objects/parts/Part.js';
import Compiler from '../../objects/compiler.js';
import simpleTalkSemantics from '../semantics.js';

let MockObject = new Part();


describe("SimpleTalk Semantics", function () {
    let semantics = g.createSemantics().addOperation('parse', simpleTalkSemantics);
    let compiler = new Compiler(g, semantics);
    describe("Commands", function () {

        it('messageHandler (no params)', () => {
            let handler = `on mouseUp\n answer "hello"\nend mouseUp`;
            let testMessage = {
                type: "command",
                commandName: "answer",
                args: [ "hello"]
            };
            compiler.compile(handler, MockObject);
            let message = MockObject._commandHandlers["mouseUp"];
            assert.isNotNull(message);
            assert.equal(toString(message), toString(testMessage));
        });
    });
});
