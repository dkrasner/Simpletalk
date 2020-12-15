/**
 * ExecutionContext Tests
 * ----------------------------------------
 * Integration test of variable context in
 * executions of message handlers on Parts
 *
 */
import chai from 'chai';
const assert = chai.assert;
const expect = chai.expect;

describe('Basic ExecutionContext variable tests', () => {
    let testScript = [
        'on myCustomHandler',
        '\tput 3 into myVariable',
        'end myCustomHandler',
        '\n',
        'on myOtherHandler',
        '\tput 1 into myVariable',
        'end myOtherHandler'
    ].join('\n');

    let currentCard = System.getCurrentCardModel();

    it('Can compile the test script on current card', () => {
        let msg = {
            type: 'compile',
            codeString: testScript,
            targetId: currentCard.id
        };
        let sendFunction = function(){
            currentCard.sendMessage(msg, currentCard);
        };
        expect(sendFunction).to.not.throw();
    });
    it('Can send the myCustomHandler message', () => {
        let sendFunction = function(){
            let msg = {
                type: 'command',
                commandName: 'myCustomHandler',
                args: []
            };
            currentCard.sendMessage(msg, currentCard);
        };
        expect(sendFunction).to.not.throw();
    });
    it('Has an execution context', () => {
        assert.exists(currentCard._executionContext);
    });
    it('Has the variable set correctly in the execution context', () => {
        let value = currentCard._executionContext.getLocal('myVariable');
        assert.equal(value, 3);
    });
    it('Can send myOtherHandler message', () => {
        let sendFunction = function(){
            let msg = {
                type: 'command',
                commandName: 'myOtherHandler',
                args: []
            };
            currentCard.sendMessage(msg, currentCard);
        };
        expect(sendFunction).to.not.throw();
    });
    it('Has correct value for myVariable', () => {
        let value = currentCard._executionContext.getLocal('myVariable');
        assert.equal(value, 1);
    });
    it('Still has correct value for previous handler\'s variable', () => {
        let value = currentCard._executionContext._lookup['myCustomHandler']['myVariable'];
        assert.equal(value, 3);
    });
});
