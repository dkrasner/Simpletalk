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
                `on click`,
                `answer "hello"`,
                `end click`
            ].join("\n");
            let expectedMessages = [
            {
                type: "command",
                commandName: "answer",
                args: [ "hello"]
            }];
            compiler.compile(sourceCode, MockObject);

            let scriptSemantics = MockObject._scriptSemantics["click"];
            assert.deepEqual(scriptSemantics, expectedMessages);

            let concreteHandler = MockObject._commandHandlers["click"];
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
                    const handler = `on click\n go to ${d}\nend click`;
                    expect(() => compiler.compile(sourceCode, MockObject)).to.throw();
                })
            });
        });
        it('messageHandler (no args, multiple statements/commands)', () => {
            let handler = `on click\n answer "hello"\n go to next card\nend click`;
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
            let scriptSemantics = MockObject._scriptSemantics["click"];
            assert.deepEqual(scriptSemantics, expectedMessages);
            let concreteHandler = MockObject._commandHandlers["click"];
            assert.isNotNull(concreteHandler);
            assert.equal(typeof concreteHandler, "function");
        });
        it('messageHandler (no args, multi-script-part message)', () => {
            let script = 'on click\n\tdoSomething\nend click\n\non doSomething\n\tanswer "it worked"\nend doSomething';
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
            let onMouseUp = MockObject._scriptSemantics["click"];
            let onDoSomething = MockObject._scriptSemantics["doSomething"];
            assert.deepEqual(onMouseUp, onMouseUpExpected);
            assert.deepEqual(onDoSomething, onDoSomethingExpected);
            let onMouseUpHandler = MockObject._commandHandlers["click"];
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
                    const handler = `on click\n delete ${d}\nend click`;
                    const expectedMessages = [
                    {
                        type: "command",
                        commandName: "deleteModel",
                        args: [undefined, d]
                    }];
                    compiler.compile(handler, MockObject);
                    const scriptSemantics = MockObject._scriptSemantics["click"];
                    assert.deepEqual(scriptSemantics, expectedMessages);
                    const concreteHandler = MockObject._commandHandlers["click"];
                    assert.isNotNull(concreteHandler);
                    assert.equal(typeof concreteHandler, "function");
                })
            });
            it('messageHandler (no args, no id, "delete this" command)', () => {
                systemObjects.forEach((d) => {
                    const handler = `on click\n delete this ${d}\nend click`;
                    const expectedMessages = [
                    {
                        type: "command",
                        commandName: "deleteModel",
                        args: [undefined, d]
                    }];
                    compiler.compile(handler, MockObject);
                    const scriptSemantics = MockObject._scriptSemantics["click"];
                    assert.deepEqual(scriptSemantics, expectedMessages);
                    const concreteHandler = MockObject._commandHandlers["click"];
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
                    const handler = `on click\n add ${d} to card\nend click`;
                    const expectedMessages = [
                    {
                        type: "command",
                        commandName: "newModel",
                        args: [d, "", "card", "", ""]
                    }];
                    compiler.compile(handler, MockObject);
                    const scriptSemantics = MockObject._scriptSemantics["click"];
                    assert.deepEqual(scriptSemantics, expectedMessages);
                    const concreteHandler = MockObject._commandHandlers["click"];
                    assert.isNotNull(concreteHandler);
                    assert.equal(typeof concreteHandler, "function");
                })
            });
            it('messageHandler (no args, "add to this" command)', () => {
                systemObjects.forEach((d) => {
                    const handler = `on click\n add ${d} to this card\nend click`;
                    const expectedMessages = [
                    {
                        type: "command",
                        commandName: "newModel",
                        args: [d, "", "card", "this", ""]
                    }];
                    compiler.compile(handler, MockObject);
                    const scriptSemantics = MockObject._scriptSemantics["click"];
                    assert.deepEqual(scriptSemantics, expectedMessages);
                    const concreteHandler = MockObject._commandHandlers["click"];
                    assert.isNotNull(concreteHandler);
                    assert.equal(typeof concreteHandler, "function");
                })
            });
            it('messageHandler (no args, "add to current card" command)', () => {
                systemObjects.forEach((d) => {
                    const handler = `on click\n add ${d} to current card\nend click`;
                    const expectedMessages = [
                    {
                        type: "command",
                        commandName: "newModel",
                        args: [d, "", "card", "current", ""]
                    }];
                    compiler.compile(handler, MockObject);
                    const scriptSemantics = MockObject._scriptSemantics["click"];
                    assert.deepEqual(scriptSemantics, expectedMessages);
                    const concreteHandler = MockObject._commandHandlers["click"];
                    assert.isNotNull(concreteHandler);
                    assert.equal(typeof concreteHandler, "function");
                })
            });
            it('messageHandler (no args, "add to current stack" command)', () => {
                systemObjects.forEach((d) => {
                    const handler = `on click\n add ${d} to current stack\nend click`;
                    const expectedMessages = [
                    {
                        type: "command",
                        commandName: "newModel",
                        args: [d, "", "stack", "current", ""]
                    }];
                    compiler.compile(handler, MockObject);
                    const scriptSemantics = MockObject._scriptSemantics["click"];
                    assert.deepEqual(scriptSemantics, expectedMessages);
                    const concreteHandler = MockObject._commandHandlers["click"];
                    assert.isNotNull(concreteHandler);
                    assert.equal(typeof concreteHandler, "function");
                })
            });
            it('messageHandler (no args, "add to" by id command)', () => {
                systemObjects.forEach((d) => {
                    const handler = `on click\n add ${d} to card 20\nend click`;
                    const expectedMessages = [
                    {
                        type: "command",
                        commandName: "newModel",
                        args: [d, "20", "card", "", ""]
                    }];
                    compiler.compile(handler, MockObject);
                    const scriptSemantics = MockObject._scriptSemantics["click"];
                    assert.deepEqual(scriptSemantics, expectedMessages);
                    const concreteHandler = MockObject._commandHandlers["click"];
                    assert.isNotNull(concreteHandler);
                    assert.equal(typeof concreteHandler, "function");
                })
            });
            it('messageHandler (no args, "add to" with name by id command)', () => {
                systemObjects.forEach((d) => {
                    const handler = `on click\n add ${d} "New Button" to card 20\nend click`;
                    const expectedMessages = [
                    {
                        type: "command",
                        commandName: "newModel",
                        args: [d, "20", "card", "", "New Button"]
                    }];
                    compiler.compile(handler, MockObject);
                    const scriptSemantics = MockObject._scriptSemantics["click"];
                    assert.deepEqual(scriptSemantics, expectedMessages);
                    const concreteHandler = MockObject._commandHandlers["click"];
                    assert.isNotNull(concreteHandler);
                    assert.equal(typeof concreteHandler, "function");
                })
            });
            it('messageHandler (no args, "add" without name or target)', () => {
                systemObjects.forEach((d) => {
                    const handler = `on click\n add ${d}\nend click`;
                    const expectedMessages = [
                    {
                        type: "command",
                        commandName: "newModel",
                        args: [d, "", "", "", ""]
                    }];
                    compiler.compile(handler, MockObject);
                    const scriptSemantics = MockObject._scriptSemantics["click"];
                    assert.deepEqual(scriptSemantics, expectedMessages);
                    const concreteHandler = MockObject._commandHandlers["click"];
                    assert.isNotNull(concreteHandler);
                    assert.equal(typeof concreteHandler, "function");
                })
            });
            it('messageHandler (no args, "add" without target, with name)', () => {
                systemObjects.forEach((d) => {
                    const handler = `on click\n add ${d} "new part"\nend click`;
                    const expectedMessages = [
                    {
                        type: "command",
                        commandName: "newModel",
                        args: [d, "", "", "", "new part"]
                    }];
                    compiler.compile(handler, MockObject);
                    const scriptSemantics = MockObject._scriptSemantics["click"];
                    assert.deepEqual(scriptSemantics, expectedMessages);
                    const concreteHandler = MockObject._commandHandlers["click"];
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
            it('messageHandler ("add to this [with] targetId" invalid construction)', () => {
                const sourceCode = `on customMessage idArg\n add button to this card 20 \nend customMessage`;
                expect(() => compiler.compile(sourceCode, MockObject)).to.throw();
            });
            it('messageHandler ("add to current" invalid target)', () => {
                const sourceCode = `on customMessage idArg\n add button to current button \nend customMessage`;
                expect(() => compiler.compile(sourceCode, MockObject)).to.throw();
            });
        });
        describe("Set Property", function () {
            var systemObjects = ["background", "button", "card", "field", "stack"];
            systemObjects = systemObjects.concat(systemObjects.map(w => w.charAt(0).toUpperCase() + w.slice(1)));
            const invalidObjects = ["ackground", "cardd", "world"]

            it('Set background color', () => {
                systemObjects.forEach((s) => {
                    const sourceCode = `
                      on customMessage
                        set "backgroundColor" to "blue" in ${s} 20
                      end customMessage
                    `;
                    const expectedMessages = [
                    {
                        type: "command",
                        commandName: "setProperty",
                        args: ["backgroundColor", "blue", "20", `${s}`, ""]
                    }];
                    compiler.compile(sourceCode, MockObject);

                    const scriptSemantics = MockObject._scriptSemantics["customMessage"];
                    assert.deepEqual(scriptSemantics, expectedMessages);

                    const concreteHandler = MockObject._commandHandlers["customMessage"];
                    assert.isNotNull(concreteHandler);
                    assert.equal(typeof concreteHandler, "function");
                })
            });
            it('Set background color in context', () => {
                ["this", "current", ""].forEach((context) => {
                    ["card", "stack"].forEach((s) => {
                        const sourceCode = `
                          on customMessage
                            set "backgroundColor" to "blue" in ${context} ${s}
                          end customMessage
                        `;
                        const expectedMessages = [
                        {
                            type: "command",
                            commandName: "setProperty",
                            args: ["backgroundColor", "blue", "", `${s}`, `${context}`]
                        }];
                        compiler.compile(sourceCode, MockObject);

                        const scriptSemantics = MockObject._scriptSemantics["customMessage"];
                        assert.deepEqual(scriptSemantics, expectedMessages);

                        const concreteHandler = MockObject._commandHandlers["customMessage"];
                        assert.isNotNull(concreteHandler);
                        assert.equal(typeof concreteHandler, "function");
                    });
                });
            });
            it('Set background color (invalid construction)', () => {
                const sourceCode = `
                  on customMessage
                    set background to blue in card 20
                  end customMessage
                `;
                expect(() => compiler.compile(sourceCode, MockObject)).to.throw();
            })
        });
    });
});
