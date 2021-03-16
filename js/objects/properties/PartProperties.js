import cssStyler from '../utils//styler.js';

/**
 * PartProperties
 * ------------------------------------
 * I am an object representing the base
 * Part Properties for all Parts.
 * I also include some convenience methods
 * on my prototype that should be used by
 * other Parts when they inherit from me.
 * For now, we use Object.create() for inheritance.
 */

class BasicProperty {
    constructor(name, defaultValue, readOnly=false, aliases=[]){
        this.name = name;
        this._value = defaultValue;
        this.readOnly = readOnly;
        this.aliases = aliases;

        // Bound methods
        this.getValue = this.getValue.bind(this);
        this.setValue = this.setValue.bind(this);
        this.hasAlias = this.hasAlias.bind(this);
        this.matches = this.matches.bind(this);
        this.matchesNameOrAlias = this.matchesNameOrAlias.bind(this);
    }

    // For basic properties, we return
    // the set/stored value
    getValue(owner){
        return this._value;
    }

    // For the basic properties, we set
    // based on the incoming desired value
    // alone (nothing is computed)
    setValue(owner, val, notify=true){
        if(!this.readOnly){
            this._value = val;
            if(notify){
                owner.propertyChanged(
                    this.name,
                    val
                );
            }
        }
    }

    // Returns true if this property
    // goes by the given alias
    hasAlias(anAlias){
        return this.aliases.includes(anAlias);
    }

    // Returns true if the given name is
    // either an alias or the exact name
    // for this property
    matchesNameOrAlias(aNameOrAlias){
        if(this.hasAlias(aNameOrAlias)){
            return true;
        } else if(aNameOrAlias == this.name){
            return true;
        }
        return false;
    }

    // Returns true if the incoming Property
    // has the same name and/or one of the same
    // aliases as this Property
    matches(aProperty){
        if(aProperty.name == this.name){
            return true;
        } else {
            for(let i = 0; i < this.aliases.length; i++){
                let myAlias = this.aliases[i];
                if(aProperty.hasAlias(myAlias)){
                    return true;
                }
            }
        }
        return false;
    }
};

class DynamicProperty extends BasicProperty {
    constructor(name, setter, getter, readOnly=false, defaultValue=null, aliases=[]){
        super(name, defaultValue, readOnly, aliases);
        this.valueSetter = setter;
        this.valueGetter = getter;
    }

    // In this override, we use the getter
    // if available, to dynamically get the
    // incoming value.
    getValue(owner){
        return this.valueGetter(owner, this);
    }

    // In this override, we use the setter
    // if available, to dynamically set the
    // incoming value
    setValue(owner, val, notify=true){
        if(!this.readOnly){
            this.valueSetter(owner, this, val, notify);
            if(notify){
                owner.propertyChanged(
                    this.name,
                    val
                );
            }
        }
    }
};


/** I am a special property which handles interfacing with the
  * the cssStyle basic property. Whenever I am updated I make
  * sure to update the cssStyle property via the styler utility
  * function. I can be used to create different and indepent
  * styling options.
  **/
class StyleProperty extends BasicProperty {
    constructor(name, defaultValue,  styler=cssStyler, readOnly=false, aliases=[]){
        super(name, defaultValue, readOnly, aliases);
        this.styler = styler;
    }

    // In this override, we update the cssStyle property
    setValue(owner, val, notify=true){
        if(!this.readOnly){
            let styleProperty = owner.partProperties.findPropertyNamed("cssStyle");
            let style = styleProperty.getValue(owner);
            let newStyle = this.styler(style, this.name, val);
            styleProperty.setValue(owner, newStyle, notify);

            // set my value as well
            this._value = val;
            if(notify){
                owner.propertyChanged(
                    this.name,
                    val
                );
            }
        }
    }
};

class PartProperties {
    constructor(){
        this._properties = [];

        // Bound methods
        this.hasProperty = this.hasProperty.bind(this);
        this.addProperty = this.addProperty.bind(this);
        this.removeProperty = this.removeProperty.bind(this);
        this.findPropertyNamed = this.findPropertyNamed.bind(this);
        this.setPropertyNamed = this.setPropertyNamed.bind(this);
        this.getPropertyNamed = this.getPropertyNamed.bind(this);
        this.newBasicProp = this.newBasicProp.bind(this);
        this.newStyleProp = this.newStyleProp.bind(this);
        this.newDynamicProp = this.newDynamicProp.bind(this);
        this._indexOfProperty = this._indexOfProperty.bind(this);
    }

    // This collection 'has' a property if it contains
    // a Property object with matching name or alias
    // of the incoming property.
    hasProperty(aProperty){
        for(let i = 0; i < this._properties.length; i++){
            let prop = this._properties[i];
            if(aProperty.matches(prop)){
                return true;
            }
        }
        return false;
    }

    // Find one of my Properties by
    // a name or alias. Returns null
    // if no match found. Perhaps we should
    // throw an error
    findPropertyNamed(aName){
        for(let i = 0; i < this._properties.length; i++){
            let prop = this._properties[i];
            if(prop.matchesNameOrAlias(aName)){
                return prop;
            }
        }
        return null;
    }

    // Attempts to get the *value* of the property
    // with the given name or alias.
    // If the property is not found, we throw an
    // error
    getPropertyNamed(owner, aName){
        let found = this.findPropertyNamed(aName);
        if(!found){
            throw new Error(`${owner} does not have property "${aName}"`);
        }
        return found.getValue(owner);
    }

    // Attempts to set the *value* of the property
    // with the given name or alias.
    // If the property is not found, we throw an
    // error
    setPropertyNamed(owner, aName, aValue, notify=true){
        let found = this.findPropertyNamed(aName);
        if(!found){
            throw new Error(`${owner} does not have property "${aName}"`);
        }
        return found.setValue(owner, aValue, notify);
    }

    // If you add a property with a name or alias
    // that is already present in the collection,
    // then we 'overwrite' it by removing the exising
    // property and replacing it with the incoming one.
    // Otherwise, we just add the property
    addProperty(aProperty){
        if(this.hasProperty(aProperty)){
            this.removeProperty(aProperty);
        }
        this._properties.push(aProperty);
    }

    // Removing a property here means removing
    // it from the stored array. If the property
    // is not in the array, we do NOT throw an error.
    // We just go on with our lives, because who cares?
    removeProperty(aProperty){
        let propIndex = this._indexOfProperty(aProperty);
        if(propIndex >= 0){
            this._properties.splice(propIndex, 1);

        }
    }

    // Convenience method for creating a new basic
    // property.
    newBasicProp(...args){
        let newProp = new BasicProperty(...args);
        this.addProperty(newProp);
    }

    // Convenience method for creating a new style 
    // property.
    newStyleProp(...args){
        let newProp = new StyleProperty(...args);
        this.addProperty(newProp);
    }

    // Convenience method for creating a new
    // dynamic prop
    newDynamicProp(...args){
        let newProp = new DynamicProperty(...args);
        this.addProperty(newProp);
    }

    // Private method. Finds the first occurring
    // index of the given Property in the array
    // of properties in this collection. Returns
    // -1 if not found, per JS implementation.
    _indexOfProperty(aProperty){
        for(let i = 0; this._properties.length; i++){
            let prop = this._properties[i];
            if(aProperty.matches(prop)){
                return i;
            }
        }
        return -1;
    }
};

export {
    PartProperties,
    BasicProperty,
    DynamicProperty,
    PartProperties as default
};
