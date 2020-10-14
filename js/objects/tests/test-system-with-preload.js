/**
 * System Tests
 * --------------------------------------
 * These are integration tests that ensure
 * proper functioning of the System and its
 * various methods, functions and utilities.
 */
import chai from 'chai';
const assert = chai.assert;
const expect = chai.expect;

describe('System methods', () => {
    it('Can setup world with a multi-stack multi-card stack', () => {
        let foundWindows = document.querySelectorAll('st-window');
        assert.equal(foundWindows.length, 1);
        let currentStackViews = document.querySelectorAll('st-stack.current-stack');
        assert.equal(currentStackViews.length, 1);
        let currentStackModel = currentStackViews[0].model;
        let cardViews = document.querySelectorAll('st-stack.current-stack > st-card');
        assert.equal(cardViews.length, 1);
        // add a few more cards
        let newCardMsg = {
            type: 'command',
            commandName: 'newModel',
            args: ['card', currentStackModel.id]
        };
        System.receiveMessage(newCardMsg);
        System.receiveMessage(newCardMsg);
        cardViews = document.querySelectorAll('st-stack.current-stack > st-card');
        assert.equal(cardViews.length, 3);
        let currentCardViews = document.querySelectorAll('st-stack.current-stack > st-card.current-card');
        assert.equal(currentCardViews.length, 1);
        // add a few more stacks
        let worldView = document.querySelector('st-world');
        let newStackMsg = {
            type: 'command',
            commandName: 'newModel',
            args: ['stack', worldView.model.id]
        };
        System.receiveMessage(newStackMsg);
        System.receiveMessage(newStackMsg);
        let stackViews = document.querySelectorAll('st-world > st-stack');
        assert.equal(stackViews.length, 3);
    });
    it('Can get current-card model.', () => {
        let currentCardView = document.querySelector('st-stack.current-stack > st-card.current-card');
        let currentCardModel = currentCardView.model;
        assert.equal(currentCardModel.id, System.getCurrentCardModel().id);
    });
    it('Will throw error if there are multiple .current-stack > .current-card elements', () => {
        let cardViews = document.querySelectorAll('st-stack.current-stack > st-card');
        let card2 = cardViews[1];
        card2.classList.add("current-card");
        let getCurrentCardModel = function() {System.getCurrentCardModel()};
        expect(getCurrentCardModel).to.throw();
        card2.classList.remove("current-card");
    });
    it('Can get current-stack model.', () => {
        let currentStackView = document.querySelector('st-stack.current-stack');
        let currentStackModel = currentStackView.model;
        assert.equal(currentStackModel.id, System.getCurrentStackModel().id);
    });
    it('Will throw error if there are multiple st-world > .current-stack elements', () => {
        let stackViews = document.querySelectorAll('st-world > st-stack');
        let stack2 = stackViews[1];
        stack2.classList.add("current-stack");
        let getCurrentStackModel = function() {System.getCurrentStackModel()};
        expect(getCurrentStackModel).to.throw();
        stack2.classList.remove("current-stack");
    });
});
