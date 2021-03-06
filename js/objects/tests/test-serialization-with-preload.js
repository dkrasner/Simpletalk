/**
 * Serialization / Deserialization Tests
 * ---------------------------------------------
 * Integration tests to ensure that JSON serialization
 * and saving whole HTML of application work as
 * expected
 */
import chai from 'chai';
const assert = chai.assert;
const expect = chai.expect;

function getSerializationString(){
    System.serialize();
    let serializationEl = document.getElementById('serialization');
    return serializationEl.textContent;
}

describe("Serialization / Deserialization Tests", () => {
    describe("JSON Serialization Tests", () => {
        // We will create a new button to
        // test serialization
        let foundButton;

        it("Can match itself on multiple serializations", () => {
            window.System.serialize();
            var serializationEl = document.getElementById('serialization');
            let first = serializationEl.textContent;
            System.serialize();
            serializationEl = document.getElementById('serialization');
            let second = serializationEl.textContent;
            assert.equal(first, second);
        });
        it('Adding a button to current card will be serialized', () => {
            let currentCard = System.getCurrentCardModel();
            System.newModel('button', currentCard.id, "My New Button");
            foundButton = currentCard.subparts.find(subpart => {
                let name = subpart.partProperties.getPropertyNamed(
                    subpart,
                    'name'
                );
                return name == "My New Button";
            });
            assert.exists(foundButton);
            let serialization = getSerializationString();
            let json = JSON.parse(serialization);
            assert.include(Object.keys(json.parts), foundButton.id.toString());
        });
        it("Loading from new serialization, we get the correct button", () => {
            // Clear models and views
            System.partsById = {};
            document.querySelector('st-world').remove();
            System.deserialize().then(() => {
                let currentCard = System.getCurrentCardModel();
                foundButton = currentCard.subparts.find(subpart => {
                    let name = subpart.partProperties.getPropertyNamed(
                        subpart,
                        'name'
                    );
                    return name == "My New Button";
                });
                assert.exists(foundButton);
            });
        });
    });

    describe("HTML saving tests", () => {
        it("Can match itself on multiple saves", () => {
            System.serialize();
            let first = System.getFullHTMLString();
            System.serialize();
            let second = System.getFullHTMLString();
            assert.equal(first, second);
        });
    });
});
