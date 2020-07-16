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
import {Part} from './Part.js';
import {
    BasicProperty
} from '../properties/PartProperties.js';

class Card extends Part {
    constructor(owner, name){
        if(owner.type != 'stack'){
            throw new Error(`Cards can only be parts of Stacks!`);
        }
        super(owner);

        // By default, a new Card's background
        // is the first Background in it's owner Stack.
        this.stack = this.owner;
        this.currentBackground = this.stack.partsCollection.getPartByTypeIndex(
            'background',
            1
        );

        this.isCard = true;

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

    // Override for delegation. Command messages
    // that are passed or otherwise not handled
    // by this card are delegated to the background
    delegateMessage(aMessage){
        this.sendMessage(
            aMessage,
            this.currentBackground
        );
    }
};

export {
    Card,
    Card as default
};
