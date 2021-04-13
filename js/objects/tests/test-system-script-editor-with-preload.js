/**
 * System Script Editor Window Tests
 * -------------------------------------
 * These are integration tests that ensure we
 * are creating, properly opening, and have
 * correct functionality in the demo Script
 * Editor window.
 * To open a script editor, we send the
 * 'openScriptEditor' command to System with
 * the ID of the target Part (whose script we
 * will edit) as the sole arg.
 */
import chai from 'chai';
const assert = chai.assert;
const expect = chai.expect;

// We will use the following as the default script
// on the Card that we test. That way, we can see if
// the ScriptEditor opens with existing correct script
// text
let originalScript = `on click\n\tanswer "hello"\nend click`;


describe('Opening a Script Editor', () => {
    let currentCardView = document.querySelector('.current-stack .current-card');
    let currentCardModel = currentCardView.model;
    it('Can set the script of the current card without issue', () => {
        currentCardModel.partProperties.setPropertyNamed(
            currentCardModel,
            'script',
            originalScript
        );

        let foundScript = currentCardModel.partProperties.getPropertyNamed(
            currentCardModel,
            'script'
        );

        assert.equal(originalScript, foundScript);
    });
    it('Can open a script editor with current card as target', () => {
        let message = {
            type: 'command',
            commandName: 'openScriptEditor',
            args: [currentCardModel.id]
        };

        let sendMessageFunc = function(){
            currentCardModel.sendMessage(message, System);
        };

        expect(sendMessageFunc).to.not.throw(Error);
    });
    it('Corresponding script editor is open', () => {
        let editorArea = currentCardView.querySelector('st-area');
        assert.exists(editorArea);
    });
});

describe('ScriptEditor Functionality', () => {
    let editorAreaView;
    let editorSaveButtonView;
    let editorTitleFieldView;
    let editorScriptFieldView;
    before(() => {
        editorAreaView = document.querySelector('st-area');
        editorSaveButtonView = editorAreaView.querySelector('st-button');
        [editorTitleFieldView, editorScriptFieldView] = editorAreaView.querySelectorAll('st-field');
    });
    it('Has all appropriate views', () => {
        assert.exists(editorAreaView);
        assert.exists(editorSaveButtonView);
        assert.exists(editorScriptFieldView);
    });
    it('Editor has the current script html for the Card in its field', () => {
        let textArea = editorScriptFieldView._shadowRoot.querySelector('.field-textarea');
        assert.exists(textArea);
        let displayedScriptHTML = textArea.innerHTML;

        let cardModel = document.querySelector('.current-stack > .current-card').model;
        let cardScript = cardModel.partProperties.getPropertyNamed(
            cardModel,
            'script'
        );

        assert.equal(editorScriptFieldView.htmlToText(textArea), cardScript);
    });
    it('Editor has the current script text for the Card in its field', () => {
        let fieldModel = editorScriptFieldView.model;
        let textArea = editorScriptFieldView._shadowRoot.querySelector('.field-textarea');
        assert.exists(textArea);
        let text = fieldModel.partProperties.getPropertyNamed(
            fieldModel,
            'text'
        );

        let cardModel = document.querySelector('.current-stack > .current-card').model;
        let cardScript = cardModel.partProperties.getPropertyNamed(
            cardModel,
            'script'
        );
    });
    it('Can set a new script for the Card by changing field value and triggering button', () => {
        let newScript = `on foo\n\tanswer "foo"\n end foo`;
        let cardModel = document.querySelector('.current-stack > .current-card').model;
        let fieldModel = editorScriptFieldView.model;
        let saveButtonModel = editorSaveButtonView.model;

        let textArea = editorScriptFieldView._shadowRoot.querySelector('.field-textarea');
        fieldModel.partProperties.setPropertyNamed(
            fieldModel,
            'innerHTML',
            newScript
        );
        // due to JSDOM weirdness where element.innerText is not auto set if element.innerHTML is
        // we need to set the 'text' property again without notification
        fieldModel.partProperties.setPropertyNamed(
            fieldModel,
            'text',
            newScript,
            false
        );
        // Send click on the button,
        // which should itself send a message
        // to set the script of the card
        saveButtonModel.sendMessage({
            type: 'command',
            commandName: 'click',
            args: []
        }, saveButtonModel);

        let cardScript = cardModel.partProperties.getPropertyNamed(
            cardModel,
            'script'
        );

        assert.equal(cardScript, newScript);
    });
    describe.skip('Simpletalk Completer', () => {
        before(() => {
            // make sure that the simpleTalkCompleter is set
            editorFieldView.editorCompleter = editorFieldView.simpleTalkCompleter;
        });
        it('Will complete "on messageName{SPACE}" with template', () => {
            let fieldModel = editorFieldView.model;
            let textArea = editorFieldView._shadowRoot.querySelector('.field-textarea');
            let newHTMLContent = "on message ";
            let completedHTMLContent = "on message <div><div>\t</div><div>end message</div><br></div>";

            // Simulate typing the input events
            let event = new window.Event('input');
            textArea.innerHTML = newHTMLContent;
            textArea.dispatchEvent(event);

            let foundHTMLContent = fieldModel.partProperties.getPropertyNamed(
                fieldModel,
                'innerHTML'
            );
            assert.equal(foundHTMLContent, completedHTMLContent);
        });
        it('Will complete "on messageName{NEWLINE}" with template', () => {
            let fieldModel = editorFieldView.model;
            let textArea = editorFieldView._shadowRoot.querySelector('.field-textarea');
            let newHTMLContent = "on message\n";
            let completedHTMLContent = "on message\nend message";

            // Simulate typing the input events
            let event = new window.Event('input');
            textArea.innerHTML = newHTMLContent;
            textArea.dispatchEvent(event);

            let foundHTMLContent = fieldModel.partProperties.getPropertyNamed(
                fieldModel,
                'innerHTML'
            );
            assert.equal(foundHTMLContent, completedHTMLContent);
        });
    });
});
