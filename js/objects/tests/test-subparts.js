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
            assert.isTrue(card.checkSubpartValidity(button));
        });
        it('Accepts EricField', () => {
            let ericField = new EricField();
            let card = new Card();
            assert.isTrue(card.checkSubpartValidity(ericField));
        });
        it('Rejects Stack', () => {
            let stack = new Stack();
            let card = new Card();
            assert.isFalse(
                card.checkSubpartValidity(stack)
            );
        });
        it('Rejects World', () => {
            let world = new WorldStack();
            let card = new Card();
            assert.isFalse(
                card.checkSubpartValidity(world)
            );
        });
        it('Rejects Background', () => {
            let background = new Background();
            let card = new Card();
            assert.isFalse(
                card.checkSubpartValidity(background)
            );
        });
        it('Rejects Window', () => {
            let win = new Window();
            let card = new Card();
            assert.isFalse(card.checkSubpartValidity(win));
        });
    });

    describe('Stack', () => {
        it('Accepts Card', () => {
            let card = new Card();
            let stack = new Stack();
            assert.isTrue(stack.checkSubpartValidity(card));
        });
        it('Accepts Window', () => {
            let win = new Window();
            let stack = new Stack();
            assert.isTrue(stack.checkSubpartValidity(win));
        });
        it('Rejects Button', () => {
            let button = new Button();
            let stack = new Stack();
            assert.isFalse(stack.checkSubpartValidity(button));
        });
        it('Rejects EricField', () => {
            let ericField = new EricField();
            let stack = new Stack();
            assert.isFalse(stack.checkSubpartValidity(ericField));
        });
        it('Rejects World', () => {
            let world = new WorldStack();
            let stack = new Stack();
            assert.isFalse(stack.checkSubpartValidity(world));
        });
    });

    describe('Button', () => {
        it('Rejects Card', () => {
            let card = new Card();
            let button = new Button();
            assert.isFalse(button.checkSubpartValidity(card));
        });
        it('Rejects EricField', () => {
            let ericField = new EricField();
            let button = new Button();
            assert.isFalse(button.checkSubpartValidity(ericField));
        });
        it('Rejects World', () => {
            let world = new WorldStack();
            let button = new Button();
            assert.isFalse(button.checkSubpartValidity(world));
        });
        it('Rejects Stack', () => {
            let stack = new Stack();
            let button = new Button();
            assert.isFalse(button.checkSubpartValidity(stack));
        });
        it('Rejects Window', () => {
            let win = new Window();
            let button = new Button();
            assert.isFalse(button.checkSubpartValidity(win));
        });
    });

    describe('WorldStack', () => {
        it('Accepts Stack', () => {
            let stack = new Stack();
            let world = new WorldStack();
            assert.isTrue(world.checkSubpartValidity(stack));
        });
        it('Rejects Card', () => {
            let card = new Card();
            let world = new WorldStack();
            assert.isFalse(world.checkSubpartValidity(card));
        });
        it('Rejects Window', () => {
            let win = new Window();
            let world = new WorldStack();
            assert.isFalse(world.checkSubpartValidity(win));
        });
        it('Rejects Button', () => {
            let button = new Button();
            let world = new WorldStack();
            assert.isFalse(world.checkSubpartValidity(button));
        });
        it('Rejects EricField', () => {
            let ericField = new EricField();
            let world = new WorldStack();
            assert.isFalse(world.checkSubpartValidity(ericField));
        });
    });

    describe('EricField', () => {
        it('Rejects Card', () => {
            let card = new Card();
            let field = new EricField();
            assert.isFalse(field.checkSubpartValidity(card));
        });
        it('Rejects Button', () => {
            let button = new Button();
            let field = new EricField();
            assert.isFalse(field.checkSubpartValidity(button));
        });
        it('Rejects World', () => {
            let world = new WorldStack();
            let field = new EricField();
            assert.isFalse(field.checkSubpartValidity(world));
        });
        it('Rejects Stack', () => {
            let stack = new Stack();
            let field = new EricField();
            assert.isFalse(field.checkSubpartValidity(stack));
        });
        it('Rejects Window', () => {
            let win = new Window();
            let field = new EricField();
            assert.isFalse(field.checkSubpartValidity(win));
        });
    });
});
