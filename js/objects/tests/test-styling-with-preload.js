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
        it('Border Width', () => {
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
        it('Border Color', () => {
            cssStyler(stylerObj, "border-top-color", "rgb(255, 255, 255)");
            assert.equal(stylerObj["border-top-color"], "rgba(255, 255, 255, 1)");
        });
        it('Border Color Keyword', () => {
            cssStyler(stylerObj, "border-top-color", "red");
            assert.equal(stylerObj["border-top-color"], "rgba(255, 0, 0, 1)");
        });
        it('Border Transparency', () => {
            cssStyler(stylerObj, "border-top-transparency", "0.5");
            assert.equal(stylerObj["border-top-color"], "rgba(255, 0, 0, 0.5)");
        });
    });
    describe('Corners', () => {
        it('Round corner', () => {
            cssStyler(stylerObj, "corner-top-left-round", "10");
            assert.equal(stylerObj["border-top-left-radius"], "10px");
            assert.isUndefined(stylerObj["border-top-right-radius"]);
            assert.isUndefined(stylerObj["border-bottom-left-radius"]);
            assert.isUndefined(stylerObj["border-bottom-right-radius"]);
            cssStyler(stylerObj, "corner-top-right-round", "10");
            assert.equal(stylerObj["border-top-right-radius"], "10px");
            cssStyler(stylerObj, "corner-bottom-right-round", "10");
            assert.equal(stylerObj["border-bottom-right-radius"], "10px");
            cssStyler(stylerObj, "corner-bottom-left-round", "10");
            assert.equal(stylerObj["border-bottom-left-radius"], "10px");
        });
    });
    describe('Shadows', () => {
        it('Color', () => {
            cssStyler(stylerObj, "shadow-color", "rgb(255, 255, 255)");
            assert.equal(stylerObj["box-shadow"], "0px 0px 0px 0px rgba(255, 255, 255, 1)");
        });
        it('Transparency', () => {
            cssStyler(stylerObj, "shadow-transparency", 0.5);
            assert.equal(stylerObj["box-shadow"], "0px 0px 0px 0px rgba(255, 255, 255, 0.5)");
        });
        it('Left', () => {
            cssStyler(stylerObj, "shadow-left", 10);
            assert.equal(stylerObj["box-shadow"], "10px 0px 0px 0px rgba(255, 255, 255, 0.5)");
        });
        it('Top', () => {
            cssStyler(stylerObj, "shadow-top", 20);
            assert.equal(stylerObj["box-shadow"], "10px 20px 0px 0px rgba(255, 255, 255, 0.5)");
        });
        it('Blur', () => {
            cssStyler(stylerObj, "shadow-blur", 30);
            assert.equal(stylerObj["box-shadow"], "10px 20px 30px 0px rgba(255, 255, 255, 0.5)");
        });
        it('Spread', () => {
            cssStyler(stylerObj, "shadow-spread", 40);
            assert.equal(stylerObj["box-shadow"], "10px 20px 30px 40px rgba(255, 255, 255, 0.5)");
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
    describe('grid', () => {
        let currentCardView;
        let buttonView;
        let buttonModel;
        before(() => {
            currentCardView = document.querySelector('.current-stack > .current-card');
            buttonView = currentCardView.querySelector('st-button');
            assert.exists(buttonView);
            currentCardModel = currentCardView.model;
            buttonModel = buttonView.model;
            assert.exists(buttonModel);
        });
        it('By default parts have no grid position defined', () => {
            let styleProp = buttonModel.partProperties.getPropertyNamed(buttonModel, "cssStyle");
            assert.notExists(styleProp['grid-column']);
            assert.notExists(styleProp['grid-row']);
        });
        it('Setting the grid column', () => {
            buttonModel.partProperties.setPropertyNamed(buttonModel, "grid-column", 3);
            let styleProp = buttonModel.partProperties.getPropertyNamed(buttonModel, "cssStyle");
            assert.equal(styleProp['grid-column'], "3");
        });
        it('Setting the grid row', () => {
            buttonModel.partProperties.setPropertyNamed(buttonModel, "grid-row", 3);
            let styleProp = buttonModel.partProperties.getPropertyNamed(buttonModel, "cssStyle");
            assert.equal(styleProp['grid-row'], "3");
        });
        it('Can set any column / row value', () => {
            buttonModel.partProperties.setPropertyNamed(buttonModel, "grid-row", "1 / 3");
            buttonModel.partProperties.setPropertyNamed(buttonModel, "grid-column", "span 2");
            let styleProp = buttonModel.partProperties.getPropertyNamed(buttonModel, "cssStyle");
            assert.equal(styleProp['grid-row'], "1 / 3");
            assert.equal(styleProp['grid-column'], "span 2");
        });
    });
});
