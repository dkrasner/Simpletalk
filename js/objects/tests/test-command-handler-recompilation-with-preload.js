/**
 * Command Handler and Script Recompilation
 * ---------------------------------------------
 * Tests that ensure correct behavior during
 * compilation and especially recompilation of
 * an object's script / command handlers
 */
import chai from 'chai';
const assert = chai.assert;
const expect = chai.expect;

let currentCard;
let button;
describe('Can compile some basic custom command handlers', () => {
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
    describe('Can compile a basic script with two handlers', () => {
        it('Can compile the script without error', () => {
            let firstScript = [
                'on doSomethingFirst',
                'answer "first handler!"',
                'end doSomethingFirst',
                '\n',
                'on doSomethingElse someArg',
                'answer someArg',
                'end doSomethingElse'
            ].join('\n');
            let compileFunction = function(){
                let msg = {
                    type: 'compile',
                    targetId: button.id,
                    codeString: firstScript
                };
                currentCard.sendMessage(msg, currentCard);
            };
            expect(compileFunction).to.not.throw();
        });
        it('Button has two handlers with correct names', () => {
            expect(button._commandHandlers).to.have.all.keys('doSomethingFirst', 'doSomethingElse');
        });
        it('Can recompile the script with just one handler now', () => {
            let secondScript = [
                'on doSomethingFirst',
                'answer "first handler!"',
                'end doSomethingFirst'
            ].join('\n');
            let compileFunction = function(){
                let msg = {
                    type: 'compile',
                    targetId: button.id,
                    codeString: secondScript
                };
                currentCard.sendMessage(msg, currentCard);
            };
            expect(compileFunction).to.not.throw();
        });
        it('Should only have one handler present', () => {
            expect(button._commandHandlers).to.have.all.keys('doSomethingFirst');
            expect(button._commandHandlers).to.not.have.key('doSomethingElse');
        });
    });
});
