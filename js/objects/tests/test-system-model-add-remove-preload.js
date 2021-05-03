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
let currentStack;
let currentStackView;
describe('newModel tests', () => {
    before('', () => {
        currentCardView = document.querySelector('.current-stack .current-card');
        currentCard = currentCardView.model;
        assert.exists(currentCard);
        assert.exists(currentCardView);
        currentStackView = document.querySelector('.current-stack');
        currentStack = currentStackView.model;
        assert.exists(currentStackView);
    });

    it('System has loaded', () => {
        assert.isTrue(System.isLoaded);
    });

    it('The current card does not have any button models or views', () => {
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

    it('Can send newModel message without error (add image to current card)', () => {
        let msg = {
            type: 'command',
            commandName: 'newModel',
            args: ['image', currentCard.id, "https://www.svgrepo.com/show/9838/test.svg"]
        };

        let sendFunc = function(){
            currentCard.sendMessage(msg, System);
        };

        expect(sendFunc).to.not.throw(Error);
    });

    it('Current card view has a child button view', () => {
        let buttonViews = Array.from(currentCardView.querySelectorAll('st-button'));
        assert.equal(buttonViews.length, 1);
    });

    it('Can send newModel message without error (add button to current card)', () => {
        let msg = {
            type: 'command',
            commandName: 'newModel',
            args: ['button', currentCard.id]
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

    it('Can add button to current stack', () => {
        let msg = {
            type: 'command',
            commandName: 'newModel',
            args: ['button', currentStack.id]
        };
        let sendFunc = function(){
            currentCard.sendMessage(msg, System);
        };
        expect(sendFunc).to.not.throw(Error);

        let button = currentStackView.querySelector(':scope > st-button');
        assert.exists(button);
    });
    it('Adding a card to stack preserves card-child priority', () => {
        let msg = {
            type: 'command',
            commandName: 'newModel',
            args: ['card', currentStack.id]
        };
        let sendFunc = function(){
            currentCard.sendMessage(msg, System);
        };
        expect(sendFunc).to.not.throw(Error);
        let totalCards = currentStackView.querySelectorAll(':scope > st-card').length;
        let conseqCardCounter = 0;
        currentStackView.childNodes.forEach((child) => {
            if(child.name === 'CardView'){
                conseqCardCounter += 1;
            } else {
                return;
            }
        });
        assert.equal(conseqCardCounter, totalCards);
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
            args: [targetButton.id, '']
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
