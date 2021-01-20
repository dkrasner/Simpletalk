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
        it.skip('Editor model and view have the proper target ids', () => {
            let editorView = document.querySelector('st-button-editor');
            let editorModel = editorView.model;
            let targetId = editorModel.partProperties.getPropertyNamed(editorModel, "targetId");
            assert.equal(targetId, button.id);
            assert.equal(targetId, editorView.getAttribute("target-id"));
        });
        it.skip('Clicking the Editor script button opens text field', () => {
            let editorView = document.querySelector('st-button-editor');
            let button = editorView.querySelector('.edit-script-button');
            let clickEvent = new window.MouseEvent('click');
            let clickEventFunc = function(){
                button.dispatchEvent(clickEvent);
            };
            let fieldView = editorView.querySelector('st-field');
            expect(clickEventFunc).to.not.throw(Error);
            assert.isNotNull(fieldView);
        });
        it.skip('Script editor target is correct', () => {
            //TODO this really can't be done at the moment due to how
            // script editor is constructed but should be in the future
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
