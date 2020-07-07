/**
 * Card
 * --------------------------
 * I am a Card Part.
 * I represent a collection of Parts that is
 * displayed on the screen. My owner is always
 * a Stack Part.
 * I can contain any kind of Part, including
 * buttons and fields.
 */
import Part from './Part';
import {
    BasicProperty
} from '../properties/PartProperties';

class Card extends Part {
    constructor(owner, name){
        if(owner.type != 'stack'){
            throw new Error(`Cards can only be parts of Stacks!`);
        }
        super(owner);

        // Add Card-specific part
        // properties
        this.partProperties.newBasicProp(
            'marked',
            false
        );
        this.partProperties.newBasicProp(
            'cantDelete',
            false
        );
        this.partProperties.newBasicProp(
            'dontSearch',
            false
        );
        this.partProperties.newBasicProp(
            'showPict',
            false
        );

        // If we are initializing with a name
        // set the name property
        if(name){
            this.partProperties.setPropertyNamed(
                this,
                'name',
                name
            );
        }
    }

    get type(){
        return 'card';
    }
};

export {
    Card,
    Card as default
}
