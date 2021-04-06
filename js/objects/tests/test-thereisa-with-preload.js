/**
 * Testing the implementation of the
 * primitive 'there is a' command in the interpreter
 */
import chai from 'chai';
import ohm from 'ohm-js';
const assert = chai.assert;
const expect = chai.expect;

import interpreterSemantics from '../../ohm/interpreter-semantics.js';
let testLanguageGrammar = ohm.grammar(window.grammar);

function getSemanticsFor(aPart){
    let semantics = testLanguageGrammar.createSemantics();
    semantics.addOperation(
        'interpret',
        interpreterSemantics(aPart, window.System)
    );
    return semantics;
}

describe('"there is (not) (a|an)" command tests', () => {
    let semantics;
    let currentCard;
    let exampleArea;
    describe('current card tests', () => {
        it('Can create a semantics for current card without error', () => {
            currentCard = System.getCurrentCardModel();
            let initSemantics = function(){
                semantics = getSemanticsFor(currentCard);
            };
            expect(initSemantics).to.not.throw();
        });
        it('Current card', () => {
            let script = `there is a current card`;
            let match = testLanguageGrammar.match(script, 'Conditional');
            assert.isTrue(match.succeeded());
            assert.isTrue(semantics(match).interpret());
        });
        it('Non-existent button', () => {
            let script = `there is a button "I exist"`;
            let match = testLanguageGrammar.match(script, 'Conditional');
            assert.isTrue(match.succeeded());
            assert.isFalse(semantics(match).interpret());
        });
        it('Non-existent button', () => {
            let script = `there is not a button "I exist"`;
            let match = testLanguageGrammar.match(script, 'Conditional');
            assert.isTrue(match.succeeded());
            assert.isTrue(semantics(match).interpret());
        });
        it('Can add a button to the current card and then it will exist', () => {
            let addScript = `add button "I exist" to current card`;
            let addMatch = testLanguageGrammar.match(addScript, 'Command');
            let msg = semantics(addMatch).interpret();
            currentCard.sendMessage(msg, currentCard);
            let script = `there is a button "I exist" of current card`;
            let match = testLanguageGrammar.match(script, 'Conditional');
            assert.isTrue(match.succeeded());
            assert.isTrue(semantics(match).interpret());
            script = `there is a button "I exist"`;
            match = testLanguageGrammar.match(script, 'Conditional');
            assert.isTrue(match.succeeded());
            assert.isTrue(semantics(match).interpret());
        });
    });
});
