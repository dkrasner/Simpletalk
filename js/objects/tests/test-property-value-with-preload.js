/**
 * PropertyValue semantic rule tests
 */
import chai from 'chai';
const assert = chai.assert;
const expect = chai.expect;

let currentCardModel;
let buttonModel;

function compileButtonScript(aScript){
    let msg = {
        type: 'compile',
        codeString: aScript,
        targetId: buttonModel.id
    };
    window.System.compile(msg);
}

describe("PropertyValue Interpreter Tests", () => {
    describe('Model Setup', () => {
        it('Can find the current card model', () => {
            let currentCardView = document.querySelector('.current-stack > .current-card');
            currentCardModel = currentCardView.model;
            assert.exists(currentCardModel);
        });
        it('Can add a button to current card model without error', () => {
            let addButton = function(){
                let msg = {
                    type: 'command',
                    commandName: 'newModel',
                    args: [
                        'button',
                        currentCardModel.id,
                        'card'
                    ]
                };
                currentCardModel.sendMessage(msg, currentCardModel);
            };
            expect(addButton).to.not.throw(Error);
        });
        it('Can find newly created button model', () => {
            let button = currentCardModel.subparts.filter(subpart => {
                return subpart.type == 'button';
            })[0];
            buttonModel = button;
            assert.exists(buttonModel);
        });
    });
    describe("PropertyValue lookup tests", () => {
        before(() => {
            currentCardModel.partProperties.setPropertyNamed(
                currentCardModel,
                'name',
                'TEST_CARD'
            );
            buttonModel.partProperties.setPropertyNamed(
                buttonModel,
                'name',
                'TEST_BUTTON'
            );
        });

        it("Button can read implicit property value on itself", () => {
            let script = [
                'on click',
                'put the "name" into global result',
                'end click'
            ].join('\n');
            compileButtonScript(script);
            buttonModel.sendMessage({type:'command', commandName:'click', args:[]}, buttonModel);
            let result = window.System.executionStack.getGlobal('result');
            assert.equal(result, 'TEST_BUTTON');
        });
        it("Button can read prop value using 'this button'", () => {
            let script = [
                'on click',
                'put the "name" of this button into global result',
                'end click'
            ].join('\n');
            compileButtonScript(script);
            buttonModel.sendMessage({type:'command', commandName:'click', args:[]}, buttonModel);
            let result = window.System.executionStack.getGlobal('result');
            assert.equal(result, 'TEST_BUTTON');
        });
        it("Button should error when trying to read prop value using 'this field' (wrong part type)", () => {
            let script = [
                'on click',
                'put the "name" of this field into global result',
                'end click'
            ].join('\n');
            compileButtonScript(script);
            let sendFunction = function(){
                buttonModel.sendMessage({type:'command', commandName:'click', args:[]}, buttonModel);
            };
            expect(sendFunction).to.throw(Error);
        });
        it("Button should be able to get prop of parent card via specifier", () => {
            let script = [
                'on click',
                'put the "name" of first card of current stack into global result',
                'end click'
            ].join('\n');
            compileButtonScript(script);
            buttonModel.sendMessage({type:'command', commandName:'click', args:[]}, buttonModel);
            let result = window.System.executionStack.getGlobal('result');
            assert.equal(result, 'TEST_CARD');
        });
        it("Button should be able to get prop of itself via long specifier", () => {
            let script = [
                'on click',
                'put the "name" of first button of card 1 of current stack into global result',
                'end click'
            ].join('\n');
            compileButtonScript(script);
            buttonModel.sendMessage({type:'command', commandName:'click', args:[]}, buttonModel);
            let result = window.System.executionStack.getGlobal('result');
            assert.equal(result, 'TEST_BUTTON');
        });
        
    });
});
