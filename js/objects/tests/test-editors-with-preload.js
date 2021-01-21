/**
 * Editor Tests
 * -----------------------------------------
 * Integration test for various part editors
 */
import chai from 'chai';
const assert = chai.assert;
const expect = chai.expect;

describe('Button Editor tests', () => {
    let currentCard = System.getCurrentCardModel();
    let button = System.newModel("button", currentCard.id);
    let buttonScript = 'on click\n    answer "ok"\nend click';
    let buttonName = 'a cool button';
    button.partProperties.setPropertyNamed(
        button,
        'script',
        buttonScript
    );
    button.partProperties.setPropertyNamed(
        button,
        'name',
        buttonName
    );
    describe('System initialialization', () => {
        it('All parts are present', () => {
            assert.exists(currentCard);
            assert.exists(button);
        });
        it('editorOpen prop is false and no editor is present', () => {
            let editorOpenProp = button.partProperties.getPropertyNamed(button, "editorOpen");
            assert.isFalse(editorOpenProp);
            let editorView = document.querySelector('st-button-editor');
            assert.isNull(editorView);
        });
        it('Sending an openEditor message opens the editor', () => {
            let sendFunction = function(){
                let msg = {
                    type: 'command',
                    commandName: 'openEditor',
                    args: []
                };
                button.sendMessage(msg, button);
            };
            expect(sendFunction).to.not.throw();
            let editorView = document.querySelector('st-button-editor');
            assert.isNotNull(editorView);
        });
        it('Editor title bar has the proper name', () => {
            let editorView = document.querySelector('st-button-editor');
            let title = editorView._shadowRoot.querySelector('.editor-title > span');
            assert.equal(title.textContent, buttonName);
        });
        it.skip('Editor model and view have the proper target ids', () => {
            let editorView = document.querySelector('st-button-editor');
            let editorModel = editorView.model;
            let targetId = editorModel.partProperties.getPropertyNamed(editorModel, "targetId");
            assert.equal(targetId, button.id);
            assert.equal(targetId, editorView.getAttribute("target-id"));
        });
        it('Clicking the Editor script button opens field', () => {
            let editorView = document.querySelector('st-button-editor');
            let button = editorView._shadowRoot.querySelector('button.script');
            let clickEvent = new window.MouseEvent('click');
            button.dispatchEvent(clickEvent);
            let fieldView = document.querySelector('st-field');
            assert.isNotNull(fieldView);
        });
        it('Script editor target is correct (has the correct script)', () => {
            // TODO return to this when we have better script editor target attribution
            let fieldView = document.querySelector('st-field');
            let textArea = fieldView._shadowRoot.querySelector('.field-textarea');
            // you can't use textArea.innerText here so we need to replace the newlines
            // to check for equivalence
            assert.equal(textArea.textContent, buttonScript.replace(/\n/g, ''));

        });
        it('Button name is default displayed', () => {
            let editorView = document.querySelector('st-button-editor');
            let input = editorView._shadowRoot.querySelector('input.name');
            assert.equal(input.defaultValue, buttonName);
        });
        it('Sending a second openEditor message does nothing', () => {
            let sendFunction = function(){
                let msg = {
                    type: 'command',
                    commandName: 'openEditor',
                    args: []
                };
                button.sendMessage(msg, button);
            };
            expect(sendFunction).to.not.throw();
            let editorViews = document.querySelectorAll('st-button-editor');
            assert.equal(editorViews.length, 1);
        });
        it('Sending an closeEditor message closes the editor', () => {
            let sendFunction = function(){
                let msg = {
                    type: 'command',
                    commandName: 'closeEditor',
                    args: []
                };
                button.sendMessage(msg, button);
            };
            expect(sendFunction).to.not.throw();
            // TODO 
            let editorView = document.querySelector('st-button-editor');
            assert.isNull(editorView);
        });

    });
});
