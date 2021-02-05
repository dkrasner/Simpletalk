import chai from 'chai';
import ohm from 'ohm-js';
const assert = chai.assert;
const expect = chai.expect;

import interpreterSemantics from '../../ohm/interpreter-semantics.js';

let testLanguageGrammar = ohm.grammar(window.grammar);

let fields = [];
let buttons = [];
let cards = [];
let currentCardModel = null;

// Helper function that adds cards, buttons, and
// fields to the current stack.
// We add 3 buttons and fields each to
// three cards total (including the current one)
// in an alternating pattern
function setupCardsAndParts(){
    let stack = window.System.getCurrentStackModel();
    for(let i = 0; i < 3; i++){
        let currentCard = window.System.getCurrentCardModel();
        window.System.newModel(
            'button',
            currentCard.id,
            'card',
            null,
            `Button ${i+1}`
        );
        window.System.newModel(
            'field',
            currentCard.id,
            'card',
            null,
            `Button ${i+1}`
        );
        window.System.newModel(
            'button',
            currentCard.id,
            'card',
            null,
            `Button ${i+2}`
        );
        window.System.newModel(
            'field',
            currentCard.id,
            'card',
            null,
            `Button ${i+2}`
        );
        window.System.newModel(
            'button',
            currentCard.id,
            'card',
            null,
            `Button ${i+3}`
        );
        window.System.newModel(
            'field',
            currentCard.id,
            'card',
            null,
            `Button ${i+3}`
        );
        if(i < 2){
            window.System.newModel(
                'card',
                stack.id,
                'stack'
            );
            window.System.goToNextCard();
        }
    }
}

describe("ObjectSpecifier Tests", () => {
    describe("Model Setup", () => {
        it("Can find the current card model", () => {
            let currentCardView = document.querySelector('.current-stack > .current-card');
            currentCardModel = currentCardView.model;
            assert.exists(currentCardModel);
        });
        it("Can add all the cards and test parts without error", () => {
            expect(setupCardsAndParts).to.not.throw();
        });
        it("Can load the language grammar", () => {
            assert.exists(testLanguageGrammar);
        });
    });
    describe("Simple specifiers with current card in context", () => {
        let semantics;
        let partContext;

        before(() => {
            partContext = window.System.getCurrentCardModel();
            semantics = testLanguageGrammar.createSemantics();
            semantics.addOperation(
                'interpret',
                interpreterSemantics(partContext, window.System)
            ); 
        });
        it("Can match the button 1 of current card", () => {
            let str = `button 1 of current card`;
            let matchObject = testLanguageGrammar.match(str, 'ObjectSpecifier');
            assert.isTrue(matchObject.succeeded());
            let expectedPart = partContext.subparts.filter(part => {
                return part.type == 'button';
            })[0];
            let expectedValue = expectedPart.id;
            let result = semantics(matchObject).interpret();
            assert.equal(expectedValue, result);
        });
        it("Can match second field of current card", () => {
            let str = `second field of current card`;
            let matchObject = testLanguageGrammar.match(str, 'ObjectSpecifier');
            assert.isTrue(matchObject.succeeded());
            let expectedPart = partContext.subparts.filter(part => {
                return part.type == 'field';
            })[1];
            let expectedValue = expectedPart.id;
            let result = semantics(matchObject).interpret();
            assert.equal(expectedValue, result);
        });
    });
});
