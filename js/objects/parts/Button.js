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
    constructor(owner){
        super(owner);

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
            true, // notify
            true  // set default
        );
        this.partProperties.setPropertyNamed(
            this,
            'corner-top-left-round',
            3,
            true, // notify
            true  // set default
        );
        this.partProperties.setPropertyNamed(
            this,
            'corner-top-right-round',
            3,
            true, // notify
            true  // set default
        );
        this.partProperties.setPropertyNamed(
            this,
            'corner-bottom-left-round',
            3,
            true, // notify
            true  // set default
        );
        this.partProperties.setPropertyNamed(
            this,
            'corner-bottom-right-round',
            3,
            true, // notify
            true  // set default
        );
        this.partProperties.setPropertyNamed(
            this,
            'border-top-width',
            1,
            true, // notify
            true  // set default
        );
        this.partProperties.setPropertyNamed(
            this,
            'border-bottom-width',
            1,
            true, // notify
            true  // set default
        );
        this.partProperties.setPropertyNamed(
            this,
            'border-left-width',
            1,
            true, // notify
            true  // set default
        );
        this.partProperties.setPropertyNamed(
            this,
            'border-right-width',
            1,
            true, // notify
            true  // set default
        );
        this.partProperties.setPropertyNamed(
            this,
            'shadow-left',
            1,
            true, // notify
            true  // set default
        );
        this.partProperties.setPropertyNamed(
            this,
            'shadow-top',
            1,
            true, // notify
            true  // set default
        );
        this.partProperties.setPropertyNamed(
            this,
            'shadow-blur',
            1,
            true, // notify
            true  // set default
        );
        this.partProperties.setPropertyNamed(
            this,
            'shadow-blur',
            1,
            true, // notify
            true  // set default
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
