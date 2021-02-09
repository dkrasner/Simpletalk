/**
 *  Style and related property testing 
 * ----------------------------------
 */

import chai from 'chai';
const assert = chai.assert;
const expect = chai.expect;
import cssStyler from '../utils/styler.js';

let currentCardModel;
let buttonModel;
let stylerObj;

describe('CSS Styler Util', () => {
    before(() => {
        stylerObj = {};
    });
    it('Text styles conversion', () => {
        cssStyler(stylerObj, "text-color", "red");
        assert.equal(stylerObj["color"], "red");
        cssStyler(stylerObj, "font", "Times");
        assert.equal(stylerObj["fontFamily"], "Times");
    });
    it('Name visibility', () => {
        cssStyler(stylerObj, "name-visible", true);
        assert.equal(stylerObj["color"], "red");
        cssStyler(stylerObj, "name-visible", false);
        assert.equal(stylerObj["color"], "transparent");
    });
    it('Visibility', () => {
        cssStyler(stylerObj, "visible", true);
        assert.equal(stylerObj["visibility"], "visible");
        cssStyler(stylerObj, "visible", false);
        assert.equal(stylerObj["visibility"], "hidden");
    });
    it('Background Color style conversion', () => {
        cssStyler(stylerObj, "background-color", "red");
        assert.equal(stylerObj["backgroundColor"], "red");
    });
    it('Styles updated properly', () => {
        cssStyler(stylerObj, "background-color", "black");
        assert.equal(stylerObj["backgroundColor"], "black");
        cssStyler(stylerObj, "text-color", "black");
        assert.equal(stylerObj["color"], "black");
    });
});

describe('Styling Properties', () => {
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
        buttonModel = currentCardModel.subparts.filter(subpart => {
            return subpart.type == 'button';
        })[0];
        assert.exists(buttonModel);
    });
    it('Initial button css properties are properly set', () => {
        let buttonView = window.System.findViewById(buttonModel.id);
        console.log(buttonView.style);
    });
    it.skip('Updating the styling properties, updates the cssStyle property', () => {
    });
});
