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

// Import valid subpart kinds
import WorldStack from '../parts/WorldStack';
import Stack from '../parts/Stack.js';
import Card from '../parts/Card.js';
import Background from '../parts/Background.js';
import Button from '../parts/Button.js';
import Field from '../parts/Field.js';
import Image from '../parts/Image.js';
import Drawing from '../parts/Drawing.js';
import Audio from '../parts/Audio.js';
import Area from '../parts/Area.js';
import Window from '../parts/Window.js';


describe('Subpart Validity Tests', () => {
    describe('Card', () => {
        it('Accepts Button', () => {
            let button = new Button();
            let card = new Card();
            assert.isTrue(card.acceptsSubpart(button.type));
        });
        it('Accepts Field', () => {
            let field = new Field();
            let card = new Card();
            assert.isTrue(card.acceptsSubpart(field.type));
        });
        it('Accepts Image', () => {
            let image = new Image();
            let card = new Card();
            assert.isTrue(card.acceptsSubpart(image.type));
        });
        it('Accepts Drawing', () => {
            let drawing = new Drawing();
            let card = new Card();
            assert.isTrue(card.acceptsSubpart(drawing.type));
        });
        it('Accepts Audio', () => {
            let audio = new Audio();
            let card = new Card();
            assert.isTrue(card.acceptsSubpart(audio.type));
        });
        it('Accepts Window', () => {
            let win = new Window();
            let card = new Card();
            assert.isTrue(card.acceptsSubpart(win.type));
        });
        it('Rejects Stack', () => {
            let stack = new Stack();
            let card = new Card();
            assert.isFalse(
                card.acceptsSubpart(stack.type)
            );
        });
        it('Rejects World', () => {
            let world = new WorldStack();
            let card = new Card();
            assert.isFalse(
                card.acceptsSubpart(world.type)
            );
        });
        it('Rejects Background', () => {
            let background = new Background();
            let card = new Card();
            assert.isFalse(
                card.acceptsSubpart(background.type)
            );
        });
    });

    describe('Stack', () => {
        it('Accepts Card', () => {
            let card = new Card();
            let stack = new Stack();
            assert.isTrue(stack.acceptsSubpart(card.type));
        });
        it('Accepts Button', () => {
            let button = new Button();
            let card = new Card();
            assert.isTrue(card.acceptsSubpart(button.type));
        });
        it.skip('Accepts Image', () => {
            let image = new Image();
            let card = new Card();
            assert.isTrue(card.acceptsSubpart(image.type));
        });
        it.skip('Accepts Audio', () => {
            let audio = new Audio();
            let card = new Card();
            assert.isTrue(card.acceptsSubpart(audio.type));
        });
        it('Accepts Window', () => {
            let win = new Window();
            let stack = new Stack();
            assert.isTrue(stack.acceptsSubpart(win.type));
        });
        it('Accepts Field', () => {
            let ericField = new Field();
            let stack = new Stack();
            assert.isTrue(stack.acceptsSubpart(ericField.type));
        });
        it('Rejects World', () => {
            let world = new WorldStack();
            let stack = new Stack();
            assert.isFalse(stack.acceptsSubpart(world.type));
        });
    });

    describe('Button', () => {
        it('Rejects Card', () => {
            let card = new Card();
            let button = new Button();
            assert.isFalse(button.acceptsSubpart(card.type));
        });
        it('Rejects Field', () => {
            let ericField = new Field();
            let button = new Button();
            assert.isFalse(button.acceptsSubpart(ericField.type));
        });
        it('Rejects World', () => {
            let world = new WorldStack();
            let button = new Button();
            assert.isFalse(button.acceptsSubpart(world.type));
        });
        it('Rejects Stack', () => {
            let stack = new Stack();
            let button = new Button();
            assert.isFalse(button.acceptsSubpart(stack.type));
        });
        it('Rejects Window', () => {
            let win = new Window();
            let button = new Button();
            assert.isFalse(button.acceptsSubpart(win.type));
        });
    });

    describe('WorldStack', () => {
        it('Accepts Stack', () => {
            let stack = new Stack();
            let world = new WorldStack();
            assert.isTrue(world.acceptsSubpart(stack.type));
        });
        it('Rejects Card', () => {
            let card = new Card();
            let world = new WorldStack();
            assert.isFalse(world.acceptsSubpart(card.type));
        });
        it('Rejects Window', () => {
            let win = new Window();
            let world = new WorldStack();
            assert.isFalse(world.acceptsSubpart(win.type));
        });
        it('Rejects Button', () => {
            let button = new Button();
            let world = new WorldStack();
            assert.isFalse(world.acceptsSubpart(button.type));
        });
        it('Rejects Field', () => {
            let ericField = new Field();
            let world = new WorldStack();
            assert.isFalse(world.acceptsSubpart(ericField.type));
        });
    });

    describe('Field', () => {
        it('Rejects Card', () => {
            let card = new Card();
            let field = new Field();
            assert.isFalse(field.acceptsSubpart(card.type));
        });
        it('Rejects Button', () => {
            let button = new Button();
            let field = new Field();
            assert.isFalse(field.acceptsSubpart(button.type));
        });
        it('Rejects World', () => {
            let world = new WorldStack();
            let field = new Field();
            assert.isFalse(field.acceptsSubpart(world.type));
        });
        it('Rejects Stack', () => {
            let stack = new Stack();
            let field = new Field();
            assert.isFalse(field.acceptsSubpart(stack.type));
        });
        it('Rejects Window', () => {
            let win = new Window();
            let field = new Field();
            assert.isFalse(field.acceptsSubpart(win.type));
        });
    });

    describe('Window', () => {
        it('Rejects World', () => {
            let world = new WorldStack();
            let window = new Window();
            assert.isFalse(window.acceptsSubpart(world.type));
        });
        it('Rejects Stack', () => {
            let stack = new Stack();
            let window = new Window();
            assert.isFalse(window.acceptsSubpart(stack.type));
        });
        it('Rejects Card', () => {
            let card = new Card();
            let window = new Window();
            assert.isFalse(window.acceptsSubpart(card.type));
        });
        it('Rejects Window', () => {
            let win = new Window();
            let window = new Window();
            assert.isFalse(window.acceptsSubpart(win.type));
        });
        it('Accepts Area', () => {
            let area = new Area();
            let window = new Window();
            assert.isTrue(window.acceptsSubpart(area.type));
        });
    });
});
