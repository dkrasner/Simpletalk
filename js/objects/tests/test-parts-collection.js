/**
 * PartsCollection Tests
 * ---------------------------------------
 * Tests for the PartsCollection class.
 * These tests only cover the class itself.
 * For any tests of how a specific Part handles
 * or interacts with a sub/child part, see the
 * tests for that Part class.
 */
import chai from 'chai';
const assert = chai.assert;
import {PartCollection} from '../parts/PartCollection';
import idMaker from '../utils/idMaker';


// Instead of using actual Part objects,
// we use objects that constitute a minimal
// polymorphic stand-in for each.
// This is because the constructors for parts
// themselves interact heavily with internal
// PartsCollection instances, so we can't properly
// test the unit with real parts.

const MockStack = function(){
    this.type = 'stack';
    this.id = idMaker.new();
};

const MockCard = function(){
    this.type = 'card';
    this.id = idMaker.new();
};

const MockButton = function(){
    this.type = 'button';
    this.id = idMaker.new();
};

const MockField = function(){
    this.type = 'field';
    this.id = idMaker.new();
};

describe('PartCollection Tests', () => {
    describe('Adding and Removing', () => {
        let parentCard;
        let partCollection;
        let newButton;
        before(() => {
            parentCard = new MockCard();
            partCollection = new PartCollection(parentCard);
            newButton = new MockButton();
        });

        it('Initialized PartCollection has the correct owner', () => {
            assert.equal(parentCard, partCollection.owner);
        });

        it('#addPart adds a new button to the appropriate internal collections', () => {
            partCollection.addPart(newButton);
            assert(partCollection.allParts.includes(newButton));
            assert.exists(partCollection.partsByType['button']);
            assert(partCollection.partsByType['button'].includes(newButton));
            assert.equal(partCollection.partsById[newButton.id], newButton);
        });

        it('#addPart sets corect owner of added part', () => {
            assert.equal(parentCard, newButton._owner);
        });

        it('#removePart removes the part from appropriate internal collections', () => {
            partCollection.removePart(newButton);
            assert.notInclude(partCollection.allParts, newButton);
            assert.notInclude(partCollection.partsByType['button'], newButton);
            assert.notExists(partCollection.partsById[newButton.id]);
        });
    });

    describe('Parts Lookup: getting Parts by certain values and indices', () => {
        let parentCard;
        let partCollection;
        let button1;
        let button2;
        let field1;
        let field2;

        before(() => {
            parentCard = new MockCard();
            partCollection = new PartCollection(parentCard);
            button1 = new MockButton();
            button2 = new MockButton();
            field1 = new MockField();
            field2 = new MockField();

            // Add all these parts
            partCollection.addPart(button1); // Part 1, button 1
            partCollection.addPart(button2); // Part 2, button 2
            partCollection.addPart(field1); // Part 3, field 1
            partCollection.addPart(field2); // Part 4, field 2
        });

        it('#getPartById returns correct part', () => {
            let expected = button2;
            let actual = partCollection.getPartById(button2.id);
            assert.equal(expected, actual);
        });

        it('#getPartByPartIndex returns correct part', () => {
            // Returns the part at the absolute part index
            // for the collection. These should be 1-indexed values
            // Our part indices are specified in the before() function
            assert.equal(
                partCollection.getPartByPartIndex(1),
                button1
            );
            assert.equal(
                partCollection.getPartByPartIndex(2),
                button2
            );
            assert.equal(
                partCollection.getPartByPartIndex(3),
                field1
            );
            assert.equal(
                partCollection.getPartByPartIndex(4),
                field2
            );
        });

        it('#getTypeIndexForPart returns correct value', () => {
            // We expect the return values for each part
            // to be the 1-index value for that part as it
            // appears in the 'by type' subcollection.
            let expectedButton1 = 1;
            let expectedButton2 = 2;
            let expectedField1 = 1;
            let expectedField2 = 2;

            assert.equal(
                partCollection.getTypeIndexForPart(button1),
                expectedButton1
            );
            assert.equal(
                partCollection.getTypeIndexForPart(button2),
                expectedButton2
            );
            assert.equal(
                partCollection.getTypeIndexForPart(field1),
                expectedField1
            );
            assert.equal(
                partCollection.getTypeIndexForPart(field2),
                expectedField2
            );
        });

        it('#getPartByTypeIndex returns the correct matching part', () => {

            // Note that the indices given to the method
            // are 1-indexed values (as opposed to 0-indexed)
            // as this is what HyperTalk expects
            assert.equal(
                partCollection.getPartByTypeIndex('button', 1),
                button1
            );
            assert.equal(
                partCollection.getPartByTypeIndex('button', 2),
                button2
            );
            assert.equal(
                partCollection.getPartByTypeIndex('field', 1),
                field1
            );
            assert.equal(
                partCollection.getPartByTypeIndex('field', 2),
                field2
            );
        });

    });
});
