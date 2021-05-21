/**
 * PartProperties Tests
 * ---------------------------
 * This module tests the functionality of
 * The PartProperties, BasicProperty, and
 * DynamicProperty objects.
 * For tests of property handling on specific
 * Parts, see the <Partname>-properties.js test
 * files.
 */
import chai from 'chai';
const assert = chai.assert;
import {
    PartProperties,
    BasicProperty,
    CustomProperty,
    DynamicProperty
} from '../properties/PartProperties';


const MockOwner = {
    lastCalledProp: null,
    lastCalledVal: null,
    dynamicValue: 0,
    propertyChanged: function(name, val){
        this.lastCalledProp = name;
        this.lastCalledVal = val;
    }
};

describe('BasicProperty tests', () => {
    let basicProp;
    describe('accessing tests', () => {
        before(() => {
            basicProp = new BasicProperty(
                'myProperty',
                "",
                false,
                ['myProp', 'someProp']
            );
        });

        it('Should be able to get the default value (empty string)', () => {
            let expected = "";
            let actual = basicProp.getValue(MockOwner);
            assert.equal(expected, actual);
        });

        it('Should be able to set a basic value', () => {
            let expected = 2;
            basicProp.setValue(MockOwner, 2);
            let actual = basicProp._value;
            assert.equal(expected, actual);
        });

        it('Setting value calls appropriate callback on owner object', () => {
            basicProp.setValue(MockOwner, "NEW_VALUE");
            let expectedVal = "NEW_VALUE";
            let expectedName = basicProp.name;
            let actualVal = MockOwner.lastCalledVal;
            let actualName = MockOwner.lastCalledProp;

            assert.equal(expectedName, actualName);
            assert.equal(expectedVal, actualVal);
        });
    });

    describe('readOnly setting', () => {
        // TODO: Should calling setValue on a readOnly
        // property throw an error?
        before(() => {
            basicProp = new BasicProperty(
                'myProperty',
                "",
                true,
                ['myProp', 'someProp']
            );
        });
        it('#setValue should not set a value if readOnly is true', () => {
            let expected = ""; // the default value
            basicProp.setValue(MockOwner, 'new value!');
            let actual = basicProp.getValue(MockOwner);
            assert.equal(expected, actual);
        });
    });

    describe('Alias tests', () => {
        before(() => {
            basicProp = new BasicProperty(
                'myProperty',
                "",
                false,
                ['myProp', 'someProp']
            );
        });

        it('#hasAlias for correct aliases', () => {
            assert.isTrue(basicProp.hasAlias('myProp'));
            assert.isTrue(basicProp.hasAlias('someProp'));
        });

        it('#hasAlias for incorrect aliases', () => {
            assert.isFalse(basicProp.hasAlias('some-other-one'));
            assert.isFalse(basicProp.hasAlias('yet-another'));
        });

        it('#matchesNameOrAlias for correct alias', () => {
            assert.isTrue(basicProp.matchesNameOrAlias('myProp'));
            assert.isTrue(basicProp.matchesNameOrAlias('someProp'));
        });

        it('#matchesNameOrAlias for correct prop name', () => {
            assert.isTrue(basicProp.matchesNameOrAlias('myProperty'));
        });

        it('#matchesNameOrAlias for incorrect name/alias', () => {
            assert.isFalse(
                basicProp.matchesNameOrAlias(
                    'this-should-not-work'
                )
            )
        });
    });

    describe('Property Object matching tests', () => {
        before(() => {
            basicProp = new BasicProperty(
                'myProperty',
                "",
                false,
                ['myProp', 'someProp']
            );
        });

        it('#matches should match a property object with the same name', () => {
            let otherProp = new BasicProperty(
                'myProperty'
            );
            assert.isTrue(basicProp.matches(otherProp));
            assert.isTrue(otherProp.matches(basicProp));
        });

        it('#matches should match a property object with the same alias', () => {
            let otherProp = new BasicProperty(
                'myProperty2',
                "",
                false,
                ['myProp', 'anotherAlias']
            );

            assert.isTrue(basicProp.matches(otherProp));
            assert.isTrue(otherProp.matches(basicProp));
        });

        it('#matches doesnt match when two properties have diff names and no aliases', () => {
            let otherProp = new BasicProperty(
                'anotherProperty',
                "",
                false,
                [ 'does', 'not', 'match']
            );
            assert.isFalse(basicProp.matches(otherProp));
            assert.isFalse(otherProp.matches(basicProp));
        });
    });
});

