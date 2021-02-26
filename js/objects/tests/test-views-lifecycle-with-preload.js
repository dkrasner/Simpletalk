/**
 * View-specific lifecycle Tests
 * --------------------------------------
 * These are integration tests that ensure
 * proper lifecycle for specifc views and models.
 */
import chai from 'chai';
const assert = chai.assert;
const expect = chai.expect;

describe('Button Views', () => {
    it('Can setup world with a stack, card and button', () => {
        let currentStackViews = document.querySelectorAll('st-stack.current-stack');
        assert.equal(currentStackViews.length, 1);
        let currentStackModel = currentStackViews[0].model;
        let cardViews = document.querySelectorAll('st-stack.current-stack > st-card');
        assert.equal(cardViews.length, 1);
        let currentCardModel = cardViews[0].model;
        // add a named button
        let newButtonMsg = {
            type: 'command',
            commandName: 'newModel',
            args: ['button', currentCardModel.id,"New Button"]
        };
        System.receiveMessage(newButtonMsg);
        let buttonViews = cardViews[0].querySelectorAll('st-button');
        assert.equal(buttonViews.length, 1);
    });
    it('Button has the proper name (ButtonView..afterConnected() was called)', () => {
        let cardView = document.querySelector('st-stack.current-stack > st-card');
        let buttonView = cardView.querySelector('st-button');
        assert.equal("New Button", buttonView.innerText);
    });
});
