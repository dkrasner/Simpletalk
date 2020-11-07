/**
 * Button System Command Tests
 * -----------------------------------------------
 * Integration test of command message sending for
 * built-in Button commands, like click, mouseEnter, etc.
 * Note that we test the integratio of the System, Button, and
 * ButtonView objects, all of which must work together for
 * proper handling of mouse events
 */
import chai from 'chai';
const assert = chai.assert;

describe('Button System Command Tests', () => {
    describe('System initialialization', () => {
        it('Has loaded set to true', () => {
            assert.isTrue(System.isLoaded);
        });
        it('Has created a world view element', () => {
            let foundEl = document.querySelector('st-world');
            assert.exists(foundEl);
        });
        it('Can locate the current stack', () => {
            let foundEl = document.querySelector('.current-stack');
            assert.exists(foundEl);
            assert.exists(foundEl.model);
        });
        it('Can locate the (only) card in the stack', () => {
            let foundEl = document.querySelector('st-card');
            assert.exists(foundEl);
            assert.exists(foundEl.model);
        });
        it('Can get card view by its id', () => {
            let cardEl = document.querySelector('st-card');
            let id = cardEl.getAttribute('part-id');
            let found = document.querySelector(`[part-id="${id}"]`);
            assert.equal(id, "3");
            assert.exists(found);
        });
    });

    describe.skip('Adding the button that will be tested', () => {
        var buttonModel;
        it('Can add the button via System message', () => {
            let stackEl = document.querySelector('.current-stack');
            let cardEl = stackEl.querySelector('st-card');
            let msg = {
                type: "command",
                commandName: "newModel",
                args: ["button", card.model.id]
            };
            System.receiveMessage(msg);
            let btnEl = document.querySelector('st-button');
            assert.exists(btnEl);
            buttonModel = btnEl.model;
            assert.exists(buttonModel);
        });
        describe('#mouseEnter', () => {
            it('Triggering mouseEnter on the ButtonView element sends the mouseEnter msg to System', () => {
                let buttonView = document.querySelector('st-button');
                let event = new window.MouseEvent('mouseenter');
                assert.doesNotThrow(
                    buttonView.dispatchEvent.bind(buttonView, event),
                    Error
                );
            });

            it('Button can capture the mouseEnter message', () => {
                let result = 0;
                let handler = function(){
                    result = 1;
                };
                let buttonView = document.querySelector('st-button');
                let buttomModel = buttonView.model;
                buttonModel._commandHandlers['mouseEnter'] = handler;
                let event = new window.MouseEvent('mouseenter');
                buttonView.dispatchEvent(event);

                assert.equal(1, result);
            });
        });
    });
});
