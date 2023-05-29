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
        let initialButton;
        let currentCard;

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
            currentCard = System.getCurrentCardModel();
            System.newModel('button', currentCard.id, "My New Button");
            initialButton = currentCard.subparts.find(subpart => {
                let name = subpart.partProperties.getPropertyNamed(
                    subpart,
                    'name'
                );
                return name == "My New Button";
            });
            assert.exists(initialButton);
            let serialization = getSerializationString();
            let json = JSON.parse(serialization);
            assert.include(Object.keys(json.parts), initialButton.id.toString());
        });
        it("Loading from new serialization, we get the correct button", () => {
            // Clear models and views
            System.partsById = {};
            document.querySelector('st-world').remove();
            System.deserialize().then(() => {
                let currentCard = System.getCurrentCardModel();
                initialButton = currentCard.subparts.find(subpart => {
                    let name = subpart.partProperties.getPropertyNamed(
                        subpart,
                        'name'
                    );
                    return name == "My New Button";
                });
                assert.exists(initialButton);
            });
        });
        describe("Serializing/Deserializing specific parts", () => {
            let initialButton;
            let initialArea;
            it("Can add a button and area to the initial card", () => {
                currentCard = window.System.getCurrentCardModel();
                assert.exists(currentCard);
                initialButton = window.System.newModel('button', currentCard.id, "Initial Button");
                assert.exists(initialButton);
                initialArea = window.System.newModel('area', currentCard.id, "Initial Area");
                assert.exists(initialArea);
                System.serialize();
            });
            it("current card toJSONString() matches serialization", () => {
                const json = currentCard.toJSONString();
                assert.isTrue(serializationMatch(json));
            })
            it("button toJSONString() matches serialization", () => {
                const json = initialButton.toJSONString();
                assert.isTrue(serializationMatch(json));
            })
            it("area toJSONString() matches serialization", () => {
                const json = initialArea.toJSONString();
                assert.isTrue(serializationMatch(json));
            })
        })
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

const serializationMatch = function(json) {
    json = JSON.parse(json);
    const serialization = document.getElementById("serialization");
    const serializationJSON = JSON.parse(serialization.textContent);
    const partJSON = json.parts[json.id];
    const jsonMatch = (
        JSON.stringify(partJSON) == JSON.stringify(serializationJSON.parts[json.id])
    );
    const allPartIDs = Object.keys(serializationJSON.parts);
    const subPartMatch = partJSON.subparts.every((id) => {
        return allPartIDs.indexOf(id) > -1;
    });
    return jsonMatch && subPartMatch;
}
