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

describe('Private command tests', () => {
    let semantics;
    let currentStack;
    let currentCard;
    let button1;
    describe('Move', () => {
        before('', () => {
            currentCard = System.getCurrentCardModel();
            let initSemantics = function(){
                semantics = getSemanticsFor(currentCard);
            };
            expect(initSemantics).to.not.throw();
            let script = `add button "Button 1" to current card`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            currentCard.sendMessage(msg, currentCard);
            assert.equal(currentCard.subparts.length, 1);
            button1 = currentCard.subparts[0];
            button1.partProperties.setPropertyNamed(button1, "wants-move", true);
        });
        it('Moving by x y', () => {
            let script = `tell button "Button 1" to move 10, 20`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            currentCard.sendMessage(msg, button1);
            let top = button1.partProperties.getPropertyNamed(button1, "top");
            let left = button1.partProperties.getPropertyNamed(button1, "left");
            assert.equal(20, top);
            assert.equal(10, left);
        });
    });
    describe('Subpart re-order basic (no cards, stacks)', () => {
        let currentCardView;
        let button2;
        let button3;
        before('', () => {
            currentCard = System.getCurrentCardModel();
            currentCardView = System.findViewById(currentCard.id);
            let initSemantics = function(){
                semantics = getSemanticsFor(currentCard);
            };
            expect(initSemantics).to.not.throw();
            let script = `add button "Button 2" to current card`;
            let match = testLanguageGrammar.match(script, 'Command');
            let msg = semantics(match).interpret();
            currentCard.sendMessage(msg, currentCard);
            script = `add button "Button 3" to current card`;
            match = testLanguageGrammar.match(script, 'Command');
            msg = semantics(match).interpret();
            currentCard.sendMessage(msg, currentCard);
            button2 = currentCard.subparts[1];
            button3 = currentCard.subparts[2];
        });
        it('Check that subpart and DOM child order is in sync', () => {
            for(let i=0; i <=2; i++){
                let button = currentCard.subparts[i];
                let name = button.partProperties.getPropertyNamed(button, "name");
                assert.equal(`Button ${i+1}`, name);
                let buttonView = currentCardView.childNodes[i];
                assert.equal(button.id, buttonView.getAttribute("part-id"));
            }
        });
        it('MoveToLast', () => {
            let script = `tell button "Button 1" to moveToLast`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            currentCard.sendMessage(msg, button1);
            // button 1 is now last
            assert.equal(currentCard.subparts[2], button1);
            assert.equal(button1.id, currentCardView.childNodes[2].getAttribute("part-id"));
            // button 2 is now first
            assert.equal(currentCard.subparts[0], button2);
            assert.equal(button2.id, currentCardView.childNodes[0].getAttribute("part-id"));
            // button 3 is now second
            assert.equal(currentCard.subparts[1], button3);
            assert.equal(button3.id, currentCardView.childNodes[1].getAttribute("part-id"));
        });
        it('MoveToLast is idempotent', () => {
            let script = `tell button "Button 1" to moveToLast`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            currentCard.sendMessage(msg, button1);
            // button 1 is now last
            assert.equal(currentCard.subparts[2], button1);
            assert.equal(button1.id, currentCardView.childNodes[2].getAttribute("part-id"));
            // button 2 is now first
            assert.equal(currentCard.subparts[0], button2);
            assert.equal(button2.id, currentCardView.childNodes[0].getAttribute("part-id"));
            // button 3 is now second
            assert.equal(currentCard.subparts[1], button3);
            assert.equal(button3.id, currentCardView.childNodes[1].getAttribute("part-id"));
        });
        it('MoveToFirst', () => {
            let script = `tell button "Button 1" to moveToFirst`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            currentCard.sendMessage(msg, button1);
            // button 1 is now first 
            assert.equal(currentCard.subparts[0], button1);
            assert.equal(button1.id, currentCardView.childNodes[0].getAttribute("part-id"));
            // button 2 is now second
            assert.equal(currentCard.subparts[1], button2);
            assert.equal(button2.id, currentCardView.childNodes[1].getAttribute("part-id"));
            // button 3 is now third
            assert.equal(currentCard.subparts[2], button3);
            assert.equal(button3.id, currentCardView.childNodes[2].getAttribute("part-id"));
        });
        it('MoveToFirst idempotent', () => {
            let script = `tell button "Button 1" to moveToFirst`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            currentCard.sendMessage(msg, button1);
            // button 1 is now first
            assert.equal(currentCard.subparts[0], button1);
            assert.equal(button1.id, currentCardView.childNodes[0].getAttribute("part-id"));
            // button 2 is now second
            assert.equal(currentCard.subparts[1], button2);
            assert.equal(button2.id, currentCardView.childNodes[1].getAttribute("part-id"));
            // button 3 is now third
            assert.equal(currentCard.subparts[2], button3);
            assert.equal(button3.id, currentCardView.childNodes[2].getAttribute("part-id"));
        });
        it('MoveDown', () => {
            let script = `tell button "Button 1" to moveDown`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            currentCard.sendMessage(msg, button1);
            // button 1 is now second
            assert.equal(currentCard.subparts[1], button1);
            assert.equal(button1.id, currentCardView.childNodes[1].getAttribute("part-id"));
            // button 2 is now first
            assert.equal(currentCard.subparts[0], button2);
            assert.equal(button2.id, currentCardView.childNodes[0].getAttribute("part-id"));
            // button 3 is now third
            assert.equal(currentCard.subparts[2], button3);
            assert.equal(button3.id, currentCardView.childNodes[2].getAttribute("part-id"));
        });
        it('MoveDown (again)', () => {
            let script = `tell button "Button 1" to moveDown`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            currentCard.sendMessage(msg, button1);
            // button 1 is now third
            assert.equal(currentCard.subparts[2], button1);
            assert.equal(button1.id, currentCardView.childNodes[2].getAttribute("part-id"));
            // button 2 is now first
            assert.equal(currentCard.subparts[0], button2);
            assert.equal(button2.id, currentCardView.childNodes[0].getAttribute("part-id"));
            // button 3 is now second
            assert.equal(currentCard.subparts[1], button3);
            assert.equal(button3.id, currentCardView.childNodes[1].getAttribute("part-id"));
        });
        it('MoveDown (moving last part is idempotent)', () => {
            let script = `tell button "Button 1" to moveDown`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            currentCard.sendMessage(msg, button1);
            // button 1 is now third
            assert.equal(currentCard.subparts[2], button1);
            assert.equal(button1.id, currentCardView.childNodes[2].getAttribute("part-id"));
            // button 2 is now first
            assert.equal(currentCard.subparts[0], button2);
            assert.equal(button2.id, currentCardView.childNodes[0].getAttribute("part-id"));
            // button 3 is now second
            assert.equal(currentCard.subparts[1], button3);
            assert.equal(button3.id, currentCardView.childNodes[1].getAttribute("part-id"));
        });
        it('MoveUp', () => {
            let script = `tell button "Button 1" to moveUp`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            currentCard.sendMessage(msg, button1);
            // button 1 is now second
            assert.equal(currentCard.subparts[1], button1);
            assert.equal(button1.id, currentCardView.childNodes[1].getAttribute("part-id"));
            // button 2 is now first
            assert.equal(currentCard.subparts[0], button2);
            assert.equal(button2.id, currentCardView.childNodes[0].getAttribute("part-id"));
            // button 3 is now third
            assert.equal(currentCard.subparts[2], button3);
            assert.equal(button3.id, currentCardView.childNodes[2].getAttribute("part-id"));
        });
        it('MoveUp (again)', () => {
            let script = `tell button "Button 1" to moveUp`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            currentCard.sendMessage(msg, button1);
            // button 1 is now first
            assert.equal(currentCard.subparts[0], button1);
            assert.equal(button1.id, currentCardView.childNodes[0].getAttribute("part-id"));
            // button 2 is now second
            assert.equal(currentCard.subparts[1], button2);
            assert.equal(button2.id, currentCardView.childNodes[1].getAttribute("part-id"));
            // button 3 is now third
            assert.equal(currentCard.subparts[2], button3);
            assert.equal(button3.id, currentCardView.childNodes[2].getAttribute("part-id"));
        });
        it('MoveUp (moving first part is idempotent)', () => {
            let script = `tell button "Button 1" to moveUp`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            currentCard.sendMessage(msg, button1);
            // button 1 is now first
            assert.equal(currentCard.subparts[0], button1);
            assert.equal(button1.id, currentCardView.childNodes[0].getAttribute("part-id"));
            // button 2 is now second
            assert.equal(currentCard.subparts[1], button2);
            assert.equal(button2.id, currentCardView.childNodes[1].getAttribute("part-id"));
            // button 3 is now third
            assert.equal(currentCard.subparts[2], button3);
            assert.equal(button3.id, currentCardView.childNodes[2].getAttribute("part-id"));
        });
    });
    describe('Subpart re-order with cards', () => {
        let currentStack;
        let currentStackView;
        let currentCardView;
        let  orderCheck = function(parentPart, newIndex, name){
            let parentView = System.findViewById(parentPart.id);
            let part = parentPart.subparts[newIndex];
            let nameProp = part.partProperties.getPropertyNamed(part, "name");
            assert.equal(nameProp, name);
            let view = System.findViewById(part.id);
            assert.equal(view, parentView.childNodes[newIndex]);
            assert.equal(part.id, view.getAttribute("part-id"));
        };
        before('', () => {
            currentCard = System.getCurrentCardModel();
            currentCard.partProperties.setPropertyNamed(currentCard, "name", "Current Card");
            currentCardView = System.findViewById(currentCard.id);
            currentStack = System.getCurrentStackModel();
            currentStackView = System.findViewById(currentStack.id);
            let initSemantics = function(){
                semantics = getSemanticsFor(currentCard);
            };
            expect(initSemantics).to.not.throw();
            let script = `add button "Button 1" to current stack`;
            let match = testLanguageGrammar.match(script, 'Command');
            let msg = semantics(match).interpret();
            currentCard.sendMessage(msg, currentCard);
            script = `add button "Button 2" to current stack`;
            match = testLanguageGrammar.match(script, 'Command');
            msg = semantics(match).interpret();
            currentCard.sendMessage(msg, currentCard);
            script = `add card "Card 2" to current stack`;
            match = testLanguageGrammar.match(script, 'Command');
            msg = semantics(match).interpret();
            currentCard.sendMessage(msg, currentCard);
            script = `add card "Card 3" to current stack`;
            match = testLanguageGrammar.match(script, 'Command');
            msg = semantics(match).interpret();
            currentCard.sendMessage(msg, currentCard);
        });
        it('Check that subpart and DOM child order is in sync', () => {
            // NOTE: cards precede buttons, even if the latter was added first
            // check order
            orderCheck(currentStack, 0, "Current Card");
            orderCheck(currentStack, 1, "Card 2");
            orderCheck(currentStack, 2, "Card 3");
            orderCheck(currentStack, 3, "Button 1");
            orderCheck(currentStack, 4, "Button 2");
        });
        it('MoveToLast', () => {
            let script = `tell current card to moveToLast`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            currentCard.sendMessage(msg, currentCard);
            // check order
            orderCheck(currentStack, 0, "Card 2");
            orderCheck(currentStack, 1, "Card 3");
            orderCheck(currentStack, 2, "Current Card");
            orderCheck(currentStack, 3, "Button 1");
            orderCheck(currentStack, 4, "Button 2");
        });
        it('MoveToLast is idempotent', () => {
            let script = `tell current card to moveToLast`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            currentCard.sendMessage(msg, currentCard);
            // check order
            orderCheck(currentStack, 0, "Card 2");
            orderCheck(currentStack, 1, "Card 3");
            orderCheck(currentStack, 2, "Current Card");
            orderCheck(currentStack, 3, "Button 1");
            orderCheck(currentStack, 4, "Button 2");
            script = `tell third card to moveToLast`;
            match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            msg = semantics(match).interpret();
            assert.exists(msg);
            currentCard.sendMessage(msg, currentCard);
            // check order
            orderCheck(currentStack, 0, "Card 2");
            orderCheck(currentStack, 1, "Card 3");
            orderCheck(currentStack, 2, "Current Card");
            orderCheck(currentStack, 3, "Button 1");
            orderCheck(currentStack, 4, "Button 2");
        });
        it('MoveToFirst', () => {
            let script = `tell current card to moveToFirst`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            currentCard.sendMessage(msg, currentCard);
            // check order
            orderCheck(currentStack, 0, "Current Card");
            orderCheck(currentStack, 1, "Card 2");
            orderCheck(currentStack, 2, "Card 3");
            orderCheck(currentStack, 3, "Button 1");
            orderCheck(currentStack, 4, "Button 2");
        });
        it('MoveToFirst is idempotent', () => {
            let script = `tell current card to moveToFirst`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            currentCard.sendMessage(msg, currentCard);
            // check order
            orderCheck(currentStack, 0, "Current Card");
            orderCheck(currentStack, 1, "Card 2");
            orderCheck(currentStack, 2, "Card 3");
            orderCheck(currentStack, 3, "Button 1");
            orderCheck(currentStack, 4, "Button 2");
        });
        it('MoveUp', () => {
            let script = `tell card "Card 2" to moveUp`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            currentCard.sendMessage(msg, currentCard);
            // check order
            orderCheck(currentStack, 1, "Current Card");
            orderCheck(currentStack, 0, "Card 2");
            orderCheck(currentStack, 2, "Card 3");
            orderCheck(currentStack, 3, "Button 1");
            orderCheck(currentStack, 4, "Button 2");
        });
        it('MoveDown', () => {
            let script = `tell card "Card 2" to moveDown`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            currentCard.sendMessage(msg, currentCard);
            // check order
            orderCheck(currentStack, 0, "Current Card");
            orderCheck(currentStack, 1, "Card 2");
            orderCheck(currentStack, 2, "Card 3");
            orderCheck(currentStack, 3, "Button 1");
            orderCheck(currentStack, 4, "Button 2");
        });
        it('MoveDown again', () => {
            let script = `tell card "Card 2" to moveDown`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            currentCard.sendMessage(msg, currentCard);
            // check order
            orderCheck(currentStack, 0, "Current Card");
            orderCheck(currentStack, 2, "Card 2");
            orderCheck(currentStack, 1, "Card 3");
            orderCheck(currentStack, 3, "Button 1");
            orderCheck(currentStack, 4, "Button 2");
        });
        it('MoveDown again (cannot move card after non-card part)', () => {
            let script = `tell card "Card 2" to moveDown`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            currentCard.sendMessage(msg, currentCard);
            // check order
            orderCheck(currentStack, 0, "Current Card");
            orderCheck(currentStack, 2, "Card 2");
            orderCheck(currentStack, 1, "Card 3");
            orderCheck(currentStack, 3, "Button 1");
            orderCheck(currentStack, 4, "Button 2");
        });
        it('MoveToFirst (cannot move non-card part before cards)', () => {
            let script = `tell button "Button 2" of current stack to moveToFirst`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            currentCard.sendMessage(msg, currentCard);
            orderCheck(currentStack, 0, "Current Card");
            orderCheck(currentStack, 2, "Card 2");
            orderCheck(currentStack, 1, "Card 3");
            orderCheck(currentStack, 4, "Button 1");
            orderCheck(currentStack, 3, "Button 2");
        });
        it('MoveUp (can move non-card parts up before non-card parts)', () => {
            let script = `tell button "Button 1" of current stack to moveUp`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            currentCard.sendMessage(msg, currentCard);
            orderCheck(currentStack, 0, "Current Card");
            orderCheck(currentStack, 2, "Card 2");
            orderCheck(currentStack, 1, "Card 3");
            orderCheck(currentStack, 3, "Button 1");
            orderCheck(currentStack, 4, "Button 2");
        });
        it('MoveUp (cannot move non-card part before cards)', () => {
            let script = `tell button "Button 1" of current stack to moveUp`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            currentCard.sendMessage(msg, currentCard);
            orderCheck(currentStack, 0, "Current Card");
            orderCheck(currentStack, 2, "Card 2");
            orderCheck(currentStack, 1, "Card 3");
            orderCheck(currentStack, 3, "Button 1");
            orderCheck(currentStack, 4, "Button 2");
        });
        it('MoveDown (can move non-card parts down after non-card parts)', () => {
            let script = `tell button "Button 1" of current stack to moveDown`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            currentCard.sendMessage(msg, currentCard);
            orderCheck(currentStack, 0, "Current Card");
            orderCheck(currentStack, 2, "Card 2");
            orderCheck(currentStack, 1, "Card 3");
            orderCheck(currentStack, 4, "Button 1");
            orderCheck(currentStack, 3, "Button 2");
        });
    });
    describe('Subpart re-order with stacks', () => {
        let world;
        let currentStack;
        let currentStackView;
        let currentCardView;
        let  orderCheck = function(parentPart, newIndex, name){
            let parentView = System.findViewById(parentPart.id);
            let part = parentPart.subparts[newIndex];
            let nameProp = part.partProperties.getPropertyNamed(part, "name");
            assert.equal(nameProp, name);
            let view = System.findViewById(part.id);
            assert.equal(view, parentView.childNodes[newIndex]);
            assert.equal(part.id, view.getAttribute("part-id"));
        };
        before('', () => {
            world = System.partsById['world'];
            currentCard = System.getCurrentCardModel();
            currentCardView = System.findViewById(currentCard.id);
            currentStack = System.getCurrentStackModel();
            currentStack.partProperties.setPropertyNamed(currentStack, "name", "Current Stack");
            currentStackView = System.findViewById(currentStack.id);
            let initSemantics = function(){
                semantics = getSemanticsFor(currentCard);
            };
            expect(initSemantics).to.not.throw();
            let script = `add stack "Stack 2" to this world`;
            let match = testLanguageGrammar.match(script, 'Command');
            let msg = semantics(match).interpret();
            currentCard.sendMessage(msg, currentCard);
            script = `add stack "Stack 3" to this world`;
            match = testLanguageGrammar.match(script, 'Command');
            msg = semantics(match).interpret();
            currentCard.sendMessage(msg, currentCard);
        });
        it('Check that subpart and DOM child order is in sync', () => {
            orderCheck(world, 0, "Current Stack");
            orderCheck(world, 1, "Stack 2");
            orderCheck(world, 2, "Stack 3");
        });
        it('MoveToLast', () => {
            let script = `tell current stack to moveToLast`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            currentStack.sendMessage(msg, currentStack);
            // check order
            orderCheck(world, 2, "Current Stack");
            orderCheck(world, 0, "Stack 2");
            orderCheck(world, 1, "Stack 3");
        });
        it('MoveToFirst', () => {
            let script = `tell current stack to moveToFirst`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            currentStack.sendMessage(msg, currentStack);
            // check order
            orderCheck(world, 0, "Current Stack");
            orderCheck(world, 1, "Stack 2");
            orderCheck(world, 2, "Stack 3");
        });
        it('MoveDown', () => {
            let script = `tell current stack to moveDown`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            currentStack.sendMessage(msg, currentStack);
            // check order
            orderCheck(world, 1, "Current Stack");
            orderCheck(world, 0, "Stack 2");
            orderCheck(world, 2, "Stack 3");
        });
        it('MoveUp', () => {
            let script = `tell current stack to moveUp`;
            let match = testLanguageGrammar.match(script, 'Command');
            assert.isTrue(match.succeeded());
            let msg = semantics(match).interpret();
            assert.exists(msg);
            currentStack.sendMessage(msg, currentStack);
            // check order
            orderCheck(world, 0, "Current Stack");
            orderCheck(world, 1, "Stack 2");
            orderCheck(world, 2, "Stack 3");
        });
    });
});
