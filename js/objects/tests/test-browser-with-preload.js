/**
 * Browser Part Model + View Tests
 * -----------------------------------------------
 */
import chai from 'chai';
const assert = chai.assert;


describe('Browser Part & View Tests', () => {
    describe('System initialialization', () => {
        before('Has loaded set to true', () => {
            assert.isTrue(System.isLoaded);
            let World = document.querySelector('st-world');
            assert.exists(World);
            let currentStack = document.querySelector('st-stack.current-stack');
            assert.exists(currentStack);
            assert.exists(currentStack.model);
            let currentCard = document.querySelector('st-card.current-card');
            assert.exists(currentCard);
            assert.exists(currentCard.model);
        });
        it('Can add browser model+view to current card (via message)', () => {
            let currentCard = document.querySelector('st-world st-card.current-card');
            assert.exists(currentCard.model);
            let msg = {
                type: "command",
                commandName: "newModel",
                args: ["browser", currentCard.model.id]
            };
            currentCard.sendMessage(msg, currentCard.model);
            let browser = currentCard.querySelector('st-browser');
            assert.exists(browser);
            assert.exists(browser.model);
        });
        it('Can set iframe property with html', () => {
            let browser;
            document.querySelectorAll('st-card.current-card > st-browser').forEach((el) => {
                if (!el.isLensed) {browser = el;}
            });
            const html = "<div>I am a div</div>";
            let msg = {
                type: "command",
                commandName: "setProperty",
                args: ["iframe", html]
            };
            browser.model.sendMessage(msg, browser.model);
            assert.equal(browser.model.partProperties.getPropertyNamed(browser.model, "iframe"), html);
        });
        it('Can dispatch "messageHost" event from browser iframe', () => {
            let browser;
            document.querySelectorAll('st-card.current-card > st-browser').forEach((el) => {
                if (!el.isLensed) { browser = el; }
            });
            const html = browser._shadowRoot.querySelector("div");
            let msg = {
                type: "command",
                commandName: "setProperty",
                args: ["top", 25]
            };
            const event = new CustomEvent("messageHost", {
                bubbles: true,
                composed: true,
                detail: {"message": msg}
            });
            html.dispatchEvent(event);
            assert.equal(browser.model.partProperties.getPropertyNamed(browser.model, "top"), 25);
        });
    });
});
