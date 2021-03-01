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

        this.acceptedSubpartTypes = ["field"];

        this.isField = true;

        if(name){
            this.partProperties.setPropertyNamed(
                this,
                'name',
                name
            );
        }

        // Set the Field-specific
        // Part Properties
        this.partProperties.newBasicProp(
            'mode',
            'editing' //TODO this should be either "bravo" or "simpletalk"
        );

        this.partProperties.newBasicProp(
            'htmlContent',
            ''
        );
        this.partProperties.newBasicProp(
            'textContent',
            ''
        );
        // TODO this should replace mode
        this.partProperties.newBasicProp(
            'lockText',
            false
        );
        // A number of the props deal with direct text editing,
        // and so they are like commands. Examples include "undo"
        // "redo" "clear" etc. Here we use dynami props which the
        // view can respond to accordingly, but having these props have
        // no actual 'state'
        this.partProperties.newDynamicProp(
            "undo",
            () => {}, // all we is a notification
            () => {} // no getter
        );
        this.partProperties.newDynamicProp(
            "redo",
            () => {}, // all we is a notification
            () => {} // no getter
        );
        this.partProperties.newDynamicProp(
            "remove-format",
            () => {}, // all we is a notification
            () => {} // no getter
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
