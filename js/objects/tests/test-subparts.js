/**
 * Window Part Tests
 * -----------------------------------
 * Basic tests of the Window Part.
 * Here we are just ensuring basic validity
 * checks and property setting
 */
import chai from 'chai';
const assert = chai.assert;
const expect = chai.expect;

import Window from '../parts/Window.js';

// Import valid subpart kinds
import WorldStack from '../parts/WorldStack';
import Stack from '../parts/Stack.js';
import Card from '../parts/Card.js';
import Background from '../parts/Background.js';
import Button from '../parts/Button.js';
import EricField from '../parts/EricField.js';


/*describe('Subpart Validity Tests', () => {
    it('#addPart will add Stack to World successfully', () => {
        let world = new WorldStack();
        let stack = new Stack();
        let addPartFunc = function(){
            world.addPart(stack);
        };
        expect(addPartFunc).to.not.throw(Error);
    });
    it('#addPart will not add Card to World', () => {
        let world = new WorldStack();
        let stack = new Stack();
        let card = new Card(stack);
        let addPartFunc = function(){
            world.addPart(card);
        };
        expect(addPartFunc).to.throw("card is not a valid subpart of world");
    });
    it('#addPart will not add Background to Card', () => {
        let stack = new Stack();
        let card = new Card(stack);
        let background = new Background(stack);
        let addPartFunc = function(){
            card.addPart(background);
        };
        expect(addPartFunc).to.throw("background is not a valid subpart of card");
    });
});*/

describe('Subpart Validity Tests', () => {
    describe('Card', () => {
        it('Accepts Button', () => {
            let button = new Button();
            let card = new Card();
            assert.isTrue(card.acceptsSubpart(button));
        });
        it('Accepts EricField', () => {
            let ericField = new EricField();
            let card = new Card();
            assert.isTrue(card.acceptsSubpart(ericField));
        });
        it('Rejects Stack', () => {
            let stack = new Stack();
            let card = new Card();
            assert.isFalse(
                card.acceptsSubpart(stack)
            );
        });
        it('Rejects World', () => {
            let world = new WorldStack();
            let card = new Card();
            assert.isFalse(
                card.acceptsSubpart(world)
            );
        });
        it('Rejects Background', () => {
            let background = new Background();
            let card = new Card();
            assert.isFalse(
                card.acceptsSubpart(background)
            );
        });
        it('Rejects Window', () => {
            let win = new Window();
            let card = new Card();
            assert.isFalse(card.acceptsSubpart(win));
        });
    });

    describe('Stack', () => {
        it('Accepts Card', () => {
            let card = new Card();
            let stack = new Stack();
            assert.isTrue(stack.acceptsSubpart(card));
        });
        it('Accepts Window', () => {
            let win = new Window();
            let stack = new Stack();
            assert.isTrue(stack.acceptsSubpart(win));
        });
        it('Rejects Button', () => {
            let button = new Button();
            let stack = new Stack();
            assert.isFalse(stack.acceptsSubpart(button));
        });
        it('Rejects EricField', () => {
            let ericField = new EricField();
            let stack = new Stack();
            assert.isFalse(stack.acceptsSubpart(ericField));
        });
        it('Rejects World', () => {
            let world = new WorldStack();
            let stack = new Stack();
            assert.isFalse(stack.acceptsSubpart(world));
        });
    });

    describe('Button', () => {
        it('Rejects Card', () => {
            let card = new Card();
            let button = new Button();
            assert.isFalse(button.acceptsSubpart(card));
        });
        it('Rejects EricField', () => {
            let ericField = new EricField();
            let button = new Button();
            assert.isFalse(button.acceptsSubpart(ericField));
        });
        it('Rejects World', () => {
            let world = new WorldStack();
            let button = new Button();
            assert.isFalse(button.acceptsSubpart(world));
        });
        it('Rejects Stack', () => {
            let stack = new Stack();
            let button = new Button();
            assert.isFalse(button.acceptsSubpart(stack));
        });
        it('Rejects Window', () => {
            let win = new Window();
            let button = new Button();
            assert.isFalse(button.acceptsSubpart(win));
        });
    });

    describe('WorldStack', () => {
        it('Accepts Stack', () => {
            let stack = new Stack();
            let world = new WorldStack();
            assert.isTrue(world.acceptsSubpart(stack));
        });
        it('Rejects Card', () => {
            let card = new Card();
            let world = new WorldStack();
            assert.isFalse(world.acceptsSubpart(card));
        });
        it('Rejects Window', () => {
            let win = new Window();
            let world = new WorldStack();
            assert.isFalse(world.acceptsSubpart(win));
        });
        it('Rejects Button', () => {
            let button = new Button();
            let world = new WorldStack();
            assert.isFalse(world.acceptsSubpart(button));
        });
        it('Rejects EricField', () => {
            let ericField = new EricField();
            let world = new WorldStack();
            assert.isFalse(world.acceptsSubpart(ericField));
        });
    });

    describe('EricField', () => {
        it('Rejects Card', () => {
            let card = new Card();
            let field = new EricField();
            assert.isFalse(field.acceptsSubpart(card));
        });
        it('Rejects Button', () => {
            let button = new Button();
            let field = new EricField();
            assert.isFalse(field.acceptsSubpart(button));
        });
        it('Rejects World', () => {
            let world = new WorldStack();
            let field = new EricField();
            assert.isFalse(field.acceptsSubpart(world));
        });
        it('Rejects Stack', () => {
            let stack = new Stack();
            let field = new EricField();
            assert.isFalse(field.acceptsSubpart(stack));
        });
        it('Rejects Window', () => {
            let win = new Window();
            let field = new EricField();
            assert.isFalse(field.acceptsSubpart(win));
        });
    });
});
