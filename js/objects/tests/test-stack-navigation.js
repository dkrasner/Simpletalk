/**
 * Stack Navigation Tests
 * ----------------------------------------
 * Test the ability of StackViews to properly
 * navigate between cards (ie, go to next card,
 * go to card 2, etc)
 */

/* NOTE: This test module does NOT
 * use the preload.js file
 */
import 'jsdom-global/register';
import chai from 'chai';
const assert = chai.assert;

import StackView from '../views/StackView.js';
import Stack from '../parts/Stack.js';
import CardView from '../views/CardView.js';
import Card from '../parts/Card.js';

window.customElements.define('st-stack', StackView);
window.customElements.define('st-card', CardView);

let stackView;
let stackModel;

describe('Stack Navigation Tests', () => {
    describe('Setup of StackView', () => {
        it('Can initialize a StackView with model', () => {
            stackModel = new Stack(null);
            stackView = document.createElement('st-stack');
            stackView.setModel(stackModel);
            assert.exists(stackModel);
            assert.exists(stackView);
            assert.equal(stackModel, stackView.model);
        });
        it('Stack part has only one Card subpart', () => {
            let cardParts = stackModel.subparts.filter(part => {
                return part.type == 'card';
            });

            assert.equal(1, cardParts.length);
        });
        it('Can append the StackView to body', () => {
            document.body.appendChild(stackView);
            let found = document.body.querySelector('st-stack');
            let foundElementId = found.getAttribute('part-id');

            assert.exists(found);
            assert.equal(foundElementId, stackModel.id.toString());
        });
        it('Stack part STILL has only one Card subpart', () => {
            let cardParts = stackModel.subparts.filter(part => {
                return part.type == 'card';
            });

            assert.equal(1, cardParts.length);
        });
        it('StackView has no CardView children yet', () => {
            let numCards = stackView.querySelectorAll('st-card').length;
            assert.equal(0, numCards);
        });
        it('Can create 2 additional cards (stack model has one by default)', () => {
            let card2 = new Card(stackModel);
            let card3 = new Card(stackModel);

            stackModel.addPart(card2);
            stackModel.addPart(card3);

            assert.include(stackModel.subparts, card2);
            assert.include(stackModel.subparts, card3);
        });
        it('Stack model should have 3 cards total now', () => {
            let subCards = stackModel.subparts.filter(subpart => {
                return subpart.type == 'card';
            });
            assert.equal(
                subCards.length,
                3
            );
        });
        it('Can append StackViews from the models', () => {
            let cardViews = stackModel.subparts.filter(part => {
                return part.type == 'card';
            }).forEach(cardModel => {
                let cardElement = document.createElement('st-card');
                cardElement.setModel(cardModel);
                stackView.appendChild(cardElement);
            });
            let first = stackView.querySelector('st-card:first-child');
            let second = stackView.querySelector('st-card:nth-child(2)');
            let third = stackView.querySelector('st-card:nth-child(3)');

            assert.exists(first);
            assert.exists(second);
            assert.exists(third);
            assert.equal('current-card', first.getAttribute('class'));
            assert.equal(
                3,
                stackView.querySelectorAll('st-card').length
            );
        });
        it('First child CardView is set to current card', () => {
            let firstCardView = stackView.querySelector('st-card:first-child');
            assert.isTrue(
                firstCardView.classList.contains('current-card')
            );
        });
        it('Other CardViews are NOT set to current-card', () => {
            let otherCards = stackView.querySelectorAll(
                'st-card:not(:first-child)'
            );

            otherCards.forEach(cardView => {
                assert.isFalse(
                    cardView.classList.contains('current-card')
                );
            });
        });
    });

    describe('Basic 3 card navigation', () => {
        it('#goToNextCard: Can go to next (2nd) card from current (1st)', () => {
            let firstCard = stackView.querySelector('st-card:nth-child(1)');
            let secondCard = stackView.querySelector('st-card:nth-child(2)');
            assert.isTrue(firstCard.classList.contains('current-card'));
            assert.isFalse(secondCard.classList.contains('current-card'));

            // Do the navigation
            stackView.goToNextCard();

            assert.isFalse(firstCard.classList.contains('current-card'));
            assert.isTrue(secondCard.classList.contains('current-card'));
        });

        it('#goToNextCard: Can go to next (3rd) card from current (2nd)', () => {
            let secondCard = stackView.querySelector('st-card:nth-child(2)');
            let thirdCard = stackView.querySelector('st-card:nth-child(3)');
            assert.isTrue(secondCard.classList.contains('current-card'));
            assert.isFalse(thirdCard.classList.contains('current-card'));

            // Do the navigation
            stackView.goToNextCard();
            assert.isFalse(secondCard.classList.contains('current-card'));
            assert.isTrue(thirdCard.classList.contains('current-card'));
        });

        it('#goToNextCard loops back to first card when at last stack card', () => {
            let thirdCard = stackView.querySelector('st-card:nth-child(3)');
            let firstCard = stackView.querySelector('st-card:nth-child(1)');
            assert.isTrue(thirdCard.classList.contains('current-card'));
            assert.isFalse(firstCard.classList.contains('current-card'));

            // Do the navigation. We expect it to 'loop around'
            // back to the first card
            stackView.goToNextCard();
            assert.isFalse(thirdCard.classList.contains('current-card'));
            assert.isTrue(firstCard.classList.contains('current-card'));
        });

        it('#goToPrevCard: loops back to the last card from the first', () => {
            let lastCard = stackView.querySelector('st-card:last-child');
            let firstCard = stackView.querySelector('st-card:first-child');
            assert.isTrue(firstCard.classList.contains('current-card'));
            assert.isFalse(lastCard.classList.contains('current-card'));

            // Do the navigation. Expect to look back to last card
            stackView.goToPrevCard();
            assert.isFalse(firstCard.classList.contains('current-card'));
            assert.isTrue(lastCard.classList.contains('current-card'));
        });

        it('#goToPrevCard: goes back to 2nd card from 3rd (last)', () => {
            let lastCard = stackView.querySelector('st-card:last-child');
            let middleCard = stackView.querySelector('st-card:nth-child(2)');
            assert.isTrue(lastCard.classList.contains('current-card'));
            assert.isFalse(middleCard.classList.contains('current-card'));

            // Do the navigation
            stackView.goToPrevCard();
            assert.isFalse(lastCard.classList.contains('current-card'));
            assert.isTrue(middleCard.classList.contains('current-card'));
        });

        it('#goToPrevCard: goes back to 1st card from 2nd', () => {
            let secondCard = stackView.querySelector('st-card:nth-child(2)');
            let firstCard = stackView.querySelector('st-card:first-child');
            assert.isTrue(secondCard.classList.contains('current-card'));
            assert.isFalse(firstCard.classList.contains('current-card'));

            // Do the navigation
            stackView.goToPrevCard();
            assert.isFalse(secondCard.classList.contains('current-card'));
            assert.isTrue(firstCard.classList.contains('current-card'));
        });
    });

    describe('Nth Card navigation ("go to card 1, etc")', () => {
        it('Can go from first card to third card', () => {
            let firstCard = stackView.querySelector('st-card:first-child');
            let thirdCard = stackView.querySelector('st-card:nth-child(3)');
            assert.isTrue(firstCard.classList.contains('current-card'));
            assert.isFalse(thirdCard.classList.contains('current-card'));

            // Do the navigation. goToNthCard uses 1-indexed values
            stackView.goToNthCard(3);
            assert.isFalse(firstCard.classList.contains('current-card'));
            assert.isTrue(thirdCard.classList.contains('current-card'));
        });

        it('Can go from third card to second card', () => {
            let thirdCard = stackView.querySelector('st-card:nth-child(3)');
            let secondCard = stackView.querySelector('st-card:nth-child(2)');
            assert.isTrue(thirdCard.classList.contains('current-card'));
            assert.isFalse(secondCard.classList.contains('current-card'));

            // Do the navigation.
            stackView.goToNthCard(2);
            assert.isFalse(thirdCard.classList.contains('current-card'));
            assert.isTrue(secondCard.classList.contains('current-card'));
        });

        it('Throws an error when attempting to navigate to card 0 (should be 1 indexed)', () => {
            assert.throws(
                stackView.goToNthCard.bind(0),
                Error
            );
        });

        it('Throws an error when attempting to navigate to a negative number', () => {
            assert.throws(
                stackView.goToNthCard.bind(-13),
                Error
            );
        });

        it('Has no effect if you navigate to positive number that is more than num cards', () => {
            // NOTE: Not sure if this is the expected behavior. Need
            // to check and write an appropriate test here if not.
            let currentCard = stackView.querySelector('st-card.current-card');
            stackView.goToNthCard(51);
            assert.isTrue(currentCard.classList.contains('current-card'));
            stackView.querySelectorAll('st-card:not(.current-card)').forEach(el => {
                assert.isFalse(el.classList.contains('current-card'));
            });
        });
    });
});
