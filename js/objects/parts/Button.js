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


        this.isButton = true;

        // Add Button-specific part properties
        this.partProperties.newDynamicProp(
            'selectedText',
            null, // readOnly (for now)
            this.getSelectedText,
            true, // readOnly,
            [] // no aliases
        );

        this.partProperties.newBasicProp(
            'style',
            'normal'
        );
        this.partProperties.newBasicProp(
            'textAlign',
            'center'
        );
        this.partProperties.newBasicProp(
            'textFont',
            'default'
        );
        this.partProperties.newBasicProp(
            'textStyle',
            'plain'
        );
        this.partProperties.newBasicProp(
            'visible',
            true
        );
        this.partProperties.newBasicProp(
            'autoHilite',
            true
        );
        this.partProperties.newBasicProp(
            'hilite',
            false
        );
        this.partProperties.newBasicProp(
            'iconAlign',
            'center'
        );
        this.partProperties.newBasicProp(
            'showName',
            true
        );
        this.partProperties.newBasicProp(
            'draggable',
            true
        );
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
