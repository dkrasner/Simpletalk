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
            let sourceCode = [
                `on mouseUp`,
                `answer "hello"`,
                `end mouseUp`
            ].join("\n");
            let expectedMessages = [
            {
                type: "command",
                commandName: "answer",
                args: [ "hello"]
            }];
            compiler.compile(sourceCode, MockObject);

            // We expect the list of compiled messages to send
            // to be attached to the Part's script object somewhere.
            // Here I am using a dict at _compiled but we can all it
            // anything. The important part is that the key is the
            // same as the message/command name
            assert.deepEqual(MockObject.script._compiled["mouseUp"], expectedMessages);

            // The "concrete handler" is the actual javascript function
            // that handles a command called "mouseUp" on the given
            // Part instance. The semantic compiler should have created
            // a basic function wrapping the recursive calling of the
            // Part's script messages and set the command name key
            // to that function.
            let concreteHandler = MockObject._commandHandlers["mouseUp"];
            assert.equal(typeof concreteHandler, "function");
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
