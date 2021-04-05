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
            'innerHTML',
            ''
        );

        this.partProperties.newBasicProp(
            'targetRangeId',
            null
        );

        // 'text' is a DynamicProperty configured to also set the innerHTML
        // BasicProperty when changed. The basic idea is that 'text' will be
        // the property that ST will interface with and everytime it
        // is changed the 'innerHTML' property should follow.
        this.partProperties.newDynamicProp(
            'text',
            (owner, prop, value, notify) => {
                prop._value = value;
                if(notify){
                    owner.partProperties.setPropertyNamed(owner, 'innerHTML', value, notify);
                }
            },
            (owner, prop) => {
                return prop._value;
            },
            false, // not read only
            ''     // default is empty string
        );

        this.partProperties.newBasicProp(
            'editable',
            true
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
        // part specific default style properties
        this.partProperties.setPropertyNamed(
            this,
            'background-color',
            "rgb(255, 248, 220)", // var(--palette-cornsik)
        );

        // Private command handlers

        this.insertRange = this.insertRange.bind(this);
        this.setPrivateCommandHandler("insertRange", this.insertRange);
    }

    insertRange(senders, rangeId, html, css){
        window.System.findViewsById(this.id).forEach((view) => {
            view.insertRange(rangeId, html, css);
        });
    }

    get type(){
        return 'field';
    }
};

export {
    Field,
    Field as default
};
