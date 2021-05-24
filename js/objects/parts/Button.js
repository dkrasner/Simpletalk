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

        this.isButton = true;

        // Add Button-specific part properties
        this.partProperties.newDynamicProp(
            'selectedText',
            null, // readOnly (for now)
            this.getSelectedText,
            true, // readOnly,
        );

        // Styling
        addBasicStyleProps(this);
        addPositioningStyleProps(this);
        addTextStyleProps(this);
        this.setupStyleProperties();
        // part specific default style properties
        this.partProperties.setPropertyNamed(
            this,
            'background-color',
            "rgb(255, 234, 149)", // var(--palette-yellow)
        );
        this.partProperties.setPropertyNamed(
            this,
            'corner-top-left-round',
            3
        );
        this.partProperties.setPropertyNamed(
            this,
            'corner-top-right-round',
            3
        );
        this.partProperties.setPropertyNamed(
            this,
            'corner-bottom-left-round',
            3
        );
        this.partProperties.setPropertyNamed(
            this,
            'corner-bottom-right-round',
            3
        );
        this.partProperties.setPropertyNamed(
            this,
            'border-top-width',
            1
        );
        this.partProperties.setPropertyNamed(
            this,
            'border-bottom-width',
            1
        );
        this.partProperties.setPropertyNamed(
            this,
            'border-left-width',
            1
        );
        this.partProperties.setPropertyNamed(
            this,
            'border-right-width',
            1
        );
        this.partProperties.setPropertyNamed(
            this,
            'shadow-left',
            1
        );
        this.partProperties.setPropertyNamed(
            this,
            'shadow-top',
            1
        );
        this.partProperties.setPropertyNamed(
            this,
            'shadow-blur',
            1
        );
        this.partProperties.setPropertyNamed(
            this,
            'shadow-blur',
            1
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
