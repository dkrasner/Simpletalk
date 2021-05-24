/**
 * ButtonEditor
 * ----------------------------------
 * I am a ButtonEditor Part.
 * My owner is always a Card.
 * I am a clickable point of interaction on a Card,
 * whose functionality can be customized by the author.
 */
import Part from '../Part.js';
import {
    BasicProperty,
    DynamicProperty
} from '../../properties/PartProperties.js';

class ButtonEditor extends Part {
    constructor(owner, name){
        super(owner);

        this.acceptedSubpartTypes = [
            "field"
        ];

        // If we are initializing with a name,
        // set the name part property
        let myName = name || `ButtonEditor ${this.id}`;
        this.partProperties.setPropertyNamed(
            this,
            'name',
            myName
        );

        this.partProperties.newBasicProp(
            'targetId',
            null 
        );

        this.isButtonEditor = true;

        // Add ButtonEditor-specific part properties
    }

    get type(){
        return 'button-editor';
    }

};

export {
    ButtonEditor,
    ButtonEditor as default
};
