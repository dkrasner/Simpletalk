/**
 * Lifecycle Scripting Preload Tests
 * -----------------------------------------
 * This file tests scriptable lifecycle handlers,
 * like openCard, openStack, openWorld, etc.
 */
import chai from 'chai';
import ohm from 'ohm-js';
const assert = chai.assert;
const expect = chai.expect;

function compileScriptForPart(aScript, aPart){
    let msg = {
        type: 'compile',
        targetId: aPart.id,
        codeString: aScript
    };
    aPart.sendMessage(msg, aPart);
}

describe("Lifecycle Scripting Tests", () => {
    describe("Setup", () => {
        it("There is one stack in the world", () => {
            let world = System.partsById['world'];
            let stacks = world.subparts.filter(subpart => {
                return subpart.type == 'stack';
            });
            assert.equal(stacks.length, 1);
        });
        it("We can add another stack to the World without issue", () => {
            let addStackAction = function(){
                System.newModel(
                    'stack',
                    'world'
                );
            };
            expect(addStackAction).to.not.throw();
        });
        it("There are now two stacks in the world", () => {
            let world = System.partsById['world'];
            let stacks = world.subparts.filter(subpart => {
                return subpart.type == 'stack';
            });
            assert.equal(stacks.length, 2);
        });
        it("We can add a card to the first stack without issue", () => {
            let firstStack = System.getCurrentStackModel();
            let addCardAction = function(){
                System.newModel('card', firstStack.id);
            };
            expect(addCardAction).to.not.throw();
            let cards = firstStack.subparts.filter(subpart => {
                return subpart.type == 'card';
            });
            assert.equal(cards.length, 2);
        });
        it("Can compile test script for first card of first stack", () => {
            let firstCard = System.getCurrentCardModel();
            let script = [
                'on openCard',
                '\tset "name" to "Card Opened"',
                'end openCard',
                '\n',
                'on closeCard',
                '\tset "name" to "Card Closed"',
                'end openCard'
            ].join('\n');
            let compileAction = function(){
                compileScriptForPart(script, firstCard);
            };
            expect(compileAction).to.not.throw();
        });
        it("Can compile test script for first stack", () => {
            let firstStack = System.getCurrentStackModel();
            let script = [
                'on openStack',
                '\tset "name" to "Stack Opened"',
                'end openStack',
                '\n',
                'on closeStack',
                '\tset "name" to "Stack Closed"',
                'end closeStack'
            ].join('\n');
            let compileAction = function(){
                compileScriptForPart(script, firstStack);
            };
            expect(compileAction).to.not.throw();
        });
        it("Can compile test script for world", () => {
            let world = System.partsById['world'];
            let script = [
                'on openWorld',
                '\tset "name" to "World Opened"',
                'end openWorld'
            ].join('\n');
            let compileAction = function(){
                compileScriptForPart(script, world);
                world.partProperties.setPropertyNamed(
                    world,
                    'script',
                    script
                );
                System.serialize();
            };
            expect(compileAction).to.not.throw();
        });
    });
    describe("openCard and closeCard tests", () => {
        let stack;
        let firstCard;
        before(() => {
            let world = System.partsById['world'];
            stack = world.subparts.filter(subpart => {
                return subpart.type == 'stack';
            })[0];
            firstCard = stack.subparts.filter(subpart => {
                return subpart.type == 'card';
            })[0];
        });
        // We have openCard and closeCard handlers now
        // attached to the first card of the first stack.
        // navigating to the second card should change the
        // card's name to 'Card Closed' and then navigating back to
        // it should change its name to 'Card Opened'
        it("closeCard triggered when navigating away from card", () => {
            stack.goToNextCard();
            let name = firstCard.partProperties.getPropertyNamed(
                firstCard,
                'name'
            );
            assert.equal(name, 'Card Closed');
        });
        it("openCard triggered when navigating to card", () => {
            stack.goToNextCard();
            let name = firstCard.partProperties.getPropertyNamed(
                firstCard,
                'name'
            );
            assert.equal(name, 'Card Opened');
        });
    });
    describe("openStack and closeStack tests", () => {
        let firstStack;
        let world;
        before(() => {
            world = System.partsById['world'];
            firstStack = world.subparts.filter(subpart => {
                return subpart.type == 'stack';
            })[0];
        });
        // We have openStack and closeStack handlers now
        // attached to the first stack of the world.
        // Navigating to the second stack should change the
        // first's name to 'Stack Closed' and then navigating
        // back to it should change its name to 'Stack Opened'
        it('closeStack triggered when navigating away from stack', () => {
            world.goToNextStack();
            let name = firstStack.partProperties.getPropertyNamed(
                firstStack,
                'name'
            );
            assert.equal(name, 'Stack Closed');
        });
        it('openStack triggered when navigating to the stack', () => {
            world.goToNextStack();
            let name = firstStack.partProperties.getPropertyNamed(
                firstStack,
                'name'
            );
            assert.equal(name, 'Stack Opened');
        });
    });
    describe("openWorld will be triggered", () => {
        // We manually call System.initialLoad to try and
        // trigger the world opening.
        let world;
        before(() => {
            world = System.partsById['world'];
        });
        it("World does not have a name yet (openWorld not yet triggered)", () => {
            let name = world.partProperties.getPropertyNamed(
                world,
                'name'
            );
            assert.equal(name, '');
        });
        it("Has the openWorld name change after System.initialLoad", () => {
            System.initialLoad();
            world = System.partsById['world']; // Refer to new object
            let name = world.partProperties.getPropertyNamed(
                world,
                'name'
            );
            assert.equal(name, 'World Opened');
        });
    });
});
