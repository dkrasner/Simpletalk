import chai from 'chai';
import ohm from 'ohm-js';
const assert = chai.assert;
const expect = chai.expect;

import interpreterSemantics from '../../ohm/interpreter-semantics.js';

let testLanguageGrammar = ohm.grammar(window.grammar);

let fields = [];
let buttons = [];
let cards = [];
let currentCardModel = null;
let area = null;

// Helper function that adds cards, buttons, and
// fields to the current stack.
// We add 3 buttons and fields each to
// three cards total (including the current one)
// in an alternating pattern
function setupCardsAndParts(){
    let stack = window.System.getCurrentStackModel();
    for(let i = 0; i < 3; i++){
        let currentCard = window.System.getCurrentCardModel();
        window.System.newModel(
            'button',
            currentCard.id,
            `Button ${1}`
        );
        window.System.newModel(
            'field',
            currentCard.id,
            `Field ${1}`
        );
        window.System.newModel(
            'button',
            currentCard.id,
            `Button ${2}`
        );
        window.System.newModel(
            'field',
            currentCard.id,
            `Field ${2}`
        );
        window.System.newModel(
            'button',
            currentCard.id,
            `Button ${3}`
        );
        window.System.newModel(
            'field',
            currentCard.id,
            `Field ${3}`
        );
        let areaModel = window.System.newModel(
            'area',
            currentCard.id,
            `Area ${1}`
        );
        window.System.newModel(
            'button',
            areaModel.id,
            `Area Button ${1}`
        );

        if(i < 2){
            window.System.newModel(
                'card',
                stack.id,
                'stack'
            );
            window.System.goToNextCard();
        }
    }
}