describe('DynamicProperty tests', () => {
    let dynaProp;

    describe('Accessing tests', () => {
        before(() => {
            dynaProp = new DynamicProperty(
                'myProperty',

                // Dynamic Setter:
                function(owner, propObject, val){
                    owner.dynamicValue = val;
                },

                // Dynamic Getter:
                function(owner, propObject){
                    return owner.dynamicValue;
                },

                // readOnly
                false,

                // aliases
                [ 'myDynamicProperty', 'myProp', 'dynaProp']
            );
        });

        it('#getValue works using getter', () => {
            let myOwner = Object.create(MockOwner);
            myOwner.dynamicValue = 5;
            let expected = 5;
            let actual = dynaProp.getValue(myOwner);
            assert.equal(expected, actual);
        });

        it('#setValue works using setter', () => {
            let myOwner = Object.create(MockOwner);
            let expected = "hello";
            dynaProp.setValue(myOwner, "hello");
            let actual = myOwner.dynamicValue;
            assert.equal(expected, actual);
        });

        it('#setValue does not work / call setter when property is readOnly', () => {
            let myOwner = Object.create(MockOwner);
            myOwner.dynamicValue = -1;
            dynaProp.readOnly = true;
            dynaProp.setValue(myOwner, 2);

            let expected = -1;
            let actual = myOwner.dynamicValue;
            assert.equal(expected, actual);
        });
    });
});

describe('CustomProperty tests', () => {
    let customProp;
    let basic1;
    let basic2;

    describe('Accessing tests', () => {
        before(() => {
            customProp = new CustomProperty();
            basic1 = new BasicProperty("basic1", "1");
            basic2 = new BasicProperty("basic2", "2");
        });

        it('#add property', () => {
            customProp.add(basic1);
            customProp.add(basic2);
            assert.equal(2, Object.keys(customProp.getValue(Object())).length);
        });

        it('#find property', () => {
            assert.equal(basic1, customProp.find("basic1"));
        });

        it('#delete property', () => {
            customProp.delete(basic2);
            assert.equal(1, Object.keys(customProp.getValue(Object())).length);
        });
    });
});

