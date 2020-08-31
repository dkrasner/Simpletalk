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


describe('Subpart Validity Tests', () => {
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
});
