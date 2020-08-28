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
import Stack from '../parts/Stack.js';
import WorldStack from '../parts/WorldStack';

// Import one invalid subpart kind
import Button from '../parts/Button.js';

let windowModel;
describe('Window Part Tests', () => {
    it('#addPart will add Stack as a subpart successfully', () => {
        let win = new Window();
        let stack = new Stack();
        let addPartFunc = function(){
            win.addPart(stack);
        };

        expect(addPartFunc).to.not.throw(Error);
    });

    it('#addPart will add a WorldStack as a subpart successfully', () => {
        let win = new Window();
        let worldstack = new WorldStack();
        let addPartFunc = function(){
            win.addPart(worldstack);
        };

        expect(addPartFunc).to.not.throw(Error);
    });

    it('#addPart will NOT add a non-stack Part successfully', () => {
        let win = new Window();
        let button;
        let addPartFunc = function(){
            button = new Button(win);
            win.addPart(button);
        };

        expect(addPartFunc).to.throw(Error);
    });

    it('#setTarget sets target object', () => {
        let targetPart = new Stack();
        let win = new Window();

        win.setTarget(targetPart);

        assert.equal(win.target, targetPart);
    });

    it('#setTarget sets targetId part property to target parts id', () => {
        let targetPart = new Stack();
        let win = new Window();
        win.setTarget(targetPart);

        let foundId = win.partProperties.getPropertyNamed(
            win,
            'targetId'
        );

        assert.equal(foundId, targetPart.id);
    });
});
