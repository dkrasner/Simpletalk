/**
 * Stack
 * ----------------------------
 * I am the Stack Part.
 * I represent a collection of Card parts,
 * along with some extra configurability.
 */
import Part from './Part.js';
import Card from './Card.js';
import {
    BasicProperty
} from '../properties/PartProperties.js';

class Stack extends Part {
    constructor(owner, name, deserializing=false){
        super(owner);
        this.acceptedSubpartTypes = ["card", "background", "window", "button", "container"];

        // Set up Stack specific
        // PartProperties
        this.partProperties.newBasicProp(
            'cantPeek',
            false
        );
        this.partProperties.newBasicProp(
            'resizable',
            false
        );

        this._current = false;
        this.partProperties.newDynamicProp(
            'current',
            this.setCurrent,
            function(){
                return this._current;
            }
        );

        // If we are initializing with a name,
        // set the name property
        if(name){
            this.partProperties.setPropertyNamed(
                this,
                'name',
                name
            );
        }

        // Bind stack navigation methods
        this.goToNextCard = this.goToNextCard.bind(this);
        this.goToPrevCard = this.goToPrevCard.bind(this);
        this.goToCardById = this.goToCardById.bind(this);
        this.goToNthCard = this.goToNthCard.bind(this);
    }

    goToNextCard(){
        let cards = this.subparts.filter(subpart => {
            return subpart.type == 'card';
        });
        if(cards.length < 2){
            return;
        }
        let current = cards.find(card => {
            return card._current == true;
        });
        let currentIdx = cards.indexOf(current);
        let nextIdx = currentIdx + 1;
        if(nextIdx >= cards.length){
            nextIdx = (nextIdx % cards.length);
        }
        let nextCard = cards[nextIdx];
        nextCard.partProperties.setPropertyNamed(
            nextCard,
            'current',
            true
        );
    }

    goToCardById(anId){
        let cards = this.subparts.filter(subpart => {
            return subpart.type == 'card';
        });
        let found = cards.find(card => {
            return card.id == anId;
        });
        if(!found){
            throw new Error(`The card id: ${anId} cant be found on this stack`);
        }
        found.partProperties.setPropertyNamed(
            found,
            'current',
            true
        );
    }

    goToPrevCard(){
        let cards = this.subparts.filter(subpart => {
            return subpart.type == 'card';
        });
        if(cards.length < 2){
            return;
        }
        let current = cards.find(card => {
            return card._current == true;
        });
        let currentIdx = cards.indexOf(current);
        let nextIdx = currentIdx - 1;
        if(nextIdx < 0){
            nextIdx = cards.length + nextIdx;
        }
        let nextCard = cards[nextIdx];
        nextCard.partProperties.setPropertyNamed(
            nextCard,
            'current',
            true
        );
    }

    goToNthCard(anIndex){
        // NOTE: We are using 1-indexed values
        // per the SimpleTalk system
        let trueIndex = anIndex - 1;
        let cards = this.subparts.filter(subpart => {
            return subpart.type == 'card';
        });
        if(trueIndex < 0 || trueIndex > cards.length -1){
            console.warn(`Cannot navigate to card number ${anIndex} -- out of bounds`);
            return;
        }
        let nextCard = cards[trueIndex];
        nextCard.partProperties.setPropertyNamed(
            nextCard,
            'current',
            true
        );
    }

    setCurrent(propOwner, property, value){
        // There are two types of Stacks:
        // those in a WorldStack and those in
        // a Window.
        // If we are setting this Stack to be the
        // current in its owner, we need to unset
        // all of the others. Otherwise, simply
        // unset
        if(value == false){
            propOwner._current = false;
        } else {
            propOwner._owner.subparts.filter(subpart => {
                return subpart.type == 'stack';
            }).forEach(siblingStack => {
                siblingStack.partProperties.setPropertyNamed(
                    siblingStack,
                    'current',
                    false
                );
            });
            propOwner._current = true;
        }
    }

    get type(){
        return 'stack';
    }
};

export {
    Stack,
    Stack as default
};
