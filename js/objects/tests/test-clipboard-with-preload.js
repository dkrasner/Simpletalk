/**
 * STClipboard Related Tests
 */
import chai from 'chai';
const assert = chai.assert;
const expect = chai.expect;

const expectedMimeType = "simpletalk/json";

describe("Basic Copy and Paste Tests", () => {
    let currentCard;
    let currentStack;
    let initialButton;
    let initialArea;
    describe("Model setup", () => {
        it("Can add a button and area to the initial card", () => {
            currentCard = window.System.getCurrentCardModel();
            assert.exists(currentCard);
            initialButton = window.System.newModel('button', currentCard.id, "Initial Button");
            assert.exists(initialButton);
            initialArea = window.System.newModel('area', currentCard.id, "Initial Area");
            assert.exists(initialArea);
        });
        it("The System clipboard is empty", () => {
            assert.isEmpty(window.System.clipboard.contents);
        });
        describe("Copying the initial button", () => {
            it("Places an item into the clipboard contents", () => {
                window.System.clipboard.copyPart(initialButton);
                assert.equal(window.System.clipboard.contents.length, 1);
            });
            it("Clipboard contents item has correct mimeType", () => {
                let item = window.System.clipboard.contents[0];
                assert.equal(item.type, expectedMimeType);
            });
            it("The encoded data, when deserialized, has the same type as the copied element", () => {
                let deserializedItem = JSON.parse(window.System.clipboard.contents[0].data);
                assert.equal(deserializedItem.type, "button");
            });
        });
        describe("Pasting the initial button into the area", () => {
            it("Can paste the clipboard contents (button) into the area on the card without error", (done) => {
                let pasteAction = function(){
                    window.System.clipboard.pasteContentsInto(initialArea).then(() => {
                        return done();
                    });
                };
                expect(pasteAction).to.not.throw();
            });
            it("The Area now has one subpart that is a button", () => {
                assert.equal(initialArea.subparts.length, 1);
                assert.equal(initialArea.subparts[0].type, "button");
            });
            it("The button in the area does *not* have the same id as the initial button", () => {
                let areaButton = initialArea.subparts.find(subpart =>  { return subpart.type == "button";});
                assert.notEqual(areaButton.id, initialButton.id);
            });
        });
        describe("Can copy the Area", () => {
            it("Places an item in to the clipboard contents", () => {
                window.System.clipboard.copyPart(initialArea);
                assert.equal(window.System.clipboard.contents.length, 1);
            });
            it("Clipboard contents item has correct mimeType", () => {
                let item = window.System.clipboard.contents[0];
                assert.equal(item.type, expectedMimeType);
            });
            it("The encoded data, when deserialized, has the same type as the copied element", () => {
                let deserializedItem = JSON.parse(window.System.clipboard.contents[0].data);
                assert.equal(deserializedItem.type, "area");
            });
            it("Can create and navigate to a new card", () => {
                currentStack = window.System.getCurrentStackModel();
                window.System.newModel('card', currentStack.id, "Second Card");
                window.System.goToNextCard();
                currentCard = window.System.getCurrentCardModel();
                let secondStackCard = currentStack.subparts.filter(subpart => {
                    return subpart.type == "card";
                })[1];
                assert.equal(
                    currentCard.id,
                    secondStackCard.id
                );
            });
        });
        describe("Can paste the area (into new card)", () => {
            it("The current card has no area subparts", () => {
                let areas = currentCard.subparts.filter(subpart => {
                    return subpart.type == 'area';
                });
                assert.equal(areas.length, 0);
            });
            it("Can paste the clipboard contents (area) into a new card without error", (done) => {
                let pasteAction = function(){
                    window.System.clipboard.pasteContentsInto(currentCard).then(() => {
                        done();
                    });
                };
                expect(pasteAction).to.not.throw();
            });
            it("The card now has one area subpart", () => {
                let areas = currentCard.subparts.filter(subpart => {
                    return subpart.type == 'area';
                });
                assert.equal(areas.length, 1);
            });
            it("The pasted area does *not* have the same id as the initial area", () => {
                let pastedArea = currentCard.subparts.find(subpart => { return subpart.type == 'area';});
                assert.notEqual(pastedArea.id, initialArea.id);
            });
            it("The pasted area has the name name as the initial area", () => {
                let pastedArea = currentCard.subparts.find(subpart => { return subpart.type == 'area';});
                let pastedName = pastedArea.partProperties.getPropertyNamed(
                    pastedArea,
                    'name'
                );
                let originalName = initialArea.partProperties.getPropertyNamed(
                    initialArea,
                    'name'
                );
                assert.equal(pastedName, originalName);
            });
        });
        describe("Can copy the current card", () => {
            it("Places an item into the clipboard contents", () => {
                window.System.clipboard.copyPart(currentCard);
                assert.equal(window.System.clipboard.contents.length, 1);
            });
            it("Clipboard contents item has correct mimeType", () => {
                let item = window.System.clipboard.contents[0];
                assert.equal(item.type, expectedMimeType);
            });
            it("The encoded data, when deserialized, has the same type as the copied element", () => {
                let deserializedItem = JSON.parse(window.System.clipboard.contents[0].data);
                assert.equal(deserializedItem.type, "card");
            });
        });
        describe("Can paste the current card into the current stack", () => {
            it("The current stack only has 2 cards to start", () => {
                let cards = currentStack.subparts.filter(subpart => {
                    return subpart.type == 'card';
                });
                assert.equal(cards.length, 2);
            });
            it("Can paste the clipboard contents (card) into the stack without error", (done) => {
                let pasteAction = function(){
                    window.System.clipboard.pasteContentsInto(currentStack).then(() => {
                        done();
                    });
                };
                expect(pasteAction).to.not.throw();
            });
            it("The current stack now has 3 cards", () => {
                let cards = currentStack.subparts.filter(subpart => {
                    return subpart.type == 'card';
                });
                assert.equal(cards.length, 3);
            });
            it("The pasted card does *not* have the same id as the copied card", () => {
                let cards = currentStack.subparts.filter(subpart => {
                    return subpart.type == 'card';
                });
                let pastedCard = cards[2];
                let copiedCard = cards[1];
                assert.notEqual(pastedCard.id, copiedCard.id);
            });
            it("The pasted card has an area", () => {
                let pastedCard = currentStack.subparts.filter(subpart => {
                    return subpart.type == 'card';
                })[2];
                let areas = pastedCard.subparts.filter(subpart => {
                    return subpart.type == 'area';
                });
                assert.equal(areas.length, 1);
            });
            it("The area in the pasted card has a button", () => {
                let pastedCard = currentStack.subparts.filter(subpart => {
                    return subpart.type == 'card';
                })[2];
                let area = pastedCard.subparts.filter(subpart => {
                    return subpart.type == 'area';
                })[0];
                let buttons = area.subparts.filter(subpart => {
                    return subpart.type == 'button';
                });
                assert.equal(buttons.length, 1);
            });
        });
    });
});
