/**
 * Testing If-Then Statements
 * ----------------------------------
 * This module tests live if then statements
 * in real Part scripts.
 * It also implicitly tests the semantics
 * of the Conditionals defined within the
 * Simpletalk grammar/interpreter semantics
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
describe('Inline if-then tests', () => {
    beforeEach(() => {
        buttonModel.partProperties.setPropertyNamed(
            buttonModel,
            'name',
            'blank'
        );
    });
    it('Can deal with a true literal', () => {
        let script = [
            'on click',
            '\tif true then set "name" to "evaluated"',
            'end click'
        ].join('\n');
        compileButtonScript(script);
        let clickMessage = {
            type: 'command',
            commandName: 'click',
            args: []
        };
        buttonModel.sendMessage(clickMessage, buttonModel);
        let foundName = buttonModel.partProperties.getPropertyNamed(buttonModel, 'name');
        assert.equal(foundName, 'evaluated');
    });
    it('Can deal with a false literal', () => {
        let script = [
            'on click',
            '\tif false then set "name" to "evaluated2"',
            'end click'
        ].join('\n');
        compileButtonScript(script);
        let clickMessage = {
            type: 'command',
            commandName: 'click',
            args: []
        };
        buttonModel.sendMessage(clickMessage, buttonModel);
        let foundName = buttonModel.partProperties.getPropertyNamed(buttonModel, 'name');
        assert.notEqual(foundName, 'evaluated2');
    });
    it('Can deal with an equality comparison (true)', () => {
        let script = [
            'on click',
            '\tif (2+2) = 4 then set "name" to "evaluated3"',
            'end click'
        ].join('\n');
        compileButtonScript(script);
        let clickMessage = {
            type: 'command',
            commandName: 'click',
            args: []
        };
        buttonModel.sendMessage(clickMessage, buttonModel);
        let foundName = buttonModel.partProperties.getPropertyNamed(buttonModel, 'name');
        assert.equal(foundName, 'evaluated3');
    });
    it('Can deal with an equality comparison (false)', () => {
        let script = [
            'on click',
            '\tif (2+3) = 4 then set "name" to "evaluated4"',
            'end click'
        ].join('\n');
        compileButtonScript(script);
        let clickMessage = {
            type: 'command',
            commandName: 'click',
            args: []
        };
        buttonModel.sendMessage(clickMessage, buttonModel);
        let foundName = buttonModel.partProperties.getPropertyNamed(buttonModel, 'name');
        assert.notEqual(foundName, 'evaluated4');
    });
    it('Can deal with a gt comparison (true)', () => {
        let script = [
            'on click',
            '\tif 3 > 2 then set "name" to "evaluated"',
            'end click'
        ].join('\n');
        compileButtonScript(script);
        let clickMessage = {
            type: 'command',
            commandName: 'click',
            args: []
        };
        buttonModel.sendMessage(clickMessage, buttonModel);
        let foundName = buttonModel.partProperties.getPropertyNamed(buttonModel, 'name');
        assert.equal(foundName, 'evaluated');
    });
    it('Can deal with a gt comparison (false)', () => {
        let script = [
            'on click',
            '\tif 3 > 4 then set "name" to "evaluated"',
            'end click'
        ].join('\n');
        compileButtonScript(script);
        let clickMessage = {
            type: 'command',
            commandName: 'click',
            args: []
        };
        buttonModel.sendMessage(clickMessage, buttonModel);
        let foundName = buttonModel.partProperties.getPropertyNamed(buttonModel, 'name');
        assert.notEqual(foundName, 'evaluated');
    });
    it('Can deal with a gte comparison (true)', () => {
        let script = [
            'on click',
            '\tif 3 >= 3 then set "name" to "evaluated"',
            'end click'
        ].join('\n');
        compileButtonScript(script);
        let clickMessage = {
            type: 'command',
            commandName: 'click',
            args: []
        };
        buttonModel.sendMessage(clickMessage, buttonModel);
        let foundName = buttonModel.partProperties.getPropertyNamed(buttonModel, 'name');
        assert.equal(foundName, 'evaluated');
    });
    it('Can deal with a gte comparison (false)', () => {
        let script = [
            'on click',
            '\tif 3 >= 5.6 then set "name" to "evaluated"',
            'end click'
        ].join('\n');
        compileButtonScript(script);
        let clickMessage = {
            type: 'command',
            commandName: 'click',
            args: []
        };
        buttonModel.sendMessage(clickMessage, buttonModel);
        let foundName = buttonModel.partProperties.getPropertyNamed(buttonModel, 'name');
        assert.notEqual(foundName, 'evaluated');
    });
    it('Can deal with a lt comparison (true)', () => {
        let script = [
            'on click',
            '\tif -3 < 2 then set "name" to "evaluated"',
            'end click'
        ].join('\n');
        compileButtonScript(script);
        let clickMessage = {
            type: 'command',
            commandName: 'click',
            args: []
        };
        buttonModel.sendMessage(clickMessage, buttonModel);
        let foundName = buttonModel.partProperties.getPropertyNamed(buttonModel, 'name');
        assert.equal(foundName, 'evaluated');
    });
    it('Can deal with a lt comparison (false)', () => {
        let script = [
            'on click',
            '\tif 3 < 2 then set "name" to "evaluated"',
            'end click'
        ].join('\n');
        compileButtonScript(script);
        let clickMessage = {
            type: 'command',
            commandName: 'click',
            args: []
        };
        buttonModel.sendMessage(clickMessage, buttonModel);
        let foundName = buttonModel.partProperties.getPropertyNamed(buttonModel, 'name');
        assert.notEqual(foundName, 'evaluated');
    });
    it('Can deal with a lte comparison (true)', () => {
        let script = [
            'on click',
            'put 3 into myVariable',
            '\tif 3 <= myVariable then set "name" to "evaluated"',
            'end click'
        ].join('\n');
        compileButtonScript(script);
        let clickMessage = {
            type: 'command',
            commandName: 'click',
            args: []
        };
        buttonModel.sendMessage(clickMessage, buttonModel);
        let foundName = buttonModel.partProperties.getPropertyNamed(buttonModel, 'name');
        assert.equal(foundName, 'evaluated');
    });
    it('Can deal with a lte comparison (false)', () => {
        let script = [
            'on click',
            'put -0.15 into myVariable',
            '\tif 3 <= myVariable then set "name" to "evaluated"',
            'end click'
        ].join('\n');
        compileButtonScript(script);
        let clickMessage = {
            type: 'command',
            commandName: 'click',
            args: []
        };
        buttonModel.sendMessage(clickMessage, buttonModel);
        let foundName = buttonModel.partProperties.getPropertyNamed(buttonModel, 'name');
        assert.notEqual(foundName, 'evaluated');
    });
});
describe('Singleline If-Then tests', () => {
   beforeEach(() => {
        buttonModel.partProperties.setPropertyNamed(
            buttonModel,
            'name',
            'blank'
        );
    });
    it('Can deal with a true literal', () => {
        let script = [
            'on click',
            '\tif true',
            'then set "name" to "evaluated"',
            'end click'
        ].join('\n');
        compileButtonScript(script);
        let clickMessage = {
            type: 'command',
            commandName: 'click',
            args: []
        };
        buttonModel.sendMessage(clickMessage, buttonModel);
        let foundName = buttonModel.partProperties.getPropertyNamed(buttonModel, 'name');
        assert.equal(foundName, 'evaluated');
    });
    it('Can deal with a false literal', () => {
        let script = [
            'on click',
            '\tif false',
            'then set "name" to "evaluated2"',
            'end click'
        ].join('\n');
        compileButtonScript(script);
        let clickMessage = {
            type: 'command',
            commandName: 'click',
            args: []
        };
        buttonModel.sendMessage(clickMessage, buttonModel);
        let foundName = buttonModel.partProperties.getPropertyNamed(buttonModel, 'name');
        assert.notEqual(foundName, 'evaluated2');
    });
    it('Can deal with an equality comparison (true)', () => {
        let script = [
            'on click',
            '\tif (2+2) = 4',
            'then set "name" to "evaluated3"',
            'end click'
        ].join('\n');
        compileButtonScript(script);
        let clickMessage = {
            type: 'command',
            commandName: 'click',
            args: []
        };
        buttonModel.sendMessage(clickMessage, buttonModel);
        let foundName = buttonModel.partProperties.getPropertyNamed(buttonModel, 'name');
        assert.equal(foundName, 'evaluated3');
    });
    it('Can deal with an equality comparison (false)', () => {
        let script = [
            'on click',
            '\tif (2+3) = 4',
            'then set "name" to "evaluated4"',
            'end click'
        ].join('\n');
        compileButtonScript(script);
        let clickMessage = {
            type: 'command',
            commandName: 'click',
            args: []
        };
        buttonModel.sendMessage(clickMessage, buttonModel);
        let foundName = buttonModel.partProperties.getPropertyNamed(buttonModel, 'name');
        assert.notEqual(foundName, 'evaluated4');
    });
    it('Can deal with a gt comparison (true)', () => {
        let script = [
            'on click',
            '\tif 3 > 2',
            'then set "name" to "evaluated"',
            'end click'
        ].join('\n');
        compileButtonScript(script);
        let clickMessage = {
            type: 'command',
            commandName: 'click',
            args: []
        };
        buttonModel.sendMessage(clickMessage, buttonModel);
        let foundName = buttonModel.partProperties.getPropertyNamed(buttonModel, 'name');
        assert.equal(foundName, 'evaluated');
    });
    it('Can deal with a gt comparison (false)', () => {
        let script = [
            'on click',
            '\tif 3 > 4',
            'then set "name" to "evaluated"',
            'end click'
        ].join('\n');
        compileButtonScript(script);
        let clickMessage = {
            type: 'command',
            commandName: 'click',
            args: []
        };
        buttonModel.sendMessage(clickMessage, buttonModel);
        let foundName = buttonModel.partProperties.getPropertyNamed(buttonModel, 'name');
        assert.notEqual(foundName, 'evaluated');
    });
    it('Can deal with a gte comparison (true)', () => {
        let script = [
            'on click',
            '\tif 3 >= 3',
            'then set "name" to "evaluated"',
            'end click'
        ].join('\n');
        compileButtonScript(script);
        let clickMessage = {
            type: 'command',
            commandName: 'click',
            args: []
        };
        buttonModel.sendMessage(clickMessage, buttonModel);
        let foundName = buttonModel.partProperties.getPropertyNamed(buttonModel, 'name');
        assert.equal(foundName, 'evaluated');
    });
    it('Can deal with a gte comparison (false)', () => {
        let script = [
            'on click',
            '\tif 3 >= 5.6',
            'then set "name" to "evaluated"',
            'end click'
        ].join('\n');
        compileButtonScript(script);
        let clickMessage = {
            type: 'command',
            commandName: 'click',
            args: []
        };
        buttonModel.sendMessage(clickMessage, buttonModel);
        let foundName = buttonModel.partProperties.getPropertyNamed(buttonModel, 'name');
        assert.notEqual(foundName, 'evaluated');
    });
    it('Can deal with a lt comparison (true)', () => {
        let script = [
            'on click',
            '\tif -3 < 2',
            'then set "name" to "evaluated"',
            'end click'
        ].join('\n');
        compileButtonScript(script);
        let clickMessage = {
            type: 'command',
            commandName: 'click',
            args: []
        };
        buttonModel.sendMessage(clickMessage, buttonModel);
        let foundName = buttonModel.partProperties.getPropertyNamed(buttonModel, 'name');
        assert.equal(foundName, 'evaluated');
    });
    it('Can deal with a lt comparison (false)', () => {
        let script = [
            'on click',
            '\tif 3 < 2',
            'then set "name" to "evaluated"',
            'end click'
        ].join('\n');
        compileButtonScript(script);
        let clickMessage = {
            type: 'command',
            commandName: 'click',
            args: []
        };
        buttonModel.sendMessage(clickMessage, buttonModel);
        let foundName = buttonModel.partProperties.getPropertyNamed(buttonModel, 'name');
        assert.notEqual(foundName, 'evaluated');
    });
    it('Can deal with a lte comparison (true)', () => {
        let script = [
            'on click',
            'put 3 into myVariable',
            '\tif 3 <= myVariable',
            'then set "name" to "evaluated"',
            'end click'
        ].join('\n');
        compileButtonScript(script);
        let clickMessage = {
            type: 'command',
            commandName: 'click',
            args: []
        };
        buttonModel.sendMessage(clickMessage, buttonModel);
        let foundName = buttonModel.partProperties.getPropertyNamed(buttonModel, 'name');
        assert.equal(foundName, 'evaluated');
    });
    it('Can deal with a lte comparison (false)', () => {
        let script = [
            'on click',
            'put -0.15 into myVariable',
            '\tif 3 <= myVariable',
            'then set "name" to "evaluated"',
            'end click'
        ].join('\n');
        compileButtonScript(script);
        let clickMessage = {
            type: 'command',
            commandName: 'click',
            args: []
        };
        buttonModel.sendMessage(clickMessage, buttonModel);
        let foundName = buttonModel.partProperties.getPropertyNamed(buttonModel, 'name');
        assert.notEqual(foundName, 'evaluated');
    }); 
});
describe('Singleline if-then-else tests', () => {
    beforeEach(() => {
        buttonModel.partProperties.setPropertyNamed(
            buttonModel,
            'name',
            'blank'
        );
    });
    it('Can deal with a true literal', () => {
        let script = [
            'on click',
            '\tif true',
            '\tthen set "name" to "evaluatedTrue"',
            '\telse set "name" to "evaluatedFalse"',
            'end click'
        ].join('\n');
        compileButtonScript(script);
        let clickMessage = {
            type: 'command',
            commandName: 'click',
            args: []
        };
        buttonModel.sendMessage(clickMessage, buttonModel);
        let foundName = buttonModel.partProperties.getPropertyNamed(buttonModel, 'name');
        assert.equal(foundName, 'evaluatedTrue');
    });
    it('Can deal with a false literal', () => {
        let script = [
            'on click',
            '\tif false',
            '\tthen set "name" to "evaluatedTrue"',
            '\telse set "name" to "evaluatedFalse"',
            'end click'
        ].join('\n');
        compileButtonScript(script);
        let clickMessage = {
            type: 'command',
            commandName: 'click',
            args: []
        };
        buttonModel.sendMessage(clickMessage, buttonModel);
        let foundName = buttonModel.partProperties.getPropertyNamed(buttonModel, 'name');
        assert.equal(foundName, 'evaluatedFalse');
    });
    it('Can deal with an equality comparison (true)', () => {
        let script = [
            'on click',
            '\tif (2 + -4) is -2',
            '\tthen set "name" to "evaluatedTrue"',
            '\telse set "name" to "evaluatedFalse"',
            'end click'
        ].join('\n');
        compileButtonScript(script);
        let clickMessage = {
            type: 'command',
            commandName: 'click',
            args: []
        };
        buttonModel.sendMessage(clickMessage, buttonModel);
        let foundName = buttonModel.partProperties.getPropertyNamed(buttonModel, 'name');
        assert.equal(foundName, 'evaluatedTrue');
    });
    it('Can deal wtih an equality comparison (false)', () => {
        let script = [
            'on click',
            '\tif 2 is 3',
            '\tthen set "name" to "evaluatedTrue"',
            '\telse set "name" to "evaluatedFalse"',
            'end click'
        ].join('\n');
        compileButtonScript(script);
        let clickMessage = {
            type: 'command',
            commandName: 'click',
            args: []
        };
        buttonModel.sendMessage(clickMessage, buttonModel);
        let foundName = buttonModel.partProperties.getPropertyNamed(buttonModel, 'name');
        assert.equal(foundName, 'evaluatedFalse');
    });
    it('Can deal with a gt comparison (true)', () => {
        let script = [
            'on click',
            '\tif (2 + 3) > 1',
            '\tthen set "name" to "evaluatedTrue"',
            '\telse set "name" to "evaluatedFalse"',
            'end click'
        ].join('\n');
        compileButtonScript(script);
        let clickMessage = {
            type: 'command',
            commandName: 'click',
            args: []
        };
        buttonModel.sendMessage(clickMessage, buttonModel);
        let foundName = buttonModel.partProperties.getPropertyNamed(buttonModel, 'name');
        assert.equal(foundName, 'evaluatedTrue');
    });
    it('Can deal with a gt comparison (false)', () => {
        let script = [
            'on click',
            '\tif (2 + 3) > 6',
            '\tthen set "name" to "evaluatedTrue"',
            '\telse set "name" to "evaluatedFalse"',
            'end click'
        ].join('\n');
        compileButtonScript(script);
        let clickMessage = {
            type: 'command',
            commandName: 'click',
            args: []
        };
        buttonModel.sendMessage(clickMessage, buttonModel);
        let foundName = buttonModel.partProperties.getPropertyNamed(buttonModel, 'name');
        assert.equal(foundName, 'evaluatedFalse');
    });
    it('Can deal with a gte comparison (true)', () => {
        let script = [
            'on click',
            '\tif 2 >= (1 + 1)',
            '\tthen set "name" to "evaluatedTrue"',
            '\telse set "name" to "evaluatedFalse"',
            'end click'
        ].join('\n');
        compileButtonScript(script);
        let clickMessage = {
            type: 'command',
            commandName: 'click',
            args: []
        };
        buttonModel.sendMessage(clickMessage, buttonModel);
        let foundName = buttonModel.partProperties.getPropertyNamed(buttonModel, 'name');
        assert.equal(foundName, 'evaluatedTrue');
    });
    it('Can deal with a gte comparison (false)', () => {
        let script = [
            'on click',
            '\tif 2 >= 44.06',
            '\tthen set "name" to "evaluatedTrue"',
            '\telse set "name" to "evaluatedFalse"',
            'end click'
        ].join('\n');
        compileButtonScript(script);
        let clickMessage = {
            type: 'command',
            commandName: 'click',
            args: []
        };
        buttonModel.sendMessage(clickMessage, buttonModel);
        let foundName = buttonModel.partProperties.getPropertyNamed(buttonModel, 'name');
        assert.equal(foundName, 'evaluatedFalse');
    });
    it('Can deal with a lt comparison (true)', () => {
        let script = [
            'on click',
            '\tif (-1 + 1) < 1',
            '\tthen set "name" to "evaluatedTrue"',
            '\telse set "name" to "evaluatedFalse"',
            'end click'
        ].join('\n');
        compileButtonScript(script);
        let clickMessage = {
            type: 'command',
            commandName: 'click',
            args: []
        };
        buttonModel.sendMessage(clickMessage, buttonModel);
        let foundName = buttonModel.partProperties.getPropertyNamed(buttonModel, 'name');
        assert.equal(foundName, 'evaluatedTrue');
    });
    it('Can deal with a lt comparison (false)', () => {
        let script = [
            'on click',
            '\tif (-1 + 1) < 0',
            '\tthen set "name" to "evaluatedTrue"',
            '\telse set "name" to "evaluatedFalse"',
            'end click'
        ].join('\n');
        compileButtonScript(script);
        let clickMessage = {
            type: 'command',
            commandName: 'click',
            args: []
        };
        buttonModel.sendMessage(clickMessage, buttonModel);
        let foundName = buttonModel.partProperties.getPropertyNamed(buttonModel, 'name');
        assert.equal(foundName, 'evaluatedFalse');
    });
    it('Can deal with a lte comparison (true)', () => {
        let script = [
            'on click',
            '\tif (1 + -1) <= 0',
            '\tthen set "name" to "evaluatedTrue"',
            '\telse set "name" to "evaluatedFalse"',
            'end click'
        ].join('\n');
        compileButtonScript(script);
        let clickMessage = {
            type: 'command',
            commandName: 'click',
            args: []
        };
        buttonModel.sendMessage(clickMessage, buttonModel);
        let foundName = buttonModel.partProperties.getPropertyNamed(buttonModel, 'name');
        assert.equal(foundName, 'evaluatedTrue');
    });
    it('Can deal with a lte comparison (false)', () => {
        let script = [
            'on click',
            '\tif (1 + -1) <= -1',
            '\tthen set "name" to "evaluatedTrue"',
            '\telse set "name" to "evaluatedFalse"',
            'end click'
        ].join('\n');
        compileButtonScript(script);
        let clickMessage = {
            type: 'command',
            commandName: 'click',
            args: []
        };
        buttonModel.sendMessage(clickMessage, buttonModel);
        let foundName = buttonModel.partProperties.getPropertyNamed(buttonModel, 'name');
        assert.equal(foundName, 'evaluatedFalse');
    });
});
