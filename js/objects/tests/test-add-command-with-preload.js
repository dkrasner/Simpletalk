/**
 * Testing the implementation of the
 * primitive add command in the interpreter
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

describe('Add command tests', () => {
    let semantics;
    let currentCard;
    let exampleArea;
    describe('Adding to current card tests', () => {
        it('Can create a semantics for current card without error', () => {
            currentCard = System.getCurrentCardModel();
            let initSemantics = function(){
                semantics = getSemanticsFor(currentCard);
            };
            expect(initSemantics).to.not.throw();
        });
        it('Can add a button to the current card using `current card`', () => {
            let script = `add button "Test Button 1" to current card`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            currentCard.sendMessage(msg, currentCard);
            assert.equal(currentCard.subparts.length, 1);
        });
        it('Can add an area to the current card without an object specifier (implicit context)', () => {
            let script = `add area "Test Area 1"`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            currentCard.sendMessage(msg, currentCard);
            assert.equal(currentCard.subparts.length, 2);
        });
    });
    describe('Adding to an area on current card', () => {
        it('Can create a semantics for the area', () => {
            exampleArea = currentCard.subparts.find(subpart => {
                return subpart.type == 'area';
            });
            assert.exists(exampleArea);
            let initSemantics = function(){
                semantics = getSemanticsFor(exampleArea);
            };
            expect(initSemantics).to.not.throw();
        });
        it('Can add a button to the area by using object specifier', () => {
            let script = `add button "Area Button 1" to first area of current card`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            exampleArea.sendMessage(msg, exampleArea);
            assert.equal(exampleArea.subparts.length, 1);
        });
        it('Can add a button to the area using `this area` specifier', () => {
            let script = `add button "Area Button 2" to this area`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            exampleArea.sendMessage(msg, exampleArea);
            assert.equal(exampleArea.subparts.length, 2);
        });
        it('Can add a button to the area without object specifier (implicit context)', () => {
            let script = `add button "Area Button 3"`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            exampleArea.sendMessage(msg, exampleArea);
            assert.equal(exampleArea.subparts.length, 3);
        });
        it('Can `tell` area to add a button using `this area` object specifier', () => {
            let script = `tell first area of current card to add button "Area Button 4" to first area of current card`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            exampleArea.sendMessage(msg, exampleArea);
            assert.equal(exampleArea.subparts.length, 4);
        });
        it('Can `tell` area to add a button using no specifier (implicit context)', () => {
            let script = `tell first area of current card to add button "Area Button 5"`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            exampleArea.sendMessage(msg, exampleArea);
            assert.equal(exampleArea.subparts.length, 5);
        });
    });
});
