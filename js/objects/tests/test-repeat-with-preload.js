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
};

function sendButtonClick(){
    let clickMessage = {
        type: 'command',
        commandName: 'click',
        args: []
    };
    buttonModel.sendMessage(clickMessage, buttonModel);
};

function getLocalVar(obj, varName){
    return obj._executionContext.getLocal(varName);
};

describe("Repeat Looping Tests", () => {
    describe("Model Setup", () => {
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

    describe("Repeat forNumTimes tests", () => {
            it("Can compile a basic script and loop correct num times", () => {
                let script = [
                    "on click",
                    "put 0 into myNum",
                    "repeat for 5 times",
                    "put (myNum + 1) into myNum",
                    "end repeat",
                    "end click"
                ].join("\n");
                compileButtonScript(script);
                sendButtonClick(script);
                let result = getLocalVar(buttonModel, "myNum");
                assert.equal(result, 5);
            });
            it("Can compile a script and loop num times based on variable", () => {
                let script = [
                    "on click",
                    "put 0 into myNum",
                    "put 3 into myCount",
                    "repeat for myCount times",
                    "put (myNum + 1) into myNum",
                    "end repeat",
                    "end click"
                ].join("\n");
                compileButtonScript(script);
                sendButtonClick(script);
                let result = getLocalVar(buttonModel, "myNum");
                assert.equal(result, 3);
            });
    });
    describe("Repeat untilCondition tests", () => {
        it("Can compile and loop until condition is met", () => {
            let script = [
                "on click",
                "\tput 5 into myLimit",
                "\tput 0 into myCount",
                "\trepeat until myLimit <= 0",
                "\tput (myCount + 1) into myCount",
                "\tput (myLimit - 1) into myLimit",
                "\tend repeat",
                "end click"
            ].join("\n");
            console.log(script);
            compileButtonScript(script);
            sendButtonClick(script);
            let resultLimit = getLocalVar(buttonModel, "myLimit");
            let resultCount = getLocalVar(buttonModel, "myCount");
            assert.equal(resultLimit, 0);
            assert.equal(resultCount, 5);
        });
    });
});




