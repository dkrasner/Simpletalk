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

let fieldModel;
describe('Field Part/Model Tests', () =>{
    it('Can initialize the part', () => {
        fieldModel = new Field();
        'AAAAA'.replace("A", "B");
        assert.exists(fieldModel);
        assert.equal(fieldModel.type, 'field');
    });
    it('Can set the textContent property', () => {
        let textToSet = `Hello there!`;
        fieldModel.partProperties.setPropertyNamed(
            fieldModel,
            'textContent',
            textToSet
        );

        let accessedValue = fieldModel.partProperties.getPropertyNamed(
            fieldModel,
            'textContent'
        );

        assert.equal(accessedValue, textToSet);
    });
});

let fieldView;
describe('FieldView tests', () => {
    it('Can create a view element', () => {
        fieldView = document.createElement('st-field');
        assert.exists(fieldView);
    });
    it('Can set the view model', () => {
        fieldView.setModel(fieldModel);
        assert.equal(fieldView.model, fieldModel);
    });
    it('Has valid shadowDOM textarea', () => {
        let textArea = fieldView._shadowRoot.querySelector('.field-textarea');
        assert.exists(textArea);
    });
    it('Can connect to the DOM without issue', () => {
        document.body.append(fieldView);
        let found = document.querySelector('st-field');
        assert.equal(fieldView, found);
    });
    it('Mounted shadow textarea has current model value', () => {
        let textArea = fieldView._shadowRoot.querySelector('.field-textarea');
        let modelValue = fieldModel.partProperties.getPropertyNamed(
            fieldModel,
            'textContent'
        );

        assert.equal(textArea.textContent, modelValue);
    });
    it('textToHtml and htmlToText are idempotent 1', () => {
        let fieldView = document.querySelector('st-field');
        let textContainer = document.createElement("div");
        let newContentHtml = "on message<br>   some command<br>end message";
        textContainer.innerHTML = newContentHtml;

        let newContentText = `on message\n   some command\nend message`;

        assert.equal(newContentText, fieldView.htmlToText(textContainer));
        assert.equal(newContentHtml, fieldView.textToHtml(newContentText));
    });
    it('Entering text into the shadow textarea changes the model textcontent prop', () => {
        let textArea = fieldView._shadowRoot.querySelector('.field-textarea');
        let newContentHtml = "on message<br>   some command<br>end message";

        let expectedContent = `on message\n   some command\nend message`;

        // Simulate typing the input events
        let event = new window.Event('input');
        textArea.innerHTML = newContentHtml;
        textArea.dispatchEvent(event);

        let foundContent = fieldModel.partProperties.getPropertyNamed(
            fieldModel,
            'textContent'
        );

        assert.equal(expectedContent, foundContent);
    });


});
