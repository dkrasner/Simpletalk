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
        assert.equal(stylerObj["color"], "initial");
        cssStyler(stylerObj, "name-visible", false);
        assert.equal(stylerObj["color"], "transparent");
    });
    it('Transparency', () => {
        cssStyler(stylerObj, "transparent", false);
        assert.equal(stylerObj["visibility"], "visible");
        cssStyler(stylerObj, "transparent", true);
        assert.equal(stylerObj["visibility"], "hidden");
    });
    it('Visibility', () => {
        cssStyler(stylerObj, "visible", true);
        assert.equal(stylerObj["display"], "initial");
        cssStyler(stylerObj, "visible", false);
        assert.equal(stylerObj["display"], "none");
    });
    it('Background Color style conversion', () => {
        cssStyler(stylerObj, "background-color", "red");
        assert.equal(stylerObj["backgroundColor"], "red");
    });
    it('Unit px properties (top, left) conversion', () => {
        cssStyler(stylerObj, "top", 2);
        assert.equal(stylerObj["top"], "2px");
        cssStyler(stylerObj, "top", "2");
        assert.equal(stylerObj["top"], "2px");
        cssStyler(stylerObj, "top", "2px");
        assert.equal(stylerObj["top"], "2px");
        cssStyler(stylerObj, "top", null);
        assert.equal(stylerObj["top"], "2px");
    });
    it('Unit rotate(deg) property conversion', () => {
        cssStyler(stylerObj, "rotate", null);
        assert.equal(stylerObj["transform"], undefined);
        cssStyler(stylerObj, "rotate", 20);
        assert.equal(stylerObj["transform"], "rotate(20deg)");
        cssStyler(stylerObj, "rotate", -20);
        assert.equal(stylerObj["transform"], "rotate(-20deg)");
    });
    it('Null or undefined value styles do not update the style object', () => {
        cssStyler(stylerObj, "background-color", null);
        assert.equal(stylerObj["backgroundColor"], "red");
        cssStyler(stylerObj, "background-color", undefined);
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
    it('Initial button "cssStyle" BasicProperty is properly set', () => {
        // Note we just test for some of the core style props as the
        // complete list is likely to change in the future
        let styleProp = buttonModel.partProperties.getPropertyNamed(buttonModel, "cssStyle");
        assert.equal(styleProp['visibility'], 'visible');
        assert.equal(styleProp['textAlign'], 'center');
    });
    it('Initial button DOM element style attribute is properly set', () => {
        // Note we just test for some of the core style props as the
        // complete list is likely to change in the future
        let buttonView = window.System.findViewById(buttonModel.id);
        assert.equal(buttonView.style['visibility'], 'visible');
        assert.equal(buttonView.style['textAlign'], 'center');
    });
    it('Updating StyleProperty directly updates the "cssStyle" BasicProperty', () => {
        buttonModel.partProperties.setPropertyNamed(buttonModel, "transparent", true);
        let styleProp = buttonModel.partProperties.getPropertyNamed(buttonModel, "cssStyle");
        assert.equal(styleProp['visibility'], 'hidden');
    });
    it('Updating StyleProperty directly updates the DOM element style attribute', () => {
        let buttonView = window.System.findViewById(buttonModel.id);
        assert.equal(buttonView.style['visibility'], 'hidden');
    });
    it('Updating StyleProperty via "set" message updates the "cssStyle" BasicProperty', () => {
        let msg  = {
            type: "command",
            commandName: "setProperty",
            args: ["visible", true]
        };
        buttonModel.sendMessage(msg, buttonModel);
        let styleProp = buttonModel.partProperties.getPropertyNamed(buttonModel, "cssStyle");
        assert.equal(styleProp['display'], 'initial');
    });
    it('Updating StyleProperty via "set" updates the DOM element style attribute', () => {
        let buttonView = window.System.findViewById(buttonModel.id);
        assert.equal(buttonView.style['display'], 'initial');
    });
});
