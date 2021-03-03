/**
 * Button
 * ----------------------------------
 * I am a Button Part.
 * My owner is always a Card.
 * I am a clickable point of interaction on a Card,
 * whose functionality can be customized by the author.
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

class Button extends Part {
    constructor(owner, name){
        super(owner);

        // If we are initializing with a name,
        // set the name part property
        let myName = name || `Button ${this.id}`;
        this.partProperties.setPropertyNamed(
            this,
            'name',
            myName
        );

        // set up DOM events to be handled
        this.partProperties.setPropertyNamed(
            this,
            'events',
            new Set(['mousedown', 'mouseup', 'mouseenter', 'click', 'dragstart', 'dragend'])
        );

        this.isButton = true;

        // Add Button-specific part properties
        this.partProperties.newDynamicProp(
            'selectedText',
            null, // readOnly (for now)
            this.getSelectedText,
            true, // readOnly,
            [] // no aliases
        );

        // Styling
        addBasicStyleProps(this);
        this.partProperties.setPropertyNamed(
            this,
            'background-color',
            "rgba(255, 234, 149, 1)", // var(--palette-yellow)
        );
        addPositioningStyleProps(this);
        addTextStyleProps(this);
        this.setupStyleProperties();

    }

    get type(){
        return 'button';
    }

    //TODO: implement this property
    // getter for real
    getSelectedText(propName, propVal){
        return null;
    }
};

export {
    Button,
    Button as default
};
