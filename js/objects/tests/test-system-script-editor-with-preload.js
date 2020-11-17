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
    it('There is exactly one window (toolbox) in the world', () => {
        let foundWindows = document.querySelectorAll('st-window');
        assert.equal(1, foundWindows.length);
    });
    it('Can remove the current window from the world for further testing (TODO! make programmatic) ', () => {
        let foundWindows = document.querySelectorAll('st-window');
        foundWindows.forEach((node) => {node.remove()});
        foundWindows = document.querySelectorAll('st-window');
        assert.equal(0, foundWindows.length);
    });
    it('Can set the script of the current card without issue', () => {
        let currentCard = document.querySelector('.current-stack .current-card').model;
        currentCard.partProperties.setPropertyNamed(
            currentCard,
            'script',
            originalScript
        );

        let foundScript = currentCard.partProperties.getPropertyNamed(
            currentCard,
            'script'
        );

        assert.equal(originalScript, foundScript);
    });
    it('Can open a script editor with current card as target', () => {
        let currentCard = document.querySelector('.current-stack .current-card').model;
        let message = {
            type: 'command',
            commandName: 'openScriptEditor',
            args: [currentCard.id]
        };

        let sendMessageFunc = function(){
            currentCard.sendMessage(message, System);
        };

        expect(sendMessageFunc).to.not.throw(Error);
    });
    it('Current StackView now has WindowView as a child element', () => {
        let currStackView = document.querySelector('.current-stack');
        assert.exists(currStackView);
        let windowView = document.querySelector('st-window');
        assert.exists(windowView);

        let foundWindow = document.querySelector('st-window');
        assert.equal(foundWindow, windowView);
    });
    it('Current Stack Part now has a Window as a subpart', () => {
        let currentStack = document.querySelector('st-stack.current-stack').model;
        assert.exists(currentStack);
        let windowModel = document.querySelector('st-window').model;
        assert.exists(windowModel);

        assert.include(currentStack.subparts, windowModel);
    });
    it('Window model is targeting the current card', () => {
        let winModel = document.querySelector('st-window').model;
        let cardModel = document.querySelector('.current-stack .current-card').model;
        let foundTarget = winModel.target;

        assert.equal(foundTarget, cardModel);
    });
});

describe('ScriptEditor Functionality', () => {
    let editorCurrentCardView;
    let editorSaveButtonView;
    let editorFieldView;
    before(() => {
        editorCurrentCardView = document.querySelector('st-window > st-stack > .current-card');
        editorSaveButtonView = editorCurrentCardView.querySelector('st-button');
        editorFieldView = editorCurrentCardView.querySelector('st-field');
    });

    it('Has all appropriate views', () => {
        assert.exists(editorCurrentCardView);
        assert.exists(editorSaveButtonView);
        assert.exists(editorFieldView);
    });

    it('Editor has the current script for the Card in its field', () => {
        let textArea = editorFieldView._shadowRoot.querySelector('textarea');
        assert.exists(textArea);
        let displayedScript = textArea.value;

        let cardModel = document.querySelector('.current-stack > .current-card').model;
        let cardScript = cardModel.partProperties.getPropertyNamed(
            cardModel,
            'script'
        );

        assert.equal(displayedScript, cardScript);
    });

    it('Can set a new script for the Card by changing field value and triggering button', () => {
        let newScript = `on foo\n\tanswer "foo"\n end foo`;
        let cardModel = document.querySelector('.current-stack > .current-card').model;
        let fieldModel = editorFieldView.model;
        let saveButtonModel = editorSaveButtonView.model;

        fieldModel.partProperties.setPropertyNamed(
            fieldModel,
            'textContent',
            newScript
        );

        console.log(
            saveButtonModel._commandHandlers['click']
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
});
