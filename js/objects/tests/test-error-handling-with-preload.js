/**
 * Tests for Error Handling 
 * -------------------------------------------
 */
import chai from 'chai';
const assert = chai.assert;
const expect = chai.expect;

let currentCard;
let button;
let anotherButton;
describe('Error Handling', () => {
    describe('Setup', () => {
        it('Can add a new button to the current card', () => {
            let makeButtonFunction = function(){
                currentCard = System.getCurrentCardModel();
                let msg = {
                    type: 'command',
                    commandName: 'newModel',
                    args: ['button', currentCard.id]
                };
                currentCard.sendMessage(msg, currentCard);
            };
            expect(makeButtonFunction).to.not.throw();
        });
        it('Can find the button object, which has NO command handlers yet', () => {
            button = System.getCurrentCardModel().subparts.find(subpart => {
                return subpart.type == 'button';
            });
            assert.exists(button);
            assert.isEmpty(button._commandHandlers);
        });
    });
    describe('GrammarMatchError', () => {
        it('GrammarMatchError automatically opens the script editor (if not present)', () => {
            let firstScript = [
                'on doSomethingFirst',
                'not a command',
                'end doSomethingFirst',
            ].join('\n');
            button.partProperties.setPropertyNamed(button, "script", firstScript);
            let scriptEditor = window.System.findScriptEditorByTargetId(button.id);
            assert.isNotNull(scriptEditor);
        });
        it('Script editor has the propertly error marked content', () => {
           let markedUpScript = [
                'on doSomethingFirst',
                'not a command --<<<[Expected:"end"; ruleName: "StatementList"]',
                'end doSomethingFirst',
            ].join('\n');
            let scriptEditor = window.System.findScriptEditorByTargetId(button.id);
            let text = scriptEditor.model.partProperties.getPropertyNamed(scriptEditor, "text");
            assert.equal(text, markedUpScript);
        });
    });
    describe('MessageNotUnderstood', () => {
        before(() => {
            // add a grammatically correct script that reference an unkown command
            let firstScript = [
                'on click',
                'someNotACommandCommand',
                'end click',
            ].join('\n');
            // we add a whole new button b/c at the moment our scripting field is not
            // responsive
            anotherButton = window.System.newModel("button", currentCard.id);
            anotherButton.partProperties.setPropertyNamed(anotherButton, "script", firstScript);
        });

        it('Sending a MessageNotUnderstood', () => {
            let sendErrorMsgFunction = function(){
                let MNUmsg = {
                    type: "error",
                    name: "MessageNotUnderstood",
                    message: {
                        type: "command",
                        commandName: "someNotACommandCommand",
                        args: [],
                        senders: [{name: "Button", id: anotherButton.id}]
                    }
                };
                anotherButton.sendMessage(MNUmsg, anotherButton);
            };
            expect(sendErrorMsgFunction).to.not.throw();
        });

        it('MessageNotUnderstood command is marked up in the editor', () => {
            let markedUpScript = [
                'on click',
                'someNotACommandCommand --<<<[MessageNotUnderstood: command; commandName: "someNotACommandCommand"]',
                'end click',
            ].join('\n');
            let scriptEditor = window.System.findScriptEditorByTargetId(anotherButton.id);
            let text = scriptEditor.model.partProperties.getPropertyNamed(scriptEditor, "text");
            assert.equal(text, markedUpScript);
        });
    });
});
