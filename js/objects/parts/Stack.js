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


        // Will hold the card-based index,
        // which here is zero-indexed, of the
        // card that is the current card for this
        // Stack.
        this.partProperties.newBasicProp(
            'current',
            0
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
        let currentIdx = this.partProperties.getPropertyNamed(
            this,
            'current'
        );
        let nextIdx = currentIdx + 1;
        if(nextIdx >= cards.length){
            nextIdx = (nextIdx % cards.length);
        }
        this.partProperties.setPropertyNamed(
            this,
            'current',
            nextIdx
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
        let cardIdx = cards.indexOf(found);
        this.partProperties.setPropertyNamed(
            this,
            'current',
            cardIdx
        );
    }

    goToPrevCard(){
        let cards = this.subparts.filter(subpart => {
            return subpart.type == 'card';
        });
        if(cards.length < 2){
            return;
        }
        let currentIdx = this.partProperties.getPropertyNamed(
            this,
            'current'
        );
        let nextIdx = currentIdx - 1;
        if(nextIdx < 0){
            nextIdx = cards.length + nextIdx;
        }
        this.partProperties.setPropertyNamed(
            this,
            'current',
            nextIdx
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
        this.partProperties.setPropertyNamed(
            this,
            'current',
            trueIndex
        );
    }

    get type(){
        return 'stack';
    }
};

export {
    Stack,
    Stack as default
};
