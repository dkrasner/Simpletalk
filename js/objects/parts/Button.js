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
        this.partProperties.newStyleProp(
            'text-align',
            'center',
        );
        this.partProperties.newStyleProp(
            'text-font',
            'default',
        );
        this.partProperties.newStyleProp(
            'background-color',
            null,
        );
        this.partProperties.newStyleProp(
            'text-color',
            null,
        );
        this.partProperties.newStyleProp(
            'text-style',
            'plain',
        );
        this.partProperties.newStyleProp(
            'name-visible',
            true,
        );
        this.partProperties.newStyleProp(
            'visible',
            true,
        );
        // setting width and height to null
        // effectively forces to the default size
        // of the button to fit the button name
        this.partProperties.newStyleProp(
            'width',
            null,
        );
        this.partProperties.newStyleProp(
            'height',
            null,
        );
        this.partProperties.newStyleProp(
            'top',
            "0",
        );
        this.partProperties.newStyleProp(
            'left',
            "0",
        );
        // TODO tbd props
        this.partProperties.newBasicProp(
            'autoHilite',
            true
        );
        this.partProperties.newBasicProp(
            'draggable',
            true
        );
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
