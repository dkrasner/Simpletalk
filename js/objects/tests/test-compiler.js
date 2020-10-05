var ohm = require('ohm-js');
// Instantiate the grammar.
var fs = require('fs');
var g = ohm.grammar(fs.readFileSync('./js/ohm/simpletalk.ohm'));

// mocha/chai
var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

import Part from '../parts/Part.js';
import Compiler from '../compiler.js';
import simpleTalkSemantics from '../../ohm/semantics.js';

let MockObject = new Part();

describe("SimpleTalk Compiler", function () {
    beforeEach(function() {
        MockObject._commandHandlers = {};
        MockObject._scriptSemantics = {};
    })

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
        });
        describe("Go To Commands", function () {
            const directions = ['next', 'previous'];
            var systemObjects = ["background", "button", "card", "field", "stack"];
            systemObjects = systemObjects.concat(systemObjects.map(w => w.charAt(0).toUpperCase() + w.slice(1)));
            const invalidObjects = ["ackground", "cardd"]

            it('messageHandler (args, "go to" command)', () => {
                systemObjects.forEach((s) => {
                    const sourceCode = `on customMessage arg1\n go to ${s} arg1\nend customMessage`;
                    const expectedMessages = [
                    {
                        type: "command",
                        commandName: "go to reference",
                        args: [s, "arg1"]
                    }];
                    compiler.compile(sourceCode, MockObject);

                    const scriptSemantics = MockObject._scriptSemantics["customMessage"];
                    assert.deepEqual(scriptSemantics, expectedMessages);

                    const concreteHandler = MockObject._commandHandlers["customMessage"];
                    assert.isNotNull(concreteHandler);
                    assert.equal(typeof concreteHandler, "function");
                })
            });
            it('messageHandler ("go to" invalid object)', () => {
                invalidObjects.forEach((s) => {
                    const sourceCode = `on customMessage arg1\n go to ${s} arg1\nend customMessage`;
                    expect(() => compiler.compile(sourceCode, MockObject)).to.throw();
                })
            });
            it('messageHandler ("go to" invalid construction)', () => {
                const sourceCode = `on customMessage arg1\n go to next card arg1\nend customMessage`;
                expect(() => compiler.compile(sourceCode, MockObject)).to.throw();
            });
            it('messageHandler (no args, "go to" invalid construction)', () => {
                directions.forEach((d) => {
                    const handler = `on mouseUp\n go to ${d}\nend mouseUp`;
                    expect(() => compiler.compile(sourceCode, MockObject)).to.throw();
                })
            });
        });
        it('messageHandler (no args, multiple statements/commands)', () => {
            let handler = `on mouseUp\n answer "hello"\n go to next card\nend mouseUp`;
            let expectedMessages = [
            {
                type: "command",
                commandName: "answer",
                args: [ "hello"]
            },
            {
                type: "command",
                commandName: "go to direction",
                args: ["next", "card"]
            }];
            compiler.compile(handler, MockObject);
            let scriptSemantics = MockObject._scriptSemantics["mouseUp"];
            assert.deepEqual(scriptSemantics, expectedMessages);
            let concreteHandler = MockObject._commandHandlers["mouseUp"];
            assert.isNotNull(concreteHandler);
            assert.equal(typeof concreteHandler, "function");
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
        });
        describe("Remove Model Commands", function () {
            var systemObjects = ["background", "button", "card", "field", "stack"];
            systemObjects = systemObjects.concat(systemObjects.map(w => w.charAt(0).toUpperCase() + w.slice(1)));
            const invalidObjects = ["ackground", "cardd", "world"]

            it('messageHandler (args, "delete" command)', () => {
                systemObjects.forEach((s) => {
                    const sourceCode = `on customMessage idArg\n delete ${s} idArg\nend customMessage`;
                    const expectedMessages = [
                    {
                        type: "command",
                        commandName: "deleteModel",
                        args: ["idArg", s]
                    }];
                    compiler.compile(sourceCode, MockObject);

                    const scriptSemantics = MockObject._scriptSemantics["customMessage"];
                    assert.deepEqual(scriptSemantics, expectedMessages);

                    const concreteHandler = MockObject._commandHandlers["customMessage"];
                    assert.isNotNull(concreteHandler);
                    assert.equal(typeof concreteHandler, "function");
                })
            });
            it('messageHandler (no args, no id, "delete" command)', () => {
                systemObjects.forEach((d) => {
                    const handler = `on mouseUp\n delete ${d}\nend mouseUp`;
                    const expectedMessages = [
                    {
                        type: "command",
                        commandName: "deleteModel",
                        args: [undefined, d]
                    }];
                    compiler.compile(handler, MockObject);
                    const scriptSemantics = MockObject._scriptSemantics["mouseUp"];
                    assert.deepEqual(scriptSemantics, expectedMessages);
                    const concreteHandler = MockObject._commandHandlers["mouseUp"];
                    assert.isNotNull(concreteHandler);
                    assert.equal(typeof concreteHandler, "function");
                })
            });
            it('messageHandler (no args, no id, "delete this" command)', () => {
                systemObjects.forEach((d) => {
                    const handler = `on mouseUp\n delete this ${d}\nend mouseUp`;
                    const expectedMessages = [
                    {
                        type: "command",
                        commandName: "deleteModel",
                        args: [undefined, d]
                    }];
                    compiler.compile(handler, MockObject);
                    const scriptSemantics = MockObject._scriptSemantics["mouseUp"];
                    assert.deepEqual(scriptSemantics, expectedMessages);
                    const concreteHandler = MockObject._commandHandlers["mouseUp"];
                    assert.isNotNull(concreteHandler);
                    assert.equal(typeof concreteHandler, "function");
                })
            });
            it('messageHandler ("delete" invalid object)', () => {
                invalidObjects.forEach((s) => {
                    const sourceCode = `on customMessage idArg\n delete model ${s} idArg\nend customMessage`;
                    expect(() => compiler.compile(sourceCode, MockObject)).to.throw();
                })
            });
            it('messageHandler ("delete" invalid construction)', () => {
                const sourceCode = `on customMessage idArg\n delete idArg\nend customMessage`;
                expect(() => compiler.compile(sourceCode, MockObject)).to.throw();
            });
        });
        describe("Add Model Commands", function () {
            var systemObjects = ["background", "button", "card", "field", "stack"];
            systemObjects = systemObjects.concat(systemObjects.map(w => w.charAt(0).toUpperCase() + w.slice(1)));
            const invalidObjects = ["ackground", "cardd", "world"]

            it('messageHandler (no args, "add" command)', () => {
                systemObjects.forEach((d) => {
                    const handler = `on mouseUp\n add ${d} to card\nend mouseUp`;
                    const expectedMessages = [
                    {
                        type: "command",
                        commandName: "newModel",
                        args: [d]
                    }];
                    compiler.compile(handler, MockObject);
                    const scriptSemantics = MockObject._scriptSemantics["mouseUp"];
                    assert.deepEqual(scriptSemantics, expectedMessages);
                    const concreteHandler = MockObject._commandHandlers["mouseUp"];
                    assert.isNotNull(concreteHandler);
                    assert.equal(typeof concreteHandler, "function");
                })
            });
            it('messageHandler (no args, "add to this" command)', () => {
                systemObjects.forEach((d) => {
                    const handler = `on mouseUp\n add ${d} to this card\nend mouseUp`;
                    const expectedMessages = [
                    {
                        type: "command",
                        commandName: "newModel",
                        args: [d, "this"]
                    }];
                    compiler.compile(handler, MockObject);
                    const scriptSemantics = MockObject._scriptSemantics["mouseUp"];
                    assert.deepEqual(scriptSemantics, expectedMessages);
                    const concreteHandler = MockObject._commandHandlers["mouseUp"];
                    assert.isNotNull(concreteHandler);
                    assert.equal(typeof concreteHandler, "function");
                })
            });
            it('messageHandler ("add" invalid object)', () => {
                invalidObjects.forEach((s) => {
                    const sourceCode = `on customMessage targetArg\n add ${s} to targetArg\nend customMessage`;
                    expect(() => compiler.compile(sourceCode, MockObject)).to.throw();
                })
            });
            it('messageHandler ("add" invalid construction)', () => {
                const sourceCode = `on customMessage idArg\n add idArg\nend customMessage`;
                expect(() => compiler.compile(sourceCode, MockObject)).to.throw();
            });
        });
    });
});
