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
    it('Can set the htmlContent property', () => {
        let htmlToSet = "<div>on message</div><div>   some command</div><div>end message<br></div>";
        fieldModel.partProperties.setPropertyNamed(
            fieldModel,
            'htmlContent',
            htmlToSet
        );

        let accessedValue = fieldModel.partProperties.getPropertyNamed(
            fieldModel,
            'htmlContent'
        );

        assert.equal(accessedValue, htmlToSet);
    });
});

let fieldView;
describe('FieldView tests', () => {
    it('Can create a view element', () => {
        fieldView = document.createElement('st-field');
        assert.exists(fieldView);
    });
    it('Can set the view model', () => {
        let accessedValue = fieldModel.partProperties.getPropertyNamed(
            fieldModel,
            'htmlContent'
        );
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
            'htmlContent'
        );

        assert.equal(textArea.innerHTML, modelValue);
    });
    it('textContent property is updated after the model is set', () => {
        let textContent = `on message\n   some command\nend message`;
        let accessedValue = fieldModel.partProperties.getPropertyNamed(
            fieldModel,
            'textContent'
        );

        assert.equal(accessedValue, textContent);
    });
    it('textToHtml and htmlToText are idempotent 1 (empty)', () => {
        let fieldView = document.querySelector('st-field');
        let textContainer = document.createElement("div");
        let newContentHtml = "";
        textContainer.innerHTML = newContentHtml;

        let newContentText = newContentHtml;

        assert.equal(newContentText, fieldView.htmlToText(textContainer));
        // assert.equal(newContentHtml, fieldView.textToHtml(newContentText));
    });
    it('textToHtml and htmlToText are idempotent 2 (single line)', () => {
        let fieldView = document.querySelector('st-field');
        let textContainer = document.createElement("div");
        let newContentHtml = "I am a basic line";
        textContainer.innerHTML = newContentHtml;

        let newContentText = newContentHtml;

        assert.equal(newContentText, fieldView.htmlToText(textContainer));
        // assert.equal(newContentHtml, fieldView.textToHtml(newContentText));
    });
    it('textToHtml and htmlToText are idempotent 3 (with FF <br> tag)', () => {
        let fieldView = document.querySelector('st-field');
        let textContainer = document.createElement("div");
        let newContentHtml = "<div>on message</div><div>   some command</div><div>end message<br></div>";
        textContainer.innerHTML = newContentHtml;

        let newContentText = `on message\n   some command\nend message`;

        assert.equal(newContentText, fieldView.htmlToText(textContainer));
        // assert.equal(newContentHtml, fieldView.textToHtml(newContentText));
    });
    it('Entering text into the shadow textarea changes the model htmlContent and textContent prop', () => {
        let textArea = fieldView._shadowRoot.querySelector('.field-textarea');
        let newHTMLContent = "<div>on message</div><div>   something new</div><div>end message<br></div>";
        let newTextContent = `on message\n   something new\nend message`;

        // Simulate typing the input events
        let event = new window.Event('input');
        textArea.innerHTML = newHTMLContent;
        textArea.dispatchEvent(event);

        let foundHTMLContent = fieldModel.partProperties.getPropertyNamed(
            fieldModel,
            'htmlContent'
        );
        assert.equal(newHTMLContent, foundHTMLContent);

        let foundTextContent = fieldModel.partProperties.getPropertyNamed(
            fieldModel,
            'textContent'
        );
        assert.equal(newTextContent, foundTextContent);
    });
});
