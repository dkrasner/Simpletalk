/**
 * General Part Tests 
 * -------------------------------------------
 */
import chai from 'chai';
const assert = chai.assert;
const expect = chai.expect;

let currentCard;
let button;
describe('Basic functionality', () => {
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
    describe('Core methods"', () => {
        it('Can get owner branch', () => {
            let branch = button.getOwnerBranch();
            let branchNodeByType = branch.map((node) => {return node.type;});
            assert.deepEqual(branchNodeByType, ["button", "card", "stack", "world", undefined]);
            assert.equal(branch[0].id, button.id);
        });
    });
    describe('Command Handlers"', () => {
        it('Can properly list all boot up command handlers present', () => {
            // we just check for a few of the core handlers and make sure these
            // are present, as these evolve too quickly to keep a comprehensive list
            assert.deepEqual(button.commandHandlerRegistry["newModel"], {partId: button.id, partType: "button", override: true, private: true});
            assert.deepEqual(button.commandHandlerRegistry["answer"], {partId: -1, partType: "System", override: false, private: false});
        });
        it('Adding a new command handler adds it to the registry', () => {
            button._commandHandlers["newHandler"] = function(){};
            assert.deepEqual(button.commandHandlerRegistry["newHandler"], {partId: button.id, partType: "button", override: false, private: false});
        });
        it('Overriding a command handler is properly registered', () => {
            button._commandHandlers["answer"] = function(){};
            assert.deepEqual(button.commandHandlerRegistry["answer"], {partId: button.id, partType: "button", override: true, private: false});
        });
    });
});
