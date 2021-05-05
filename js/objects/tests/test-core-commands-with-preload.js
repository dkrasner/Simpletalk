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

describe('Core command tests', () => {
    let semantics;
    let currentCard;
    let button;
    describe('Ask - answer model tests', () => {
        before('', () => {
            currentCard = System.getCurrentCardModel();
            let initSemantics = function(){
                semantics = getSemanticsFor(currentCard);
            };
            expect(initSemantics).to.not.throw();
        });
        it.skip('Can ask (string)', () => {
            // no prompt in Node
            let script = `ask "OK then?"`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            let sendMsg = function(){
                currentCard.sendMessage(msg, currentCard);
            };
            expect(sendMsg).to.not.throw();
        });
        it('Can answer (string)', () => {
            let script = `answer "OK then"`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            let sendMsg = function(){
                currentCard.sendMessage(msg, currentCard);
            };
            expect(sendMsg).to.not.throw();
        });
    });
    describe('Delete model tests', () => {
        before('', () => {
            currentCard = System.getCurrentCardModel();
            let initSemantics = function(){
                semantics = getSemanticsFor(currentCard);
            };
            expect(initSemantics).to.not.throw();
            let script = `add button "Test Button 1" to current card`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            currentCard.sendMessage(msg, currentCard);
            assert.equal(currentCard.subparts.length, 1);
            button = currentCard.subparts[0];
        });
        it('Can remove button (by id)', () => {
            let script = `delete button id ${button.id}`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            currentCard.sendMessage(msg, currentCard);
            assert.equal(currentCard.subparts.length, 0);
            // add the button back in
            script = `add button "Test Button 1" to current card`;
            match = testLanguageGrammar.match(script, 'Command');
            msg = semantics(match).interpret();
            currentCard.sendMessage(msg, currentCard);
            assert.equal(currentCard.subparts.length, 1);
            button = currentCard.subparts[0];
        });
        it('Can remove first button', () => {
            let script = `delete first button`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            currentCard.sendMessage(msg, currentCard);
            assert.equal(currentCard.subparts.length, 0);
        });
    });
    describe('Tell tests', () => {
        let button1;
        let button2;
        before('', () => {
            currentCard = System.getCurrentCardModel();
            let initSemantics = function(){
                semantics = getSemanticsFor(currentCard);
            };
            expect(initSemantics).to.not.throw();
            let script = `add button "Test Button 1" to current card`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            currentCard.sendMessage(msg, currentCard);
            assert.equal(currentCard.subparts.length, 1);
            button1 = currentCard.subparts[0];
            script = `add button "Test Button 2" to current card`;
            match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            msg = semantics(match).interpret();
            assert.exists(msg);
            currentCard.sendMessage(msg, currentCard);
            assert.equal(currentCard.subparts.length, 2);
            button2 = currentCard.subparts[1];
        });
        it('Can tell button to set basic property', () => {
            let script = `tell button id ${button1.id} to set "text-color" to "red"`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            let sendMsg = function(){
                currentCard.sendMessage(msg, currentCard);
            };
            expect(sendMsg).to.not.throw();
            let prop = button1.partProperties.getPropertyNamed(button1, "text-color");
            assert.equal(prop, "red");
        });
        it('Can tell button to set target property (string)', () => {
            let script = `tell button id ${button1.id} to set "target" to "second button of current card"`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            let sendMsg = function(){
                currentCard.sendMessage(msg, currentCard);
            };
            expect(sendMsg).to.not.throw();
            let prop = button1.partProperties.getPropertyNamed(button1, "target");
            assert.equal(prop, "second button of current card");
        });
        it('Can tell button to set target property (object specifier)', () => {
            let script = `tell button id ${button1.id} to set "target" to second button of current card`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            let sendMsg = function(){
                currentCard.sendMessage(msg, currentCard);
            };
            expect(sendMsg).to.not.throw();
            let prop = button1.partProperties.getPropertyNamed(button1, "target");
            assert.equal(prop, `part id ${button2.id}`);
        });
        it('Can tell button to set target property (object specifier by name)', () => {
            let script = `tell button id ${button1.id} to set "target" to button "Test Button 2"`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            let sendMsg = function(){
                currentCard.sendMessage(msg, currentCard);
            };
            expect(sendMsg).to.not.throw();
            let prop = button1.partProperties.getPropertyNamed(button1, "target");
            assert.equal(prop, `part id ${button2.id}`);
        });
        it.skip('Can tell the target', () => {
            let script = `tell button id ${button1.id} to tell target to set "text-color" to "black"`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            let sendMsg = function(){
                currentCard.sendMessage(msg, currentCard);
            };
            expect(sendMsg).to.not.throw();
            let prop = button2.partProperties.getPropertyNamed(button2, "text-color");
            assert.equal(prop, "black");
        });
    });
});
