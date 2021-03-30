/**
 * Editor Tests
 * -----------------------------------------
 * Integration test for various part editors
 */
import chai from 'chai';
const assert = chai.assert;
const expect = chai.expect;


describe('Editor tests', () => {
    let currentCard = System.getCurrentCardModel();
    describe('Editor Tests', () => {
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
        it('All parts are present', () => {
            assert.exists(currentCard);
            assert.exists(button);
        });
        it('editorOpen prop is false and no editor is present', () => {
            let editorOpenProp = button.partProperties.getPropertyNamed(button, "editorOpen");
            assert.isFalse(editorOpenProp);
            let editorView = document.querySelector('st-editor');
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
            let editorView = document.querySelector('st-editor');
            assert.isNotNull(editorView);
        });
        it('Editor title bar has the proper name', () => {
            let editorView = document.querySelector('st-editor');
            let title = editorView._shadowRoot.querySelector('.editor-title > span');
            assert.equal(title.textContent, `Editor [${buttonName}]`);
        });
        it.skip('Editor model and view have the proper target ids', () => {
            let editorView = document.querySelector('st-editor');
            let editorModel = editorView.model;
            let targetId = editorModel.partProperties.getPropertyNamed(editorModel, "targetId");
            assert.equal(targetId, button.id);
            assert.equal(targetId, editorView.getAttribute("target-id"));
        });
        it('Clicking the Editor script button opens field', () => {
            let editorView = document.querySelector('st-editor');
            let button = editorView._shadowRoot.querySelector('#script');
            let clickEvent = new window.MouseEvent('click');
            button.dispatchEvent(clickEvent);
            let fieldView = document.querySelector('st-field');
            assert.isNotNull(fieldView);
        });
        it('Script editor target is correct (has the correct script)', () => {
            // TODO return to this when we have better script editor target attribution
            let fieldView = document.querySelector('st-window st-field');
            let textArea = fieldView._shadowRoot.querySelector('.field-textarea');
            // you can't use textArea.innerText here so we need to replace the newlines
            // to check for equivalence
            assert.equal(textArea.textContent, buttonScript);

        });
        it('Button name is default displayed', () => {
            let editorView = document.querySelector('st-editor');
            let input = editorView._shadowRoot.querySelector('input.name');
            assert.equal(input.placeholder, buttonName);
        });
        it('Text input changes the button name as desired', () => {
            let newName = "a cooler button";
            let editorView = document.querySelector('st-editor');
            let input = editorView._shadowRoot.querySelector('input.name');
            input.value = newName;
            let inputEvent = new window.MouseEvent('input');
            input.dispatchEvent(inputEvent);
            assert.equal(newName, button.partProperties.getPropertyNamed(button, 'name'));
            let title = editorView._shadowRoot.querySelector('.editor-title > span');
            assert.equal(title.textContent, `Editor [${newName}]`);
        });
        it('Color wheel buttons are present', () => {
            // TODO technically we should test the interface here, but need to
            // implement mock canvas before
            let editorView = document.querySelector('st-editor');
            let buttonBG = editorView._shadowRoot.querySelector('#background-color');
            assert.isNotNull(buttonBG);
            let buttonFont = editorView._shadowRoot.querySelector('#text-color');
            assert.isNotNull(buttonFont);
        });
        it.skip('All default button events are present', () => {
            let editorView = document.querySelector('st-editor');
            let eventList = editorView._shadowRoot.querySelector('div.event-list');
            let defaultEvents = button.partProperties.getPropertyNamed(button, 'events');
            // here we are making an assumption that there is at least one button event
            assert.isAbove(defaultEvents.size, 0);
            defaultEvents.forEach((e) => {
                eventList.querySelector(`#${e}`);
                assert.isNotNull(e);
            });
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
            let editorViews = document.querySelectorAll('st-editor');
            assert.equal(editorViews.length, 1);
        });
        it('Clicking the close button closes the editor', () => {
            let editorView = document.querySelector('st-editor');
            let button = editorView._shadowRoot.querySelector('div.close-button');
            let clickEvent = new window.MouseEvent('click');
            button.dispatchEvent(clickEvent);
            editorView = document.querySelector('st-editor');
            assert.isNull(editorView);
        });
        it('Sending an closeEditor message closes the editor', () => {
            // First open the editor again
            let sendFunction = function(){
                let msg = {
                    type: 'command',
                    commandName: 'openEditor',
                    args: []
                };
                button.sendMessage(msg, button);
            };
            expect(sendFunction).to.not.throw();
            sendFunction = function(){
                let msg = {
                    type: 'command',
                    commandName: 'closeEditor',
                    args: []
                };
                button.sendMessage(msg, button);
            };

            expect(sendFunction).to.not.throw();
            let editorView = document.querySelector('st-editor');
            assert.isNull(editorView);
        });
        after("", () => {
            System.deleteModel(button.id);
        });
    });
    describe('Field Editor Tests', () => {
        let field = System.newModel("field", currentCard.id);
        let fieldName = 'a cool field';
        field.partProperties.setPropertyNamed(
            field,
            'name',
            fieldName
        );
        before('All parts are present', () => {
            assert.exists(currentCard);
            assert.exists(field);
        });
        it('editorOpen prop is false and no editor is present', () => {
            let editorOpenProp = field.partProperties.getPropertyNamed(field, "editorOpen");
            assert.isFalse(editorOpenProp);
            let editorView = document.querySelector('st-editor');
            assert.isNull(editorView);
        });
        it('Sending an openEditor message opens the editor', () => {
            let sendFunction = function(){
                let msg = {
                    type: 'command',
                    commandName: 'openEditor',
                    args: []
                };
                field.sendMessage(msg, field);
            };
            expect(sendFunction).to.not.throw();
            let editorView = document.querySelector('st-editor');
            assert.isNotNull(editorView);
        });
        it('Editor title bar has the proper name', () => {
            let editorView = document.querySelector('st-editor');
            let title = editorView._shadowRoot.querySelector('.editor-title > span');
            assert.equal(title.textContent, `Editor [${fieldName}]`);
        });
        it('Editor has the proper target id', () => {
            let editorView = document.querySelector('st-editor');
            assert.equal(field.id, editorView.getAttribute("target-id"));
        });
        it.skip('Clicking the Editor script field opens field', () => {
            // TODO the script st-window really needs a propert target set here
            // then update the test
            let editorView = document.querySelector('st-editor');
            let field = editorView._shadowRoot.querySelector('button.script');
            let clickEvent = new window.MouseEvent('click');
            field.dispatchEvent(clickEvent);
            let fieldView = document.querySelector('st-field');
            assert.isNotNull(fieldView);
        });
        after("", () => {
            System.deleteModel(field.id);
        });
    });

});