describe('PartProperties tests', () => {
    let partProperties;
    let basicProp;
    let dynaProp;
    let customProp;
    let customBasic;

    describe('Adding, removing, presence checking', () => {
        before(() => {
            partProperties = new PartProperties();
            basicProp = new BasicProperty(
                'basicProp',
                2,
                false,
                ['basic', 'myBasicProp']
            );

            dynaProp = new DynamicProperty(
                'dynaProp',

                // Setter
                function(owner, val){
                    owner.dynamicValue = val;
                },
                // Getter
                function(owner){
                    return owner.dynamicValue;
                },
                false,
                ['myDynamicProperty', 'myDynaProp', 'dynamic']
            );
        });

        it('#addProperty adds the Property object (basic prop)', () => {
            partProperties.addProperty(basicProp);
            assert.include(partProperties._properties, basicProp);
        });

        it('#addProperty does not add the existing prop again (basic prop)', () => {
            partProperties.addProperty(basicProp);
            let foundInstances = partProperties._properties.filter(item => {
                return item == basicProp;
            });
            assert.lengthOf(foundInstances, 1);
        });

        it('#addProperty adds the Property object (dynamic prop)', () => {
            partProperties.addProperty(dynaProp);
            assert.include(partProperties._properties, dynaProp);
        });

        it('#addProperty does not add the existing prop again (dynamic prop)', () => {
            partProperties.addProperty(dynaProp);
            let foundInstances = partProperties._properties.filter(item => {
                return item == dynaProp;
            });
            assert.lengthOf(foundInstances, 1);
        });

        it('#hasProperty is true (basic prop)', () => {
            assert.isTrue(partProperties.hasProperty(basicProp));
        });

        it('#hasProperty is true (dynamic prop)', () => {
            assert.isTrue(partProperties.hasProperty(dynaProp));
        });

        it('#hasProperty is false for some un-added Property', () => {
            let newProp = new BasicProperty('foo', "");
            let hasProp = partProperties.hasProperty(newProp);
            assert.isFalse(hasProp);
        });
    });

    describe('Finding by name', () => {
        before(() => {
            partProperties = new PartProperties();
            basicProp = new BasicProperty(
                'basicProp',
                2,
                false,
                ['basic', 'myBasicProp']
            );

            dynaProp = new DynamicProperty(
                'dynaProp',

                // Setter
                function(owner, val){
                    owner.dynamicValue = val;
                },
                // Getter
                function(owner){
                    return owner.dynamicValue;
                },
                null,
                false,
                ['myDynamicProperty', 'myDynaProp', 'dynamic']
            );

            customProp = new CustomProperty();
            customBasic = new BasicProperty("custom-basic", 1);
            customProp.add(customBasic);

            // Add them in
            partProperties.addProperty(basicProp);
            partProperties.addProperty(dynaProp);
            partProperties.addProperty(customProp);
        });

        it('#findPropertyNamed can find prop by name (basic prop)', () => {
            let found = partProperties.findPropertyNamed('basicProp');
            assert.equal(found, basicProp);
        });

        it('#findPropertyNamed can find prop by alias (basic prop)', () => {
            let found = partProperties.findPropertyNamed('myBasicProp');
            assert.equal(found, basicProp);
        });

        it('#findPropertyNamed can find prop by name (dynamic prop)', () => {
            let found = partProperties.findPropertyNamed('dynaProp');
            assert.equal(found, dynaProp);
        });

        it('#findPropertyNamed can find prop by an alias (dynamic prop)', () => {
            let found = partProperties.findPropertyNamed('myDynaProp');
            assert.equal(found, dynaProp);
        });

        it('#findPropertyNamed can find prop (custom prop)', () => {
            let found = partProperties.findPropertyNamed('custom-basic');
            assert.equal(found, customBasic);
        });
        it('#findPropertynamed returns null for a name that doesnt match', () => {
            let found = partProperties.findPropertyNamed('should-not-exist');
            assert.isNull(found);
        });
    });

    describe('#getPropertyNamed (getting prop values by name)', () => {
        before(() => {
            partProperties = new PartProperties();
            basicProp = new BasicProperty(
                'basicProp',
                2,
                false,
                ['basic', 'myBasicProp']
            );

            dynaProp = new DynamicProperty(
                'dynaProp',

                // Setter
                function(owner, context, val){
                    owner.dynamicValue = val;
                },
                // Getter
                function(owner, context){
                    return owner.dynamicValue;
                },
                null,
                false,
                ['myDynamicProperty', 'myDynaProp', 'dynamic']
            );

            customProp = new CustomProperty();
            customBasic = new BasicProperty("custom-basic", 1);
            customProp.add(customBasic);

            // Add them in
            partProperties.addProperty(basicProp);
            partProperties.addProperty(dynaProp);
            partProperties.addProperty(customProp);
        });

        it('Can get the value by the prop name (basic prop)', () => {
            let myOwner = Object.create(MockOwner);
            basicProp._value = 6;
            let expected = 6;
            let actual = partProperties.getPropertyNamed(myOwner, 'basicProp');
            assert.equal(expected, actual);
        });

        it('Can get the value by the prop name (dynamic prop)', () => {
            let myOwner = Object.create(MockOwner);
            myOwner.dynamicValue = 6;
            let expected = 6;
            let actual = partProperties.getPropertyNamed(myOwner, 'dynaProp');
            assert.equal(expected, actual);
        });

        it('Can get the value by an alias name (basic prop)', () => {
            let myOwner = Object.create(MockOwner);
            basicProp._value = -1;
            let expected = -1;
            let actual = partProperties.getPropertyNamed(myOwner, 'myBasicProp');
            assert.equal(expected, actual);
        });

        it('Can get the value by name (custom prop)', () => {
            let myOwner = Object.create(MockOwner);
            basicProp._value = 1;
            let expected = 1;
            let actual = partProperties.getPropertyNamed(myOwner, 'custom-basic');
            assert.equal(expected, actual);
        });

        it('Can get the value by an alias name (dynamic prop)', () => {
            let myOwner = Object.create(MockOwner);
            myOwner.dynamicValue = -1;
            let expected = -1;
            let actual = partProperties.getPropertyNamed(myOwner, 'myDynaProp');
            assert.equal(expected, actual);
        });
    });

    describe('#setPropertyNamed (setting a prop by a name / alias)', () => {
        before(() => {
            partProperties = new PartProperties();
            basicProp = new BasicProperty(
                'basicProp',
                2,
                false,
                ['basic', 'myBasicProp']
            );

            dynaProp = new DynamicProperty(
                'dynaProp',

                // Setter
                function(owner, context, val){
                    owner.dynamicValue = val;
                },
                // Getter
                function(owner, context){
                    return owner.dynamicValue;
                },
                null,
                false,
                ['myDynamicProperty', 'myDynaProp', 'dynamic']
            );

            customProp = new CustomProperty();
            customBasic = new BasicProperty("custom-basic", 1);
            customProp.add(customBasic);

            // Add them in
            partProperties.addProperty(basicProp);
            partProperties.addProperty(dynaProp);
            partProperties.addProperty(customProp);
        });

        it('Sets the property by name (basic prop)', () => {
            let expected = 22;
            let myOwner = Object.create(MockOwner);
            partProperties.setPropertyNamed(myOwner, 'basicProp', 22);
            let actual = basicProp._value;

            assert.equal(expected, actual);
        });

        it('Sets the property by name (custom prop)', () => {
            let expected = "custom value";
            let myOwner = Object.create(MockOwner);
            partProperties.setPropertyNamed(myOwner, 'custom-basic', expected);
            let actual = customBasic._value;
            assert.equal(expected, actual);
        });

        it('Sets the property by name (dynamic prop)', () => {
            let expected = "hello there";
            let myOwner = Object.create(MockOwner);
            partProperties.setPropertyNamed(myOwner, 'dynaProp', "hello there");
            let actual = myOwner.dynamicValue;
            assert.equal(expected, actual);
        });

        it('Sets the property by alias (basic prop)', () => {
            let expected = "alias value";
            let myOwner = Object.create(MockOwner);
            partProperties.setPropertyNamed(myOwner, 'myBasicProp', expected);
            let actual = basicProp._value;
            assert.equal(expected, actual);
        });

        it('Sets the property by alias (dynamic prop)', () => {
            let expected = "another alias value";
            let myOwner = Object.create(MockOwner);
            partProperties.setPropertyNamed(myOwner, 'myDynaProp', expected);
            let actual = myOwner.dynamicValue;
            assert.equal(expected, actual);
        });
    });
});
