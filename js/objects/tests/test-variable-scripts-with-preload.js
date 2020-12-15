/**
 * Testing Variables with Scripts
 * ---------------------------------------
 * This module tests compilation of various scripts
 * that deal with variable passing and evaluation.
 */
import chai from 'chai';
const assert = chai.assert;
const expect = chai.expect;

let currentCardModel;
let buttonModel;
describe('Model Setup', () => {
    it('Can find current card model', () => {
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
    it('Can find the newly created button model', () => {
        let button = currentCardModel.subparts.filter(subpart => {
            return subpart.type == 'button';
        })[0];
        buttonModel = button;
        assert.exists(buttonModel);
    });
});
describe('Basic Set Local Variable', () => {
    let script = [
        'on click',
        `\tput "hello" into myVariable`,
        'end click'
    ].join('\n');

    it('Can compile the basic put/into command without issue', () => {
        let sendFunction = function(){
            let msg = {
                type: 'compile',
                codeString: script,
                targetId: buttonModel.id
            };
            window.System.compile(msg);
        };
        expect(sendFunction).to.not.throw(Error);
    });

    it('Can find the execution context with correct variables', () => {
        let buttonView = document.querySelector(`[part-id="${buttonModel.id}"]`);
        assert.exists(buttonView);
        buttonView.click();
        assert.exists(buttonModel._executionContext);
        let variableValue = buttonModel._executionContext.getLocal('myVariable');
        assert.equal(variableValue, "hello");
    });
});

describe('Can set property based on local variable', () => {
    let script = [
        'on click',
        `\tput "new name" into myVariable`,
        `\tset "name" to myVariable`,
        'end click'
    ].join("\n");

    before(() => {
        // Clear the variable context on the existing
        // buttonModel, just to be safe.
        buttonModel._executionContext = null;
    });
    
    it('Can compile variable setting and property setting without error', () => {
        let sendFunction = function(){
            let msg = {
                type: 'compile',
                codeString: script,
                targetId: buttonModel.id
            };
            window.System.compile(msg);
        };
        expect(sendFunction).to.not.throw(Error);
    });
    it('Button does not yet have the new name prop (not clicked)', () => {
        let buttonView = document.querySelector(`[part-id="${buttonModel.id}"]`);
        assert.exists(buttonView);
        let currentName = buttonModel.partProperties.getPropertyNamed(
            buttonModel,
            'name'
        );
        assert.notEqual(currentName, 'new name');
    });
    it('Clicking updates to the new name prop', () => {
        let buttonView = document.querySelector(`[part-id="${buttonModel.id}"]`);
        buttonView.click();
        let foundName = buttonModel.partProperties.getPropertyNamed(
            buttonModel,
            'name'
        );
        assert.equal(foundName, 'new name');
    });
});
