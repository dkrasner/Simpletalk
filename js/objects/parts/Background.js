/**
 * Background
 * ------------------------------------
 * I am a Card-like part that represents a
 * background layer for a given card.
 * My direct owner is always a Stack.
 * Stacks can contain several Background parts.
 * Cards in a Stack pick which Background in the Stack
 * they wish to use. By default, Stacks are created with
 * a "blank" first Background, and any new Cards in
 * the Stack will be set to use this first Background.
 * I have all the capabilities of a Card.
 * In terms of message delegation, all Card Parts
 * delegate to the (current) Background they have.
 * I then delegate to the Stack that is my owner.
 */
import Card from './Card.js';

class Background extends Card {
    constructor(owner, name){
        super(owner, name);

        this.isBackground = true;
    }

    // Delegation override.
    // I pass any untrapped command
    // messages to my parent Stack
    delegateMessage(aMessage){
        this.sendMessage(
            aMessage,
            this._owner
        );
    }

    get type(){
        return 'background';
    }
};

export {
    Background,
    Background as default
};
