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

        it('messageHandler (no params, "answer" command)', () => {
            let handler = `on mouseUp\n answer "hello"\nend mouseUp`;
            let testMessages = [
            {
                type: "command",
                commandName: "answer",
                args: [ "hello"]
            }];
            compiler.compile(handler, MockObject);
            let message = MockObject._commandHandlers["mouseUp"];
            assert.isNotNull(message);
            assert.deepEqual(message, testMessages);
        });
        it('messageHandler (no params, "go to" command)', () => {
            let handler = `on mouseUp\n go to next\nend mouseUp`;
            let testMessages = [
            {
                type: "command",
                commandName: "go to",
                args: ["next"]
            }];
            compiler.compile(handler, MockObject);
            let message = MockObject._commandHandlers["mouseUp"];
            assert.isNotNull(message);
            // console.log(message);
            // console.log(MockObject._commandHandlers["mouseUp"]);
            assert.deepEqual(message, testMessages);
        });
        it('messageHandler (no params, multiple statements/commands)', () => {
            let handler = `on mouseUp\n answer "hello"\n go to next\nend mouseUp`;
            let testMessages = [
            {
                type: "command",
                commandName: "answer",
                args: [ "hello"]
            },
            {
                type: "command",
                commandName: "go to",
                args: ["next"]
            }];
            compiler.compile(handler, MockObject);
            let message = MockObject._commandHandlers["mouseUp"];
            assert.isNotNull(message);
            assert.equal(JSON.stringify(message), JSON.stringify(testMessages));
        });
    });
});
