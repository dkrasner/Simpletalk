/**
 * System Add/Remove Model Tests
 * --------------------------------------
 * Integration test of System messages
 * `newModel` and `deleteModel`.
 * These add and delete models from the System,
 * along with references to any of their Views.
 */
import chai from 'chai';
const assert = chai.assert;
const expect = chai.expect;

let currentCard;
let currentCardView;
describe('newModel tests', () => {
    it('System has loaded', () => {
        assert.isTrue(System.isLoaded);
    });

    it('The current card does not have any button models or views', () => {
        currentCardView = document.querySelector('.current-stack .current-card');
        currentCard = currentCardView.model;
        assert.exists(currentCard);

        let buttonSubparts = currentCard.subparts.filter(item => {
            return item.type === 'button';
        });

        assert.equal(buttonSubparts.length, 0);

        let buttonViews = Array.from(currentCardView.querySelectorAll('st-button'));
        assert.equal(buttonViews.length, 0);
    });

    it('Can send newModel message without error (add button to current card)', () => {
        let msg = {
            type: 'command',
            commandName: 'newModel',
            args: ['button', currentCard.id]
        };
        let sendFunc = function(){
            currentCard.sendMessage(msg, System);
        };

        expect(sendFunc).to.not.throw(Error);
    });

    it('Can send newModel message without error (add svg to current card)', () => {
        let msg = {
            type: 'command',
            commandName: 'newModel',
            args: ['svg', currentCard.id, "", "", "https://thomasnyberg.com/TsxxJJ9/translate.svg"]
        };

        let sendFunc = function(){
            currentCard.sendMessage(msg, System);
        };

        expect(sendFunc).to.not.throw(Error);
    });

    it.skip('Can send newModel message without error (add default svg)', () => {
        // TODO: figure out how to deal with relative paths (default svg icon) in
        // tests or get rid of them all together
        let msg = {
            type: 'command',
            commandName: 'newModel',
            args: ['svg']
        };

        let sendFunc = function(){
            currentCard.sendMessage(msg, currentCard);
        };

        expect(sendFunc).to.not.throw(Error);
    });

    it('Can send newModel message without error (add svg to current card without id)', () => {
        let msg = {
            type: 'command',
            commandName: 'newModel',
            args: ['svg', "", "", "", "https://thomasnyberg.com/TsxxJJ9/translate.svg"]
        };

        let sendFunc = function(){
            currentCard.sendMessage(msg, currentCard);
        };

        expect(sendFunc).to.not.throw(Error);
    });

    it('Can send newModel message without error (add svg to current card, in context)', () => {
        let msg = {
            type: 'command',
            commandName: 'newModel',
            args: ['svg', "", "card", "current", "https://thomasnyberg.com/TsxxJJ9/translate.svg"]
        };

        let sendFunc = function(){
            currentCard.sendMessage(msg, currentCard);
        };

        expect(sendFunc).to.not.throw(Error);
    });

    it('Current card view has a child button view', () => {
        let buttonViews = Array.from(currentCardView.querySelectorAll('st-button'));
        assert.equal(buttonViews.length, 1);
    });

    it('Can send newModel message in a context (without ownerId) without error (add button to current card)', () => {
        let msg = {
            type: 'command',
            commandName: 'newModel',
            args: ['button']
        };
        let sendFunc = function(){
            currentCard.sendMessage(msg, currentCard);
        };

        expect(sendFunc).to.not.throw(Error);
    });

    it('Current card view has a second child button view', () => {
        let buttonViews = Array.from(currentCardView.querySelectorAll('st-button'));
        assert.equal(buttonViews.length, 2);
    });

    it('There should be a serialization for the new button', () => {
        let button = currentCardView.querySelector('st-button').model;
        let serializationEl = document.querySelector(`script[data-part-id="${button.id}"]`);
        assert.exists(serializationEl);
    });

    it('Can send newModel message in a context (without targetId, current)', () => {
        let msg = {
            type: 'command',
            commandName: 'newModel',
            args: ['button', "", "card", "current"]
        };
        let sendFunc = function(){
            currentCard.sendMessage(msg, currentCard);
        };

        expect(sendFunc).to.not.throw(Error);
    });

    it('Can send newModel message in a context (without targetId, this)', () => {
        let msg = {
            type: 'command',
            commandName: 'newModel',
            args: ['button', "", "card", "this"]
        };
        let sendFunc = function(){
            currentCard.sendMessage(msg, currentCard);
        };

        expect(sendFunc).to.not.throw(Error);
    });

    it('Can send newModel message in a context (without targetId, targetType nor context)', () => {
        let msg = {
            type: 'command',
            commandName: 'newModel',
            args: ['button', "", "", ""]
        };
        let sendFunc = function(){
            currentCard.sendMessage(msg, currentCard);
        };

        expect(sendFunc).to.not.throw(Error);
    });

    it('Throws error if context and target id are provided', () => {
        let msg = {
            type: 'command',
            commandName: 'newModel',
            args: ['button', "20", "", "this"]
        };
        let sendFunc = function(){
            currentCard.sendMessage(msg, currentCard);
        };

        expect(sendFunc).to.throw(Error);
    });
});

