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

describe('"there is (not) (a|an)" conditional tests', () => {
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
describe('"there is (not) a property" conditional tests', () => {
    let semantics;
    let currentCard;
    describe('current card tests', () => {
        it('Can create a semantics for current card without error', () => {
            currentCard = System.getCurrentCardModel();
            let initSemantics = function(){
                semantics = getSemanticsFor(currentCard);
            };
            expect(initSemantics).to.not.throw();
        });
        it('Basic (core) property exists (without specifier)', () => {
            let script = `there is a property "id"`;
            let match = testLanguageGrammar.match(script, 'Conditional');
            assert.isTrue(match.succeeded());
            assert.isTrue(semantics(match).interpret());
        });
        it('Basic (core) property exists (with specifier)', () => {
            let script = `there is a property "id" of current card`;
            let match = testLanguageGrammar.match(script, 'Conditional');
            assert.isTrue(match.succeeded());
            assert.isTrue(semantics(match).interpret());
        });
        it('Basic (core) property doesn not exist (without specifier)', () => {
            let script = `there is a property "new-prop"`;
            let match = testLanguageGrammar.match(script, 'Conditional');
            assert.isTrue(match.succeeded());
            assert.isFalse(semantics(match).interpret());
            script = `there is not a property "new-prop"`;
            match = testLanguageGrammar.match(script, 'Conditional');
            assert.isTrue(match.succeeded());
            assert.isTrue(semantics(match).interpret());
        });
        it('Basic (core) property does not exist (with specifier)', () => {
            let script = `there is a property "new-prop" of current card`;
            let match = testLanguageGrammar.match(script, 'Conditional');
            assert.isTrue(match.succeeded());
            assert.isFalse(semantics(match).interpret());
            script = `there is not a property "new-prop" of current card`;
            match = testLanguageGrammar.match(script, 'Conditional');
            assert.isTrue(match.succeeded());
            assert.isTrue(semantics(match).interpret());
        });
        it('Can add a property to the current card and then it will exist', () => {
            let addScript = `add property "new-prop" to current card`;
            let addMatch = testLanguageGrammar.match(addScript, 'Command');
            let msg = semantics(addMatch).interpret();
            currentCard.sendMessage(msg, currentCard);
            let script = `there is a property "new-prop" of current card`;
            let match = testLanguageGrammar.match(script, 'Conditional');
            assert.isTrue(match.succeeded());
            assert.isTrue(semantics(match).interpret());
            script = `there is a property "new-prop"`;
            match = testLanguageGrammar.match(script, 'Conditional');
            assert.isTrue(match.succeeded());
            assert.isTrue(semantics(match).interpret());
        });
    });
});
