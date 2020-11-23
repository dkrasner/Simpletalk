/**
 * System WorldCatalog Window Tests
 * ------------------------------------
 * These are integration tests that ensure
 * we are creating, propertly opening, and
 * have the correct functionality in the
 * World Catalog window when we send a message
 * to the System that it should be created.
 */
import chai from 'chai';
const assert = chai.assert;
const expect = chai.expect;

describe('Opening a WorldCatalog', () => {
    describe('Existing Toolbox window', () => {
        it('There is exactly one open window (toolbox) in the world', () => {
            let foundWindows = document.querySelectorAll('st-window');
            assert.equal(foundWindows.length, 1);
        });
        it('Can remove the existing toolbox for further testing', () => {
            let foundWindows = document.querySelectorAll('st-window');
            foundWindows.forEach(el => { el.remove(); });
            foundWindows = document.querySelectorAll('st-window');
            assert.equal(foundWindows.length, 0);
        });
    });
    describe('Sending openWorldCatalog message', () => {
        /**
         * this test is currently being skipped due to the
         * node-fetch "relative urls" issue.
         * The bug it produces is only an artifact of the testing
         * environment and does not appear in the live system
         **/
        it.skip('Sending #openWorldCatalog without arguments does not produce an error', () => {
            let openMsg = {
                type: 'command',
                commandName: 'openWorldCatalog',
                args: []
            };

            let currentCard = window.System.getCurrentCardModel();
            assert.exists(currentCard);

            let sendFunction = function(){
                currentCard.sendMessage(
                    openMsg,
                    currentCard
                );
            };
            expect(sendFunction).to.not.throw();
        });
    });
});
