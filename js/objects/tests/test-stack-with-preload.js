import chai from 'chai';
const assert = chai.assert;
const expect = chai.expect;

let exampleButtonScript = `
on click
    put 1 into myVar
    doFirstNested
    set "name" to myVar
end click

on doFirstNested
    put 2 into myVar
    doSecondNested
end doFirstNested

on doSecondNested
    put 3 into myVar
    doThirdNested
end doSecondNested

on doThirdNested
    put 4 into myVar
end doThirdNested
`;

let buttonModel;
let currentCardModel;

function compileButtonScript(aScript){
    let msg = {
        type: 'compile',
        codeString: aScript,
        targetId: buttonModel.id
    };
    window.System.compile(msg);
};

function sendButtonClick(){
    let clickMessage = {
        type: 'command',
        commandName: 'click',
        args: []
    };
    buttonModel.sendMessage(clickMessage, buttonModel);
};

describe("Test nested stack execution of messages on single button part", () => {
    describe("Model Setup", () => {
        it('Can add a button to current card model without error', () => {
            currentCardModel = window.System.getCurrentCardModel();
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
            let button = currentCardModel.subparts.filter(part => {
                return part.type == 'button';
            })[0];
            buttonModel = button;
            assert.exists(button);
        });
    });
    describe("Can properly map vars in nested messages on button", () => {
        it('Can compile example script without error', () => {
            let compileFunction = () => {
                compileButtonScript(exampleButtonScript);
            };
            expect(compileFunction).to.not.throw(Error);
        });
        it('Sets button name to correct value when clicked', () => {
            // We expect the result of myVar in the outer
            // click handler to still be 1, and so the
            // name of the button should be set to the
            // string "1"
            sendButtonClick();
            let name = buttonModel.partProperties.getPropertyNamed(
                buttonModel,
                "name"
            );
            assert.equal(name, "1");
        });
    });
});
