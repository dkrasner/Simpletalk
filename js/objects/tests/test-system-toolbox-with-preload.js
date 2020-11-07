/**
 * System Toolbox Window Tests
 * --------------------------------------
 * These are integration tests that ensure
 * we are creating, properly opening, and
 * have the correct functionality in the Toolbox
 * when we send the message to the System that
 * it should be opened.
 * To open a Toolbox window, we send the
 * 'openToolbox' command message to System.
 */
import chai from 'chai';
const assert = chai.assert;
const expect = chai.expect;

describe('Opening a Toolbox', () => {
    it('There is exactly one open window (toolbox) in the world', () => {
        let foundWindows = document.querySelectorAll('st-window');
        assert.equal(foundWindows.length, 1 );
    });
    it('Can remove the current window from the world for further testing (TODO! make programmatic) ', () => {
        let foundWindows = document.querySelectorAll('st-window');
        foundWindows.forEach((node) => {node.remove()});
        foundWindows = document.querySelectorAll('st-window');
        assert.equal(foundWindows.length, 0);
    });
    it('Sending the #openToolbox message to System will be understood', () => {
        let openMsg = {
            type: 'command',
            commandName: 'openToolbox',
            args: [] // No id given, System assumes current stack
        };
        let sendFunction = function(){
            System.receiveMessage(openMsg);
        };
        expect(sendFunction).to.not.throw(Error);
    });
    it('Current StackView now has WindowView as a child element', () => {
        let currStackView = document.querySelector('st-stack.current-stack');
        assert.exists(currStackView);
        let windowView = document.querySelector('st-window');
        assert.exists(windowView);

        let foundWindow = currStackView.querySelector('st-window');
        assert.equal(foundWindow, windowView);
    });
    it('Current Stack Part now has a Window as a subpart', () => {
        let currentStack = document.querySelector('st-stack.current-stack').model;
        assert.exists(currentStack);
        let windowModel = document.querySelector('st-window').model;
        assert.exists(windowModel);

        assert.include(currentStack.subparts, windowModel);
    });
});

describe('Toolbox functionality', () => {
    /* Note: For now we only have
       the add button to card functionality
    */
    let currentCardView;
    let currentStackView;
    let windowStackView;
    let windowCurrentCardView;
    before(() => {
        currentStackView = document.querySelector('st-stack.current-stack');
        currentCardView = currentStackView.querySelector('.current-card');
        windowStackView = currentStackView.querySelector('st-window st-stack');
        windowCurrentCardView = windowStackView.querySelector('.current-card');
    });
    it('Has all appropriate views', () => {
        assert.exists(currentStackView);
        assert.exists(currentCardView);
        assert.exists(windowStackView);
        assert.exists(windowCurrentCardView);
    });
    describe('Add Button to Card functionality', () => {
        it('Toolbox has at least one button in it', () => {
            let buttonViews = windowCurrentCardView.querySelectorAll('st-button');
            assert.isTrue(buttonViews.length > 0);
        });
        it('First button has a script set', () => {
            let firstButtonModel = windowCurrentCardView.querySelector('st-button').model;
            let script = firstButtonModel.partProperties.getPropertyNamed(
                firstButtonModel,
                'script'
            );

            assert.notEqual(script, '');
        });
        it('Current Card has no Buttons yet', () => {
            let cardModel = currentCardView.model;
            let buttonSubParts = cardModel.subparts.filter(subpart => {
                return subpart.type == 'button';
            });
            assert.equal(0, buttonSubParts.length);
        });
        it('Current CardView has no ButtonViews yet', () => {
            let buttonViews = Array.from(
                currentCardView.querySelectorAll('st-button')
            );
            assert.equal(0, buttonViews.length);
        });
        it('Clicking add buttons button twice adds two button models and views', () => {
            let addButtonButtonView = windowCurrentCardView.querySelector('st-button:first-child');
            assert.exists(addButtonButtonView);

            // Click twice
            addButtonButtonView.click();
            addButtonButtonView.click();

            // Check models
            let cardModel = currentCardView.model;
            let buttonModels = cardModel.subparts.filter(subpart => {
                return subpart.type == 'button';
            });
            assert.equal(buttonModels.length, 2);

            // Check views
            let buttonViews = currentCardView.querySelectorAll('st-button');
            assert.equal(buttonViews.length, 2);
        });
    });
});
