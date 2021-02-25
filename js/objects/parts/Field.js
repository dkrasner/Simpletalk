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
        this.partProperties.newStyleProp(
            'rotate',
            null
        );
        this.partProperties.newStyleProp(
            'hide',
            false,
        );
        this.partProperties.newStyleProp(
            'transparency',
            1.0,
        );
        this.partProperties.newStyleProp(
            'text-transparency',
            1.0,
        );
        this.partProperties.newStyleProp(
            'text-font',
            'default',
        );
        this.partProperties.newStyleProp(
            'background-color',
            "rgb(255, 248, 220, 1)", // var(--palette-cornsik)
        );
        this.partProperties.newStyleProp(
            'background-transparency',
            1.0,
        );
        this.partProperties.newStyleProp(
            'text-color',
            "rgba(0, 0, 0, 1)",
        );
        this.setupStyleProperties();
    }

    get type(){
        return 'field';
    }
};

export {
    Field,
    Field as default
};
