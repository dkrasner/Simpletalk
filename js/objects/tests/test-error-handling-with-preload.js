/**
 * Tests for Error Handling 
 * -------------------------------------------
 */
import chai from 'chai';
const assert = chai.assert;
const expect = chai.expect;

let currentCard;
let button;
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
            let textContent = scriptEditor.model.partProperties.getPropertyNamed(scriptEditor, "textContent");
            assert.equal(markedUpScript, textContent);
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
            button.partProperties.setPropertyNamed(button, "script", firstScript);
        });

        it('Sending a MessageNotUnderstood', () => {
            let MNUmsg = {
                type: "error",
                name: "MessageNotUnderstood",
                message: {
                    type: "command",
                    commandName: "someNotACommandCommand",
                    args: [],
                    senders: [{name: "Button", id: button.id}]
                }
            };
            button.sendMessage(MNUmsg, button);
        });
    });
});
