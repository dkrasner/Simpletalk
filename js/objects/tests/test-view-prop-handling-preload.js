/**
 * PartView Property Change Handler Testing
 * --------------------------------------------------
 * Test the ability of PartView descendants to properly
 * use the convenience methods for registering property
 * listeners from their models.
 */
import chai from 'chai';
const assert = chai.assert;
import PartView from '../views/PartView.js';
import Part from '../parts/Part.js';

// Create a test view and part combo
class TestView extends PartView {
    constructor(){
        super();
    }
};

class TestPart extends Part {
    constructor(){
        super();
        this.partProperties.newBasicProp(
            'test-property',
            false
        );
    }
};

// Register these with the system
System.registerPart('test', TestPart);
System.registerView('test', TestView);
window.customElements.define('st-test', TestView);

describe('Test use of #onPropChange registration', () => {
    let testView;
    let testModel;
    it('Can create View/Model pair', () => {
        testView = document.createElement('st-test');
        testModel = new TestPart();
        testView.setModel(testModel);
        assert.exists(testView);
        assert.exists(testModel);
        assert.equal(testModel, testView.model);
    });
    it('Can register prop change handler on view (adds to internal dict)', () => {
        let handler = function(newVal, partId){
            // 'this' context will be the view instance
            // when this function is called in reaction to
            // a property change on the view's model
            this.__val = newVal;
            this.__partId = partId;
        };
        testView.onPropChange('test-property', handler);
        assert.equal(
            testView.propChangeHandlers['test-property'],
            handler
        );
    });
    it('View reacts to test property change using handler', () => {
        testModel.partProperties.setPropertyNamed(
            testModel,
            'test-property',
            true
        );
        assert.isTrue(testView.__val); // See previous test
        assert.equal(
            testView.__partId, // See previous test
            testModel.id
        );
    });
});
describe('Test #onPropChange command delegation', () => {
    var buttonModel;
    let buttonView;
    var buttonPropertyName;
    var buttonPropertyValue;
    var ownerPropertyName;
    var ownerPropertyValue;
    before('Can create View/Model pair', () => {
        let stackEl = document.querySelector('.current-stack');
        let cardEl = stackEl.querySelector('st-card');
        let msg = {
            type: "command",
            commandName: "newModel",
            args: ["button", cardEl.model.id]
        };
        System.receiveMessage(msg);
        buttonView = cardEl.querySelector('st-button');
        assert.exists(buttonView);
        buttonModel = buttonView.model;
        assert.exists(buttonModel);
        // add a command propertyChanged command handler to the button
        buttonModel._commandHandlers["propertyChanged"] = function(_, name, value){
            buttonPropertyName = name;
            buttonPropertyValue = value;
        };
        // add a command propertyChanged command handler to the button owner
        buttonModel._owner._commandHandlers["propertyChanged"] = function(_, name, value){
            ownerPropertyName = name;
            ownerPropertyValue = value;
        };
    });
    it('A #propertyChanged message triggers a property change command + handler', () => {
        assert.equal(buttonPropertyName, null);
        assert.equal(buttonPropertyValue, null);
        let msg = {
            type: "propertyChanged",
            propertyName: "background-color",
            value: "red",
            partId: buttonModel.id
        };
        buttonModel.sendMessage(msg, buttonView);
        assert.equal(buttonPropertyName, "background-color");
        assert.equal(buttonPropertyValue, "red");
    });
    it('A #propertyChanged command does not delegate up the chain', () => {
        // remove the propertyChange handler from button; in general this should
        // delegate to its owner which is what we test not to happen
        buttonModel._commandHandlers = [];
        let msg = {
            type: "propertyChanged",
            propertyName: "background-color",
            value: "red",
            partId: buttonModel.id
        };
        buttonModel.sendMessage(msg, buttonView);
        assert.equal(ownerPropertyName, null);
        assert.equal(ownerPropertyValue, null);
    });
});

describe('Test event partProperty handling', () => {
    let testView;
    let testModel;
    testView = document.createElement('st-test');
    testModel = new TestPart();
    testModel.partProperties.setPropertyNamed(
        testModel,
        "events",
        new Set(["click", "mouseover"])
    );
    testView.setModel(testModel);
    // event callback helpers
    let clickResult = 0;
    let clickHandler = function(){
        clickResult += 1;
    };
    testModel._commandHandlers["click"] = clickHandler;
    let mouseOverResult = 0;
    it('Initial "events" property is a Set with one element: "click"', () => {
        let events = testModel.partProperties.getPropertyNamed(testModel, "events");
        assert.isTrue(events.has("click"));
        assert.equal(2, events.size);
        assert.isTrue(events instanceof Set);
    });
    it('The "onclick" attribute is set on the view DOM element', () => {
        assert.isNotNull(testView["onclick"]);
        assert.equal("function", typeof testView["onclick"]);
    });
    it('The "mouseover" attribute is set on the view DOM element', () => {
        assert.isNotNull(testView["onmouseover"]);
        assert.equal("function", typeof testView["onmouseover"]);
    });
    it('Dispatching the "click" event', () => {
        let event = new window.MouseEvent('click');
        assert.doesNotThrow(() => testView.dispatchEvent(event));
        assert.equal(1, clickResult);
    });
    it('Dispatching the event', () => {
        let mouseoverHandler = function(){
            mouseOverResult += 1;
        };
        testModel._commandHandlers["mouseover"] = mouseoverHandler;
        let event = new window.MouseEvent('mouseover');
        assert.doesNotThrow(() => testView.dispatchEvent(event));
        assert.equal(1, mouseOverResult);
    });
});