describe("ObjectSpecifier Tests", () => {
    describe("Model Setup", () => {
        it("Can find the current card model", () => {
            let currentCardView = document.querySelector('.current-stack > .current-card');
            currentCardModel = currentCardView.model;
            assert.exists(currentCardModel);
        });
        it("Can add all the cards and test parts without error", () => {
            expect(setupCardsAndParts).to.not.throw();
        });
        it("Can load the language grammar", () => {
            assert.exists(testLanguageGrammar);
        });
    });
    describe("Simple specifiers with current card in context", () => {
        let semantics;
        let partContext;

        before(() => {
            partContext = window.System.getCurrentCardModel();
            semantics = testLanguageGrammar.createSemantics();
            semantics.addOperation(
                'interpret',
                interpreterSemantics(partContext, window.System)
            ); 
        });
        it("Can match the button 1 of current card", () => {
            let str = `button 1 of current card`;
            let matchObject = testLanguageGrammar.match(str, 'ObjectSpecifier');
            assert.isTrue(matchObject.succeeded());
            let expectedPart = partContext.subparts.filter(part => {
                return part.type == 'button';
            })[0];
            let expectedValue = expectedPart.id;
            let result = semantics(matchObject).interpret();
            assert.equal(expectedValue, result);
        });
        it("Can match second field of current card", () => {
            let str = `second field of current card`;
            let matchObject = testLanguageGrammar.match(str, 'ObjectSpecifier');
            assert.isTrue(matchObject.succeeded());
            let expectedPart = partContext.subparts.filter(part => {
                return part.type == 'field';
            })[1];
            let expectedValue = expectedPart.id;
            let result = semantics(matchObject).interpret();
            assert.equal(expectedValue, result);
        });
        it("Can match part 3 of the current card", () => {
            let str = `part 3 of current card`;
            let matchObject = testLanguageGrammar.match(str, 'ObjectSpecifier');
            assert.isTrue(matchObject.succeeded());
            let expectedPart = partContext.subparts[2];
            let expectedValue = expectedPart.id;
            let result = semantics(matchObject).interpret();
            assert.equal(expectedValue, result);
        });
        it("Can match the fourth part of the current card", () => {
            let str = `fourth part of current card`;
            let matchObject = testLanguageGrammar.match(str, 'ObjectSpecifier');
            assert.isTrue(matchObject.succeeded());
            let expectedPart = partContext.subparts[3];
            let expectedValue = expectedPart.id;
            let result = semantics(matchObject).interpret();
            assert.equal(expectedValue, result);
        });
        it("Can match a field by name", () => {
            let str = `field "Field 2" of current card`;
            let matchObject = testLanguageGrammar.match(str, 'ObjectSpecifier');
            assert.isTrue(matchObject.succeeded());
            let expectedPart = partContext.subparts.filter(subpart => {
                return subpart.type == 'field';
            })[1];
            let expectedValue = expectedPart.id;
            let result = semantics(matchObject).interpret();
            assert.equal(expectedValue, result);
        });
    });
    describe("Simple specifiers with a 'this' card in context", () => {
        let semantics;
        let partContext;

        before(() => {
            // We set the 'this card' part context to be the 2nd card in the stack, which
            // is different from the current card (which is the 3rd card at this point).
            // Remember that 'current card' and 'this card' can be different, if the script
            // calling it is in a part that is not within the currently displayed card
            partContext = window.System.getCurrentStackModel().subparts.filter(subpart => {
                return subpart.type == 'card';
            })[1];
            semantics = testLanguageGrammar.createSemantics();
            semantics.addOperation(
                'interpret',
                interpreterSemantics(partContext, window.System)
            ); 
        });

        it("Can match the button 1 of this card", () => {
            let str = `button 1 of this card`;
            let matchObject = testLanguageGrammar.match(str, 'ObjectSpecifier');
            assert.isTrue(matchObject.succeeded());
            let expectedPart = partContext.subparts.filter(part => {
                return part.type == 'button';
            })[0];
            let expectedValue = expectedPart.id;
            let result = semantics(matchObject).interpret();
            assert.equal(expectedValue, result);
        });
        it("Can match second field of this card", () => {
            let str = `second field of this card`;
            let matchObject = testLanguageGrammar.match(str, 'ObjectSpecifier');
            assert.isTrue(matchObject.succeeded());
            let expectedPart = partContext.subparts.filter(part => {
                return part.type == 'field';
            })[1];
            let expectedValue = expectedPart.id;
            let result = semantics(matchObject).interpret();
            assert.equal(expectedValue, result);
        });
        it("Can match part 3 of the this card", () => {
            let str = `part 3 of this card`;
            let matchObject = testLanguageGrammar.match(str, 'ObjectSpecifier');
            assert.isTrue(matchObject.succeeded());
            let expectedPart = partContext.subparts[2];
            let expectedValue = expectedPart.id;
            let result = semantics(matchObject).interpret();
            assert.equal(expectedValue, result);
        });
        it("Can match the fourth part of the this card", () => {
            let str = `fourth part of this card`;
            let matchObject = testLanguageGrammar.match(str, 'ObjectSpecifier');
            assert.isTrue(matchObject.succeeded());
            let expectedPart = partContext.subparts[3];
            let expectedValue = expectedPart.id;
            let result = semantics(matchObject).interpret();
            assert.equal(expectedValue, result);
        });
        it("Can match a field by name", () => {
            let str = `field "Field 2" of this card`;
            let matchObject = testLanguageGrammar.match(str, 'ObjectSpecifier');
            assert.isTrue(matchObject.succeeded());
            let expectedPart = partContext.subparts.filter(subpart => {
                return subpart.type == 'field';
            })[1];
            let expectedValue = expectedPart.id;
            let result = semantics(matchObject).interpret();
            assert.equal(expectedValue, result);
        });
    });

    describe("Simple specifiers with implicit card context (equiv. to 'this')", () => {
        let semantics;
        let partContext;

        before(() => {
            // We set the 'this card' part context to be the 2nd card in the stack, which
            // is different from the current card (which is the 3rd card at this point).
            // Remember that 'current card' and 'this card' can be different, if the script
            // calling it is in a part that is not within the currently displayed card
            partContext = window.System.getCurrentStackModel().subparts.filter(subpart => {
                return subpart.type == 'card';
            })[1];
            semantics = testLanguageGrammar.createSemantics();
            semantics.addOperation(
                'interpret',
                interpreterSemantics(partContext, window.System)
            ); 
        });

        it("Can match the button 1 (implicit this card)", () => {
            let str = `button 1`;
            let matchObject = testLanguageGrammar.match(str, 'ObjectSpecifier');
            assert.isTrue(matchObject.succeeded());
            let expectedPart = partContext.subparts.filter(part => {
                return part.type == 'button';
            })[0];
            let expectedValue = expectedPart.id;
            let result = semantics(matchObject).interpret();
            assert.equal(expectedValue, result);
        });
        it("Can match second field (implicit this card)", () => {
            let str = `second field`;
            let matchObject = testLanguageGrammar.match(str, 'ObjectSpecifier');
            assert.isTrue(matchObject.succeeded());
            let expectedPart = partContext.subparts.filter(part => {
                return part.type == 'field';
            })[1];
            let expectedValue = expectedPart.id;
            let result = semantics(matchObject).interpret();
            assert.equal(expectedValue, result);
        });
        it("Can match part 3 of (implicit this card)", () => {
            let str = `part 3`;
            let matchObject = testLanguageGrammar.match(str, 'ObjectSpecifier');
            assert.isTrue(matchObject.succeeded());
            let expectedPart = partContext.subparts[2];
            let expectedValue = expectedPart.id;
            let result = semantics(matchObject).interpret();
            assert.equal(expectedValue, result);
        });
        it("Can match the fourth part (implicit this card)", () => {
            let str = `fourth part`;
            let matchObject = testLanguageGrammar.match(str, 'ObjectSpecifier');
            assert.isTrue(matchObject.succeeded());
            let expectedPart = partContext.subparts[3];
            let expectedValue = expectedPart.id;
            let result = semantics(matchObject).interpret();
            assert.equal(expectedValue, result);
        });
        it("Can match a field by name (implicit this card)", () => {
            let str = `field "Field 2"`;
            let matchObject = testLanguageGrammar.match(str, 'ObjectSpecifier');
            assert.isTrue(matchObject.succeeded());
            let expectedPart = partContext.subparts.filter(subpart => {
                return subpart.type == 'field';
            })[1];
            let expectedValue = expectedPart.id;
            let result = semantics(matchObject).interpret();
            assert.equal(expectedValue, result);
        });
    });

    describe("Complex Specifiers with current stack in context", () => {
        let semantics;
        let partContext;

        before(() => {
            partContext = window.System.getCurrentStackModel();
            semantics = testLanguageGrammar.createSemantics();
            semantics.addOperation(
                'interpret',
                interpreterSemantics(partContext, window.System)
            ); 
        });

        it("Can get button 1 of card 2 of current stack", () => {
            let str = `button 1 of card 2 of current stack`;
            let matchObject = testLanguageGrammar.match(str, 'ObjectSpecifier');
            assert.isTrue(matchObject.succeeded());
            let secondCard = partContext.subparts.filter(subpart => {
                return subpart.type == 'card';
            })[1];
            let expectedPart = secondCard.subparts.filter(subpart => {
                return subpart.type == 'button';
            })[0];
            let expectedValue = expectedPart.id;
            let result = semantics(matchObject).interpret();
            assert.equal(expectedValue, result);
        });
        it("Can get third field of second card of current stack", () => {
            let str = `third field of second card of current stack`;
            let matchObject = testLanguageGrammar.match(str, 'ObjectSpecifier');
            assert.isTrue(matchObject.succeeded());
            let secondCard = partContext.subparts.filter(subpart => {
                return subpart.type == 'card';
            })[1];
            let expectedPart = secondCard.subparts.filter(subpart => {
                return subpart.type == 'field';
            })[2];
            let expectedValue = expectedPart.id;
            let result = semantics(matchObject).interpret();
            assert.equal(expectedValue, result);
        });
    });
    describe("Complex Specifiers without terminal", () => {
        describe("Context is current card", () => {
            let semantics;
            let partContext;

            before(() => {
                partContext = window.System.getCurrentCardModel();
                semantics = testLanguageGrammar.createSemantics();
                semantics.addOperation(
                    'interpret',
                    interpreterSemantics(partContext, window.System)
                );
            });

            it("Can get button 1 of area 1 ", () => {
                let str = `button 1 of area 1`;
                let matchObject = testLanguageGrammar.match(str, 'ObjectSpecifier');
                assert.isTrue(matchObject.succeeded());
                let firstArea = partContext.subparts.filter(subpart => {
                    return subpart.type == 'area';
                })[0];
                let expectedPart = firstArea.subparts.filter(subpart => {
                    return subpart.type == 'button';
                })[0];
                let expectedValue = expectedPart.id;
                let result = semantics(matchObject).interpret();
                assert.equal(expectedValue, result);
            });
            it("Can get button 1 of area 1 of card 1", () => {
                let str = `button 1 of area 1 of card 1`;
                let matchObject = testLanguageGrammar.match(str, 'ObjectSpecifier');
                assert.isTrue(matchObject.succeeded());
                let firstCard = window.System.getCurrentStackModel().subparts.filter(subpart => {
                    return subpart.type == 'card';
                })[0];
                let firstArea = firstCard.subparts.filter(subpart => {
                    return subpart.type == 'area';
                })[0];
                let expectedPart = firstArea.subparts.filter(subpart => {
                    return subpart.type == 'button';
                })[0];
                let expectedValue = expectedPart.id;
                let result = semantics(matchObject).interpret();
                assert.equal(expectedValue, result);
            });
            it("Can get button 1 of area 1 of card 1 of stack 1", () => {
                let str = `button 1 of area 1 of card 1 of first stack`;
                let matchObject = testLanguageGrammar.match(str, 'ObjectSpecifier');
                assert.isTrue(matchObject.succeeded());
                let firstCard = window.System.getCurrentStackModel().subparts.filter(subpart => {
                    return subpart.type == 'card';
                })[0];
                let firstArea = firstCard.subparts.filter(subpart => {
                    return subpart.type == 'area';
                })[0];
                let expectedPart = firstArea.subparts.filter(subpart => {
                    return subpart.type == 'button';
                })[0];
                let expectedValue = expectedPart.id;
                let result = semantics(matchObject).interpret();
                assert.equal(expectedValue, result);
            });
        });
        describe("Context is current area of current card", () => {
            let semantics;
            let partContext;

            before(() => {
                let currentCard = window.System.getCurrentCardModel();
                partContext = currentCard.subparts.filter(subpart => {
                    return subpart.type == 'area';
                })[0];

                semantics = testLanguageGrammar.createSemantics();
                semantics.addOperation(
                    'interpret',
                    interpreterSemantics(partContext, window.System)
                );
            });

            it("Can get button 1 of area 1 ", () => {
                let str = `button 1`;
                let matchObject = testLanguageGrammar.match(str, 'ObjectSpecifier');
                assert.isTrue(matchObject.succeeded());
                let expectedPart = partContext.subparts.filter(subpart => {
                    return subpart.type == 'button';
                })[0];
                let expectedValue = expectedPart.id;
                let result = semantics(matchObject).interpret();
                assert.equal(expectedValue, result);
            });
            it("Can get button 1 of area 1 of card 1", () => {
                let str = `button 1 of area 1 of card 1`;
                let matchObject = testLanguageGrammar.match(str, 'ObjectSpecifier');
                assert.isTrue(matchObject.succeeded());
                let firstCard = window.System.getCurrentStackModel().subparts.filter(subpart => {
                    return subpart.type == 'card';
                })[0];
                let firstArea = firstCard.subparts.filter(subpart => {
                    return subpart.type == 'area';
                })[0];
                let expectedPart = firstArea.subparts.filter(subpart => {
                    return subpart.type == 'button';
                })[0];
                let expectedValue = expectedPart.id;
                let result = semantics(matchObject).interpret();
                assert.equal(expectedValue, result);
            });
            it("Can get button 1 of area 1 of card 1 of stack 1", () => {
                let str = `button 1 of area 1 of card 1 of first stack`;
                let matchObject = testLanguageGrammar.match(str, 'ObjectSpecifier');
                assert.isTrue(matchObject.succeeded());
                let firstCard = window.System.getCurrentStackModel().subparts.filter(subpart => {
                    return subpart.type == 'card';
                })[0];
                let firstArea = firstCard.subparts.filter(subpart => {
                    return subpart.type == 'area';
                })[0];
                let expectedPart = firstArea.subparts.filter(subpart => {
                    return subpart.type == 'button';
                })[0];
                let expectedValue = expectedPart.id;
                let result = semantics(matchObject).interpret();
                assert.equal(expectedValue, result);
            });
        });
    });
});
