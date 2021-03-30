/**
 * Field
 * -----------------------------------------
 * I am a Field Part.
 * I am a container that holds text. I also allow
 * a user to edit my text.
 */
import Part from './Part.js';
import {
    BasicProperty,
    DynamicProperty
} from '../properties/PartProperties.js';

import {
    addBasicStyleProps,
    addPositioningStyleProps,
    addTextStyleProps
} from '../utils/styleProperties.js';

class Field extends Part {
    constructor(owner, name){
        super(owner);

        this.isField = true;

        if(name){
            this.partProperties.setPropertyNamed(
                this,
                'name',
                name
            );
        }
        // some bs

        // Set the Field-specific
        // Part Properties
        this.partProperties.newBasicProp(
            'mode',
            'editing'
        );

        this.partProperties.newBasicProp(
            'htmlContent',
            ''
        );
        this.partProperties.newBasicProp(
            'textContent',
            ''
        );
        this.partProperties.newBasicProp(
            'autoSelect',
            false,
        );
        this.partProperties.newBasicProp(
            'autoTab',
            false
        );
        this.partProperties.newBasicProp(
            'lockText',
            false
        );
        this.partProperties.newBasicProp(
            'showLines',
            false
        );
        this.partProperties.newBasicProp(
            'dontWrap',
            false
        );
        this.partProperties.newBasicProp(
            'multipleLines',
            false
        );
        this.partProperties.newBasicProp(
            'scroll',
            0
        );
        this.partProperties.newBasicProp(
            'sharedText',
            false
        );
        this.partProperties.newBasicProp(
            'wideMargins',
            false
        );
        // Styling
        // setting width and height to null
        // effectively forces to the default size
        // of the button to fit the button name
        addBasicStyleProps(this);
        addPositioningStyleProps(this);
        addTextStyleProps(this);
        this.setupStyleProperties();
    }

    /**
     * Serialize this Field's state as JSON.
     * We override the default Part.js
     * implementation so that the textContent
     * property is not saved. This prevents it
     * from being set (rather than htmlContent)
     * on deserialization
     */
    serialize(){
        let ownerId = null;
        if(this._owner){
            ownerId = this._owner.id;
        }
        let result = {
            type: this.type,
            id: this.id,
            properties: {},
            subparts: this.subparts.map(subpart => {
                return subpart.id;
            }),
            ownerId: ownerId
        };
        this.partProperties._properties.forEach(prop => {
            let name = prop.name;
            if(name !== 'textContent'){
                let value = prop.getValue(this);
                // If this is the events set, transform
                // it to an Array first (for serialization)
                if(name == 'events'){
                    value = Array.from(value);
                }
                result.properties[name] = value;
            }
        });
        return result;
    }

    get type(){
        return 'field';
    }
};

export {
    Field,
    Field as default
};
