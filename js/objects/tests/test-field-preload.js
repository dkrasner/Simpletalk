/**
 * Tests for the Field Part and View
 * -------------------------------------------
 * These are simple tests to make sure the Field
 * Part and corresponding View work correctly and together
 * as expected.
 * NOTE: These classes are designed to be replaced with
 * a more comprehensive Field part/view combo
 */
import chai from 'chai';
const assert = chai.assert;

import Field from '../parts/Field.js';
//import FieldView from '../views/FieldView.js';
const FieldView = System.availableViews['field'];

//window.customElements.define('st-field', FieldView);

let ericFieldModel;
describe('Field Part/Model Tests', () =>{
    it('Can initialize the part', () => {
        ericFieldModel = new Field();
        assert.exists(ericFieldModel);
        assert.equal(ericFieldModel.type, 'field');
    });
    it('Can set the textContent property', () => {
        let textToSet = `Hello there!`;
        ericFieldModel.partProperties.setPropertyNamed(
            ericFieldModel,
            'textContent',
            textToSet
        );

        let accessedValue = ericFieldModel.partProperties.getPropertyNamed(
            ericFieldModel,
            'textContent'
        );

        assert.equal(accessedValue, textToSet);
    });
});

let ericFieldView;
describe('FieldView tests', () => {
    it('Can create a view element', () => {
        ericFieldView = document.createElement('st-field');
        assert.exists(ericFieldView);
    });
    it('Can set the view model', () => {
        ericFieldView.setModel(ericFieldModel);
        assert.equal(ericFieldView.model, ericFieldModel);
    });
    it('Has valid shadowDOM textarea', () => {
        let textArea = ericFieldView._shadowRoot.querySelector('textarea');
        assert.exists(textArea);
    });
    it('Can connect to the DOM without issue', () => {
        document.body.append(ericFieldView);
        let found = document.querySelector('st-field');
        assert.equal(ericFieldView, found);
    });
    it('Mounted shadow textarea has current model value', () => {
        let textArea = ericFieldView._shadowRoot.querySelector('textarea');
        let modelValue = ericFieldModel.partProperties.getPropertyNamed(
            ericFieldModel,
            'textContent'
        );

        assert.equal(textArea.value, modelValue);
    });
    it('Entering text into the shadow textarea changes the model textcontent prop', () => {
        let textArea = ericFieldView._shadowRoot.querySelector('textarea');
        let expectedContent = `this is the new text!`;

        // Simulate typing the input events
        let event = new window.Event('input');
        textArea.value = expectedContent;
        textArea.dispatchEvent(event);

        let foundContent = ericFieldModel.partProperties.getPropertyNamed(
            ericFieldModel,
            'textContent'
        );

        assert.equal(expectedContent, foundContent);
    });
});
