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
    describe('Text', () => {
        it('Text font conversion', () => {
            cssStyler(stylerObj, "text-font", "Times");
            assert.equal(stylerObj["fontFamily"], "Times");
        });
        it('Text color conversion', () => {
            cssStyler(stylerObj, "text-color", "rgb(255, 0, 0)");
            assert.equal(stylerObj["color"], "rgba(255, 0, 0, 1)");
            cssStyler(stylerObj, "text-color", "red");
            assert.equal(stylerObj["color"], "rgba(255, 0, 0, 1)");
        });
        it('Text transparency', () => {
            cssStyler(stylerObj, "text-transparency", .5);
            assert.equal(stylerObj["color"], "rgba(255, 0, 0, 0.5)");
            cssStyler(stylerObj, "text-transparency", ".5");
            assert.equal(stylerObj["color"], "rgba(255, 0, 0, .5)");
        });
    });
    describe('Background', () => {
        it('Background color conversion', () => {
            cssStyler(stylerObj, "background-color", "rgb(0, 0, 0)");
            assert.equal(stylerObj["backgroundColor"], "rgba(0, 0, 0, 1)");
            cssStyler(stylerObj, "background-color", "red");
            assert.equal(stylerObj["backgroundColor"], "rgba(255, 0, 0, 1)");
        });
        it('Background transparency', () => {
            cssStyler(stylerObj, "background-transparency", .5);
            assert.equal(stylerObj["backgroundColor"], "rgba(255, 0, 0, 0.5)");
            cssStyler(stylerObj, "background-transparency", ".5");
            assert.equal(stylerObj["backgroundColor"], "rgba(255, 0, 0, .5)");
        });
    });
    describe('Borders', () => {
        it('Border Style (single side)', () => {
            cssStyler(stylerObj, "border-top-style", "solid");
            assert.equal(stylerObj["border-top-style"], "solid");
            assert.isUndefined(stylerObj["border-bottom-style"]);
            assert.isUndefined(stylerObj["border-left-style"]);
            assert.isUndefined(stylerObj["border-right-style"]);
            cssStyler(stylerObj, "border-right-style", "dashed");
            assert.equal(stylerObj["border-right-style"], "dashed");
            cssStyler(stylerObj, "border-left-style", "inset");
            assert.equal(stylerObj["border-left-style"], "inset");
            cssStyler(stylerObj, "border-bottom-style", "outset");
            assert.equal(stylerObj["border-bottom-style"], "outset");
        });
        it('Border Style (all sides)', () => {
            cssStyler(stylerObj, "border-style", "solid");
            assert.equal(stylerObj["border-top-style"], "solid");
            assert.equal(stylerObj["border-bottom-style"], "solid");
            assert.equal(stylerObj["border-right-style"], "solid");
            assert.equal(stylerObj["border-left-style"], "solid");
        });
        it('Border Style Unsetting (all sides)', () => {
            cssStyler(stylerObj, "border-style", "none");
            assert.equal(stylerObj["border-top-style"], "none");
            assert.equal(stylerObj["border-bottom-style"], "none");
            assert.equal(stylerObj["border-right-style"], "none");
            assert.equal(stylerObj["border-left-style"], "none");
        });
        it('Border Width (single side)', () => {
            cssStyler(stylerObj, "border-top-width", 100);
            assert.equal(stylerObj["border-top-width"], "100px");
            assert.isUndefined(stylerObj["border-bottom-width"]);
            assert.isUndefined(stylerObj["border-left-width"]);
            assert.isUndefined(stylerObj["border-right-width"]);
            cssStyler(stylerObj, "border-right-width", "20");
            assert.equal(stylerObj["border-right-width"], "20px");
            cssStyler(stylerObj, "border-left-width", 10);
            assert.equal(stylerObj["border-left-width"], "10px");
            cssStyler(stylerObj, "border-bottom-width", "1");
            assert.equal(stylerObj["border-bottom-width"], "1px");
        });
        it('Border Color (all sides)', () => {
            cssStyler(stylerObj, "border-color", "rgb(255, 255, 255)");
            assert.equal(stylerObj["border-top-color"], "rgba(255, 255, 255, 1)");
            assert.equal(stylerObj["border-bottom-color"], "rgba(255, 255, 255, 1)");
            assert.equal(stylerObj["border-right-color"], "rgba(255, 255, 255, 1)");
            assert.equal(stylerObj["border-left-color"], "rgba(255, 255, 255, 1)");
        });
        it('Border Color Keyword (all sides)', () => {
            cssStyler(stylerObj, "border-color", "red");
            assert.equal(stylerObj["border-top-color"], "rgba(255, 0, 0, 1)");
            assert.equal(stylerObj["border-bottom-color"], "rgba(255, 0, 0, 1)");
            assert.equal(stylerObj["border-right-color"], "rgba(255, 0, 0, 1)");
            assert.equal(stylerObj["border-left-color"], "rgba(255, 0, 0, 1)");
        });
        it('Border Transparency (single side)', () => {
            cssStyler(stylerObj, "border-top-transparency", "0.5");
            assert.equal(stylerObj["border-top-color"], "rgba(255, 0, 0, 0.5)");
            assert.equal(stylerObj["border-bottom-color"], "rgba(255, 0, 0, 1)");
            assert.equal(stylerObj["border-right-color"], "rgba(255, 0, 0, 1)");
            assert.equal(stylerObj["border-left-color"], "rgba(255, 0, 0, 1)");
        });
        it('Border Transparency (all sides)', () => {
            cssStyler(stylerObj, "border-transparency", "0.7");
            assert.equal(stylerObj["border-top-color"], "rgba(255, 0, 0, 0.7)");
            assert.equal(stylerObj["border-bottom-color"], "rgba(255, 0, 0, 0.7)");
            assert.equal(stylerObj["border-right-color"], "rgba(255, 0, 0, 0.7)");
            assert.equal(stylerObj["border-left-color"], "rgba(255, 0, 0, 0.7)");
        });
    });
    it('Transparency', () => {
        cssStyler(stylerObj, "transparency", 0.5);
        assert.equal(stylerObj["opacity"], 0.5);
        cssStyler(stylerObj, "transparency", "0.5");
        assert.equal(stylerObj["opacity"], "0.5");
    });
    it('Hide', () => {
        cssStyler(stylerObj, "hide", false);
        assert.equal(stylerObj["display"], null);
        cssStyler(stylerObj, "hide", true);
        assert.equal(stylerObj["display"], "none");
    });
    it('Background Color style conversion', () => {
        cssStyler(stylerObj, "background-color", "red");
        assert.equal(stylerObj["backgroundColor"], "rgba(255, 0, 0, 1)");
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
        assert.equal(stylerObj["backgroundColor"], "rgba(255, 0, 0, 1)");
        cssStyler(stylerObj, "background-color", undefined);
        assert.equal(stylerObj["backgroundColor"], "rgba(255, 0, 0, 1)");
    });
    it('Styles updated properly', () => {
        cssStyler(stylerObj, "background-color", "black");
        assert.equal(stylerObj["backgroundColor"], "rgba(0, 0, 0, 1)");
        cssStyler(stylerObj, "text-color", "black");
        assert.equal(stylerObj["color"], "rgba(0, 0, 0, 1)");
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
    describe('cssStyle', () => {
        it('Initial button "cssStyle" BasicProperty is properly set', () => {
            // Note we just test for some of the core style props as the
            // complete list is likely to change in the future
            let styleProp = buttonModel.partProperties.getPropertyNamed(buttonModel, "cssStyle");
            assert.equal(styleProp['top'], "0px");
            assert.equal(styleProp['left'], "0px");
        });
        it('Initial button DOM element style attribute is properly set', () => {
            // Note we just test for some of the core style props as the
            // complete list is likely to change in the future
            let buttonView = window.System.findViewById(buttonModel.id);
            assert.equal(buttonView.style['top'], "0px");
            assert.equal(buttonView.style['left'], "0px");
        });
        it('Updating StyleProperty directly updates the style property value', () => {
            let styleProp = buttonModel.partProperties.getPropertyNamed(buttonModel, "hide");
            assert.equal(styleProp, false);
            buttonModel.partProperties.setPropertyNamed(buttonModel, "hide", true);
            styleProp = buttonModel.partProperties.getPropertyNamed(buttonModel, "hide");
            assert.equal(styleProp, true);
        });
        it('Updating StyleProperty directly updates the "cssStyle" BasicProperty', () => {
            let styleProp = buttonModel.partProperties.getPropertyNamed(buttonModel, "cssStyle");
            assert.equal(styleProp['display'], 'none');
        });
        it('Updating StyleProperty directly updates the DOM element style attribute', () => {
            let buttonView = window.System.findViewById(buttonModel.id);
            assert.equal(buttonView.style['display'], 'none');
        });
        it('Updating StyleProperty via "set" message updates the "cssStyle" BasicProperty', () => {
            let msg  = {
                type: "command",
                commandName: "setProperty",
                args: ["hide", false]
            };
            buttonModel.sendMessage(msg, buttonModel);
            let styleProp = buttonModel.partProperties.getPropertyNamed(buttonModel, "cssStyle");
            assert.equal(styleProp['display'], null);
        });
        it('Updating StyleProperty via "set" updates the DOM element style attribute', () => {
            let buttonView = window.System.findViewById(buttonModel.id);
            assert.equal(buttonView.style['display'], '');
        });
    });
    describe('cssTextStyle', () => {
        it('Initial button "cssTextStyle" BasicProperty is properly set', () => {
            // Note we just test for some of the core style props as the
            // complete list is likely to change in the future
            let styleProp = buttonModel.partProperties.getPropertyNamed(buttonModel, "cssTextStyle");
            assert.equal(styleProp['textAlign'], 'left');
        });
        it('Initial button DOM element style attribute is properly set', () => {
            // Note we just test for some of the core style props as the
            // complete list is likely to change in the future
            let buttonView = window.System.findViewById(buttonModel.id);
            assert.equal(buttonView.style['textAlign'], 'left');
        });
        it('Updating a text style related StyleProperty', () => {
            // Note we just test for some of the core style props as the
            // complete list is likely to change in the future
            buttonModel.partProperties.setPropertyNamed(buttonModel, "text-align", "center");
            let styleProp = buttonModel.partProperties.getPropertyNamed(buttonModel, "cssTextStyle");
            assert.equal(styleProp['textAlign'], 'center');
        });
        it('Updating "cssTextStyle" property has DOM element style attribute is properly set', () => {
            // Note we just test for some of the core style props as the
            // complete list is likely to change in the future
            let buttonView = window.System.findViewById(buttonModel.id);
            assert.equal(buttonView.style['textAlign'], 'center');
        });
    });
});
