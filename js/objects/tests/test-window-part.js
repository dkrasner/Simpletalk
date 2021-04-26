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
import Area from '../parts/Area.js';
import Stack from '../parts/Stack';

// Import one invalid subpart kind
import Button from '../parts/Button.js';

let windowModel;
describe('Window Part Tests', () => {
    it('#addPart will add Area as a subpart successfully', () => {
        let win = new Window();
        let area = new Area();
        let addPartFunc = function(){
            win.addPart(area);
        };

        expect(addPartFunc).to.not.throw(Error);
    });

    it('#addPart will NOT add a stack Part successfully', () => {
        let win = new Window();
        let Stack;
        let addPartFunc = function(){
            stack = new Stack(win);
            win.addPart(stack);
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
