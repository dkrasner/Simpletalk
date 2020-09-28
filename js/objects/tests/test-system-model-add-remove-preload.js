/**
 * System Add/Remove Model Tests
 * --------------------------------------
 * Integration test of System messages
 * `newModel` and `removeModel`.
 * These add and remove models from the System,
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
            return item.type = 'button';
        });

        assert.equal(buttonSubparts.length, 0);

        let buttonViews = Array.from(currentCardView.querySelectorAll('st-button'));
        assert.equal(buttonViews.length, 0);
    });

    it('Can send newModel message without error (add button to current card)', () => {
        let msg = {
            type: 'newModel',
            modelType: 'button',
            ownerId: currentCard.id
        };
        let sendFunc = function(){
            currentCard.sendMessage(msg, System);
        };

        expect(sendFunc).to.not.throw(Error);
    });

    it('Current card model now has button subpart', () => {
        let buttons = currentCard.subparts.filter(part => {
            return part.type == 'button';
        });

        assert.equal(buttons.length, 1);
    });

    it('Current card view has a child button view', () => {
        let buttonViews = Array.from(currentCardView.querySelectorAll('st-button'));
        assert.equal(buttonViews.length, 1);
    });

    it('There should be a serialization for the new button', () => {
        let button = currentCardView.querySelector('st-button').model;
        let serializationEl = document.querySelector(`script[data-part-id="${button.id}"]`);
        assert.exists(serializationEl);
    });
});

describe('removeModel tests', () => {
    beforeEach(function() {
        let msg = {
            type: 'newModel',
            modelType: 'button',
            ownerId: currentCard.id
        };
        currentCard.sendMessage(msg, System);
    });
    it('Can send removeModel message without error (remove the button by id)', () => {
        let targetButton = currentCard.subparts.filter(part => {
            return part.type == 'button';
        })[0];

        assert.exists(targetButton);

        let msg = {
            type: 'command',
            commandName: 'removeModel',
            args: [targetButton.id]
        };

        let sendFunc = function(){
            currentCard.sendMessage(msg, System);
        };

        expect(sendFunc).to.not.throw(Error);
    });
    it('Can send removeModel message without error (remove the button without id, self referentially)', () => {
        let targetButton = currentCard.subparts.filter(part => {
            return part.type == 'button';
        })[0];

        assert.exists(targetButton);

        let msg = {
            type: 'command',
            commandName: 'removeModel',
            args: [undefined, "button"]
        };

        let sendFunc = function(){
            currentCard.sendMessage(msg, targetButton);
        };

        expect(sendFunc).to.not.throw(Error);
    });
    it('Current card should remove button subpart by Id', () => {
        let targetButton = currentCard.subparts.filter(part => {
            return part.type == 'button';
        })[0];

        assert.exists(targetButton);

        let msg = {
            type: 'command',
            commandName: 'removeModel',
            args: [targetButton.id]
        };

        currentCard.sendMessage(msg, targetButton);

        let matchingButtons = currentCard.subparts.filter(subpart => {
            return subpart.id == targetButton.id;
        });
        assert.equal(matchingButtons.length, 0);
    });

    it('Current CardView should not have any direct ButtonView children after it is removed', () => {
        let targetButton = currentCard.subparts.filter(part => {
            return part.type == 'button';
        })[0];

        assert.exists(targetButton);

        let msg = {
            type: 'command',
            commandName: 'removeModel',
            args: [targetButton.id]
        };

        currentCard.sendMessage(msg, System);
        let buttonViews = currentCardView.querySelectorAll(`[part-id="{targetButton.id}"]`);
        assert.equal(buttonViews.length, 0);
    });

    it('Current card should remove button subpart wihout Id, self-referentially', () => {
        let targetButton = currentCard.subparts.filter(part => {
            return part.type == 'button';
        })[0];

        assert.exists(targetButton);

        let msg = {
            type: 'command',
            commandName: 'removeModel',
            args: [undefined, "button"]
        };

        currentCard.sendMessage(msg, targetButton);

        let matchingButtons = currentCard.subparts.filter(subpart => {
            return subpart.id == targetButton.id;
        });
        assert.equal(matchingButtons.length, 0);
    });

});
