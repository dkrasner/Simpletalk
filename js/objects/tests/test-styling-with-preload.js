/**
 *  Style and related property testing 
 * ----------------------------------
 */

import chai from 'chai';
const assert = chai.assert;
const expect = chai.expect;
import styler from '../utils/styler.js';

let currentCardModel;
let buttonModel;
let stylerObj;

describe('Styler Util', () => {
    before(() => {
        stylerObj = {};
    });
    it('Color style conversion', () => {
        styler(stylerObj, "font-color", "red");
        assert.equal("red", stylerObj["color"]);
    });
    it('Background Color style conversion', () => {
        styler(stylerObj, "background-color", "red");
        assert.equal("red", stylerObj["backgroundColor"]);
    });
    it('Styles updated properly', () => {
        styler(stylerObj, "background-color", "black");
        assert.equal("black", stylerObj["backgroundColor"]);
        styler(stylerObj, "font-color", "black");
        assert.equal("black", stylerObj["color"]);
    });
});

describe.skip('Styling Properties', () => {
    before(() => {
        let currentCardView = document.querySelector('.current-stack > .current-card');
        currentCardModel = currentCardView.model;
        assert.exists(currentCardModel);
        let addButton = function(){
            let msg = {
                type: 'command',
                commandName: 'newModel',
                args: [
                    'button',
                    currentCardModel.id,
                    'card'
                ]
            };
            currentCardModel.sendMessage(msg, currentCardModel);
        };
        expect(addButton).to.not.throw(Error);
        let button = currentCardModel.subparts.filter(subpart => {
            return subpart.type == 'button';
        })[0];
        buttonModel = button;
        assert.exists(buttonModel);
    });
    it('Updaing the styling properties, updates the cssStyle property', () => {
    });
});
