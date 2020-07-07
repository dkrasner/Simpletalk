/**
 * Button
 * ----------------------------------
 * I am a Button Part.
 * My owner is always a Card.
 * I am a clickable point of interaction on a Card,
 * whose functionality can be customized by the author.
 */
import Part from './Part';
import {
    BasicProperty,
    DynamicProperty
} from '../properties/PartProperties';

class Button extends Part {
    constructor(owner, name){
        if(owner.type !== 'card'){
            throw new Error(`Buttons can only be parts of Cards!`);
        }
        super(owner);

        // If we are initializing with a name,
        // set the name part property
        if(name){
            this.partProperties.setPropertyNamed(
                this,
                'name',
                name
            );
        }

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
    }

    get type(){
        return 'button';
    }

    // Delegation override.
    // Buttons delegate passed or
    // untrapped command messages
    // to their owner card
    delegateCmd(commandName, arguments=[]){
        this.owner.receiveCmd(commandName, arguments);
    }
};

export {
    Button,
    Button as default
};
