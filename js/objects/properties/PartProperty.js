/**
 * PartProperty
 * -------------------------------
 * I represent the class of all Properties
 * of a given Part.
 * Properties can have a list of known
 * aliases, the first of which is their
 * primary name.
 */
class PartProperty(){
    constructor(name, defaultValue, readOnly=false){
        this.aliases = [];
        if(name){
            this.aliases.push(name);
        }
        if(defaultValue){
            this.setValue(defaultValue);
        } else {
            // By default all non-set values
            // will be null.
            this.setValue(null);
        }

        if(readOnly){
            this.readOnly = true;
        } else {
            this.readOnly = false;
        }

        // Bound methods
        this.setValue = this.setValue.bind(this);
        this.getValue = this.getValue.bind(this);
        this.hasName = this.hasName.bind(this);
        this.addAlias = this.addAlias.bind(this);

    }

    // Attempts to set the value for this
    // property to the given object.
    // Note that certain types of property
    // might want to restrict themselves
    // to certain types, etc.
    setValue(ownerContext, anObject){
        this._value = anObject;
    }

    // Attempts to retrieve the value
    // for this property.
    // Descendants may wish to override.
    getValue(ownerContext){
        return this._value;
    }

    // Returns true if and only if
    // the given name is in this
    // property's list of name aliases
    hasName(aName){
        if(this.aliases.indexOf(aName)){
            return true;
        }
        return false;
    }

    // Adds a name to the alias list, so
    // long as it is not already present
    addAlias(aName){
        if(!this.hasName(aName)){
            this.aliases.push(aName);
        }
    }

    get name(){
        return this.aliases[0];
    }
};

PartProperty.define = (aNameOrList, value, readOnly=false) => {
    var newProperty;
    if(Array.isArray(aNameOrList)){
        newProperty = new PartProperty(aNameOrList[0], value);
        aNameOrList.forEach(alias => {
            newProperty.addAlias(alias);
        });
    } else {
        newProperty = new PartProperty(aNameOrList, value);
    }
    return newProperty;
}

export {
    PartProperty,
    PartProperty as default
};
