var ohm = require('ohm-js');
// Instantiate the grammar.
var fs = require('fs');
var g = ohm.grammar(fs.readFileSync('./js/ohm/simpletalk.ohm'));

// mocha/chai
var chai = require('chai');
var assert = chai.assert;

import Part from '../parts/Part.js';
import Compiler from '../compiler.js';
import simpleTalkSemantics from '../../ohm/semantics.js';

let MockObject = new Part();


describe("SimpleTalk Compiler", function () {
    let semantics = g.createSemantics().addOperation('parse', simpleTalkSemantics);
    let compiler = new Compiler(g, semantics);
    describe("Commands", function () {

        it ('messageHandler (no params, "answer" command)', () => {
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

            let scriptSemantics = MockObject._scriptSemantics["mouseUp"];
            assert.deepEqual(scriptSemantics, expectedMessages);

            let concreteHandler = MockObject._commandHandlers["mouseUp"];
            assert.isNotNull(concreteHandler);
            assert.equal(typeof concreteHandler, "function");
            MockObject._commandHandlers = {};
            MockObject._scriptSemantics = {};
        });
        it('messageHandler (args, "go to" command)', () => {
            let sourceCode = `on customMessage arg1\n go to card arg1\nend customMessage`;
            let expectedMessages = [
            {
                type: "command",
                commandName: "go to",
                args: [ "card", "arg1"]
            }];
            compiler.compile(sourceCode, MockObject);

            let scriptSemantics = MockObject._scriptSemantics["customMessage"];
            assert.deepEqual(scriptSemantics, expectedMessages);

            let concreteHandler = MockObject._commandHandlers["customMessage"];
            assert.isNotNull(concreteHandler);
            assert.equal(typeof concreteHandler, "function");
            MockObject._commandHandlers = {};
            MockObject._scriptSemantics = {};
        });
        it('messageHandler (no args, "go to" command)', () => {
            let handler = `on mouseUp\n go to next\nend mouseUp`;
            let expectedMessages = [
            {
                type: "command",
                commandName: "go to",
                args: ["next"]
            }];
            compiler.compile(handler, MockObject);
            let scriptSemantics = MockObject._scriptSemantics["mouseUp"];
            assert.deepEqual(scriptSemantics, expectedMessages);
            let concreteHandler = MockObject._commandHandlers["mouseUp"];
            assert.isNotNull(concreteHandler);
            assert.equal(typeof concreteHandler, "function");
            MockObject._commandHandlers = {};
            MockObject._scriptSemantics = {};
        });
        it('messageHandler (no args, multiple statements/commands)', () => {
            let handler = `on mouseUp\n answer "hello"\n go to next\nend mouseUp`;
            let expectedMessages = [
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
            let scriptSemantics = MockObject._scriptSemantics["mouseUp"];
            assert.deepEqual(scriptSemantics, expectedMessages);
            let concreteHandler = MockObject._commandHandlers["mouseUp"];
            assert.isNotNull(concreteHandler);
            assert.equal(typeof concreteHandler, "function");
            MockObject._commandHandlers = {};
            MockObject._scriptSemantics = {};
        });
        it('messageHandler (no args, multi-script-part message)', () => {
            let script = 'on mouseUp\n\tdoSomething\nend mouseUp\n\non doSomething\n\tanswer "it worked"\nend doSomething';
            let onMouseUpExpected = [
            {
                type: "command",
                commandName: "doSomething",
                args: []
            }
            ];
            let onDoSomethingExpected = [
            {
                type: "command",
                commandName: "answer",
                args: [ "it worked"]
            }
            ];
            compiler.compile(script, MockObject);
            let onMouseUp = MockObject._scriptSemantics["mouseUp"];
            let onDoSomething = MockObject._scriptSemantics["doSomething"];
            assert.deepEqual(onMouseUp, onMouseUpExpected);
            assert.deepEqual(onDoSomething, onDoSomethingExpected);
            let onMouseUpHandler = MockObject._commandHandlers["mouseUp"];
            let onDoSomethingHandler = MockObject._commandHandlers["doSomething"];
            assert.isNotNull(onMouseUpHandler);
            assert.equal(typeof onMouseUpHandler, "function");
            assert.isNotNull(onDoSomethingHandler);
            assert.equal(typeof onDoSomethingHandler, "function");
            MockObject._commandHandlers = {};
            MockObject._scriptSemantics = {};
        });
    });
});