describe('copyModel tests', () => {
    it('Can send copyModel message ', () => {
        let cards = document.querySelectorAll('st-card');
        assert.isAtLeast(cards.length, 2);
        let card1 = cards[0];
        let card2 = cards[1];

        let card1Buttons = card1.model.subparts.filter(item => {
            return item.type === 'button';
        });
        assert.isAtLeast(card1Buttons.length, 1);

        let card2ButtonsBefore = card2.model.subparts.filter(item => {
            return item.type === 'button';
        });

        let button = card1Buttons[0];

        // add a copy of the card1 button to card2
        let msg = {
            type: 'command',
            commandName: 'copyModel',
            args: [button.id, card2.model.id]
        };
        let sendFunc = function(){
            currentCard.sendMessage(msg, currentCard);
        };
        expect(sendFunc).to.not.throw(Error);


        let card2ButtonsAfter = card2.model.subparts.filter(item => {
            return item.type === 'button';
        });

        assert.equal(card2ButtonsAfter.length, card2ButtonsBefore.length + 1);

    });

});

describe('deleteModel tests', () => {
    beforeEach(function() {
        let msg = {
            type: 'command',
            commandName: 'newModel',
            args: ['button', currentCard.id]
        };
        currentCard.sendMessage(msg, System);
    });
    it('Can send deleteModel message without error (delete the button by id)', () => {
        let targetButton = currentCard.subparts.filter(part => {
            return part.type == 'button';
        })[0];

        assert.exists(targetButton);

        let msg = {
            type: 'command',
            commandName: 'deleteModel',
            args: [targetButton.id]
        };

        let sendFunc = function(){
            currentCard.sendMessage(msg, System);
        };

        expect(sendFunc).to.not.throw(Error);
    });
    it('Can send deleteModel message without error (delete the button without id, self referentially)', () => {
        let targetButton = currentCard.subparts.filter(part => {
            return part.type == 'button';
        })[0];

        assert.exists(targetButton);

        let msg = {
            type: 'command',
            commandName: 'deleteModel',
            args: [undefined, "button"]
        };

        let sendFunc = function(){
            currentCard.sendMessage(msg, targetButton);
        };

        expect(sendFunc).to.not.throw(Error);
    });
    it('Current card should delete button subpart by Id', () => {
        let targetButton = currentCard.subparts.filter(part => {
            return part.type == 'button';
        })[0];

        assert.exists(targetButton);

        let msg = {
            type: 'command',
            commandName: 'deleteModel',
            args: [targetButton.id]
        };

        currentCard.sendMessage(msg, targetButton);

        let matchingButtons = currentCard.subparts.filter(subpart => {
            return subpart.id == targetButton.id;
        });
        assert.equal(matchingButtons.length, 0);
    });

    it('Current CardView should not have any direct ButtonView children after it is deleted', () => {
        let targetButton = currentCard.subparts.filter(part => {
            return part.type == 'button';
        })[0];

        assert.exists(targetButton);

        let msg = {
            type: 'command',
            commandName: 'deleteModel',
            args: [targetButton.id]
        };

        currentCard.sendMessage(msg, System);
        let buttonViews = currentCardView.querySelectorAll(`[part-id="{targetButton.id}"]`);
        assert.equal(buttonViews.length, 0);
    });

    it('Current card should delete button subpart wihout Id, self-referentially', () => {
        let targetButton = currentCard.subparts.filter(part => {
            return part.type == 'button';
        })[0];

        assert.exists(targetButton);

        let msg = {
            type: 'command',
            commandName: 'deleteModel',
            args: [undefined, "button"]
        };

        currentCard.sendMessage(msg, targetButton);

        let matchingButtons = currentCard.subparts.filter(subpart => {
            return subpart.id == targetButton.id;
        });
        assert.equal(matchingButtons.length, 0);
    });

});
