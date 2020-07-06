/**
 * PropertyCollection
 * ------------------------------------
 * I represent a collection of properties for a
 * given Part.
 * I can lookup my properties by their names and
 * aliases.
 */
import './PartProperty';

class PropertyCollection {
    constructor(owner){

        // For now, just store as a
        // simple array. We can optimize
        // later
        this._properties = [];

        // Set the owner Part for this
        // collection
        this._owner = owner;

        // Bound methods
        this.getPropertyNamed = this.getPropertyNamed.bind(this);
        this.setPropertyNamed = this.setPropertyNamed.bind(this);
        this.hasPropertyNamed = this.hasPropertyNamed.bind(this);
        this.addProperty = this.addProperty.bind(this);
        this.removeProperty = this.removeProperty.bind(this);
        this.addNewProperty = this.addNewProperty.bind(this);
    }

    // Tries to get the *value* of the property
    // with the given name. Should throw an exception
    // if the property does not exist in this collection.
    // TODO: Figure out the specifics of these exceptions
    getPropertyNamed(aName){
        for(let i = 0; i < this._properties.length; i++){
            let prop = this._properties[i];
            if(prop.hasName(aName)){
                return prop.getValue(this._owner);
            }
        }
        throw new Error(`Unknown property: ${aName}`);
    }

    // Tries to set the *value* of the property with
    // the given name. Should throw an exception
    // if the property does not exist in this collection.
    setPropertyNamed(aName, aValue){
        for(let i = 0; i < this._properties.length; i++){
            let prop = this._properties[i];
            if(prop.hasName(aName)){
                return prop.setValue(this._owner, aValue);
            }
        }
        throw new Error(`Unknown property: ${aName}`);
    }

    // Returns true if this collection has
    // a property with the given name
    hasPropertyNamed(aName){
        for(let i = 0; i < this._properties.length; i++){
            let prop = this._properties[i];
            if(prop.hasName(aName)){
                return true;
            }
        }
        return false;
    }

    // Adds a PartProperty instance to this collection
    // of properties.
    addProperty(aPartProperty){
        // Note: if the property already exists,
        // we "overwrite" it
        let existingProperty = null;
        for(let i = 0; i < this._properties.length; i++){
            let prop = this._properties[i];

            // Properties are equal if only their
            // names are equal.
            if(prop.name == aPartProperty.name){
                existingProperty = prop;
            }
        }

        if(existingProperty){
            this.removeProperty(existingProperty);
        }

        this.properties.push(aPartProperty);
    }

    // Removes a PartProperty instance from this collection
    // of properties. Note that no error is thrown if the
    // property is not present. We just continue life as
    // if nothing happened.
    removeProperty(aPartProperty){
        let foundIndex = -1;
        for(let i = 0; i < this._properties.length; i++){
            let prop = this._properties[i];

            // Properties are considered equal if
            // only their names are equal
            if(prop.name == aPartProperty.name){
                foundIndex = i;
                break;
            }
        }
        if(foundIndex >= 0){
            this._properties.splice(foundIndex, 1);
        }
    }

    // Creates a new PartProperty with the
    // given name/alias list and value, then
    // adds that property to this collection's
    // set of properties.
    addNewProperty(aNameOrAliasList, value){
        let newProperty = PartProperty.define(aNameOrAliasList, value);
        return this.addProperty(newProperty);
    }
};

export {
    PropertyCollection,
    PropertyCollection as default
};
