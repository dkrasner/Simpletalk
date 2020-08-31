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
        super(owner);
        this.stack = this._owner;
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
    /*delegateMessage(aMessage){
        this.sendMessage(
            aMessage,
            this.currentBackground
        );
        }*/
    // For the time being, send directly to
    // the Card owner and not the background.
    delegateMessage(aMessage){
        this.sendMessage(
            aMessage,
            this._owner
        );
    }

    // Override the subpart validity check
    checkSubpartValidity(aPart){
        if([
            'world',
            'stack',
            'card',
            'background',
            'window'
        ].includes(aPart.type)){
            return false;
        }
        return true;
    }
};

export {
    Card,
    Card as default
};
