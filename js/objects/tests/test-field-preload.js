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
const expect = chai.expect;

import Field from '../parts/Field.js';

import ohm from 'ohm-js';
import interpreterSemantics from '../../ohm/interpreter-semantics.js';
let testLanguageGrammar = ohm.grammar(window.grammar);

function getSemanticsFor(aPart) {
    let semantics = testLanguageGrammar.createSemantics();
    semantics.addOperation(
        'interpret',
        interpreterSemantics(aPart, window.System)
    );
    return semantics;
}

//window.customElements.define('st-field', FieldView);

const FieldView = System.availableViews['field'];

let fieldModel;
describe('Field Part/Model Tests', () =>{
    it('Can initialize the part', () => {
        fieldModel = new Field();
        'AAAAA'.replace("A", "B");
        assert.exists(fieldModel);
        assert.equal(fieldModel.type, 'field');
    });
});

let fieldView;
describe('FieldView basic tests', () => {
    before('', () => {
        let text = "some text";
        fieldModel.partProperties.setPropertyNamed(
            fieldModel,
            'text',
            text
        );
        let html = "<div>some text</div>";
        fieldModel.partProperties.setPropertyNamed(
            fieldModel,
            'innerHTML',
            html
        );
    });
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
    it('Mounted shadow textarea has current model text value', () => {
        let textArea = fieldView._shadowRoot.querySelector('.field-textarea');
        let modelValue = fieldModel.partProperties.getPropertyNamed(
            fieldModel,
            'text'
        );
        assert.equal(textArea.textContent, modelValue);
    });
    it('innerHTML is updated after text is', () => {
        let textArea = fieldView._shadowRoot.querySelector('.field-textarea');
        let newText = `on message\n   something NEW\nend message`;
        fieldModel.partProperties.setPropertyNamed(
            fieldModel,
            'text',
            newText
        );
        let htmlValue = fieldModel.partProperties.getPropertyNamed(
            fieldModel,
            'innerHTML'
        );

        assert.equal(htmlValue, newText);
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
    it('Entering text into the shadow textarea changes the model innerHTML and text prop', () => {
        let textArea = fieldView._shadowRoot.querySelector('.field-textarea');
        let newHTMLContent = "<div>on message</div><div>   something new</div><div>end message<br></div>";
        let newTextContent = `on message\n   something new\nend message`;

        // Simulate typing the input events
        let event = new window.Event('input');
        textArea.innerHTML = newHTMLContent;
        // due to some JSDOM weirdness we have to set the innerText explicitely, unlike in a 'real
        // DOM element '...ugggh
        textArea.innerText = newTextContent;
        textArea.dispatchEvent(event);

        let foundHTMLContent = fieldModel.partProperties.getPropertyNamed(
            fieldModel,
            'innerHTML'
        );
        assert.equal(newHTMLContent, foundHTMLContent);

        let foundTextContent = fieldModel.partProperties.getPropertyNamed(
            fieldModel,
            'text'
        );
        assert.equal(newTextContent, foundTextContent);
    });
});


describe('doIt commands tests', () => {
    let currentCard;
    let semantics;
    let doItField;
    let cardView;
    let doItFieldView;
    before('Adding current card with a field', () => {
        currentCard = System.getCurrentCardModel();
        let initSemantics = function () {
            semantics = getSemanticsFor(currentCard);
        };
        expect(initSemantics).to.not.throw();
        let script = `add field "My Field" to current card`;
        let match = testLanguageGrammar.match(script, 'Command');
        assert.isTrue(match.succeeded());
        let msg = semantics(match).interpret();
        assert.exists(msg);
        currentCard.sendMessage(msg, currentCard);
        assert.equal(currentCard.subparts.length, 1);
        doItField = currentCard.subparts[0];
        cardView = document.querySelector('st-world st-stack.current-stack > st-card.current-card');
        assert.exists(cardView);
        doItFieldView = cardView.querySelector('st-field');
        assert.exists(doItFieldView);
        assert.exists(doItFieldView.model.id = doItField.id);
        // mock the document getSelection()
        document.getSelection = () => {
            return new class Selection {

                toString() {
                    return "myScript"
                }

                removeAllRanges() {
                }
            }
        }
    });
    it('Can add a script to field', () => {
        const script = `on myScript\nset "text" to "I ran"\nend myScript`
        let setScript = function () {
            doItField.partProperties.setPropertyNamed(doItField, "script", script)
        };
        expect(setScript).to.not.throw();
        assert.exists(doItField._commandHandlers["myScript"]);
        const text = doItField.partProperties.getPropertyNamed(doItField, "innerHTML");
        assert.equal("", text);
    });
    it('Can run the script and it works', () => {
        let sendMsg = function () {
            doItField.sendMessage(
                {
                    type: "command",
                    commandName: "myScript",
                    args: [],
                },
                doItField
            );
        };
        expect(sendMsg).to.not.throw();
        let text = doItField.partProperties.getPropertyNamed(doItField, "innerHTML");
        assert.equal("I ran", text);
        doItField.partProperties.setPropertyNamed(doItField, "innerHTML", "");
        text = doItField.partProperties.getPropertyNamed(doItField, "innerHTML");
        assert.equal("", text);
    });
    it('Can run do it', () => {
        const event = {};
        event.stopPropagation = () => {};
        let doIt = function () {
            doItFieldView.doIt(event);
        };
        expect(doIt).to.not.throw();
    });
    it('Do it did not change the original script', () => {
        assert.exists(doItField._commandHandlers["myScript"]);
    });
});

class MockRange {
    constructor(){
        this.node = null;
    }

    selectNode(node){
        this.node = node;
    }

    insertNode(newNode){
        this.node.appendChild(newNode);
    }

    deleteContents(){
        this.node.innerHTML = '';
    }


}

describe('FieldView Target Range tests', () => {
    let range = null;
    let line1HTML = "<div>line1</div>";
    let line2HTML = "<div>line2</div>";
    before('Set up a range for testing', () => {
        let html = line1HTML + line2HTML;
        fieldModel.partProperties.setPropertyNamed(
            fieldModel,
            'innerHTML',
            html
        );
        assert.exists(fieldView);
        // NOTE: b/c of JSDON weirdness we need to update the innerText manually
        fieldView.textarea.innerText = "line1\nline2";
        // create a range and set it to the first child of the textarea
        let firstChild = fieldView.textarea.children[0];
        range = new MockRange();
        range.selectNode(firstChild);
        assert.equal(firstChild.innerHTML, range.node.innerHTML);
        // set the range as a selectedRange in the field view
        fieldView.selectionRanges['rangeUID'] = range;

    });
    it('Inserting Range (basic) updates the textarea', () => {
        let newHTML = "<div><span style='color: red'>new line </span></div>";
        // NOTE: b/c of JSDON weirdness we need to update the innerText manually
        fieldView.textarea.innerText = "new line\nline2";
        fieldView.insertRange('rangeUID', newHTML);
        let expectedHTML = '<div><span><div><span style="color: red">new line </span></div></span></div>' + line2HTML;
        assert.equal(expectedHTML, fieldView.textarea.innerHTML);
    });
    it('Inserting Range (basic) updates the "text" and "innerHTML" part properties', () => {
        let expectedHTML = '<div><span><div><span style="color: red">new line </span></div></span></div>' + line2HTML;
        let innerHTML = fieldModel.partProperties.getPropertyNamed(fieldModel, 'innerHTML');
        assert.equal(expectedHTML, innerHTML);
        let expectedText = "new line\nline2";
        let text = fieldModel.partProperties.getPropertyNamed(fieldModel, 'text');
        assert.equal(expectedText, text);
    });
    it.skip('Inserting Range (with target)', () => {
        // reset everything first
        let html = line1HTML + line2HTML;
        // NOTE: b/c of JSDON weirdness we need to update the innerText manually
        fieldView.textarea.innerText = "line1\nline2";
        fieldModel.partProperties.setPropertyNamed(
            fieldModel,
            'innerHTML',
            html
        );
        assert.equal(html, fieldView.textarea.innerHTML);
        assert.equal("line1\nline2", fieldModel.partProperties.getPropertyNamed(fieldModel, 'text'));
        // create a range and set it to the first child of the textarea
        let firstChild = fieldView.textarea.children[0];
        range = new MockRange();
        range.selectNode(firstChild);
        // set the range as a selectedRange in the field view
        fieldView.selectionRanges['rangeUID'] = range;

        // Note: here the fieldView will be its own target
        // set the range ID
        fieldModel.partProperties.setPropertyNamed(
            fieldModel,
            'targetRangeId',
            "rangeUID"
        );

        let newHTML = "<div><span style='color: red'>new line </span></div>";
        let target = `field id ${fieldModel.id}`;
        console.log(target);
        fieldView.setRangeInTarget(target, newHTML);
    });
});
