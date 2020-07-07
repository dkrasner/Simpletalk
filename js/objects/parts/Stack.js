/**
 * Stack
 * ----------------------------
 * I am the Stack Part.
 * I represent a collection of Card parts,
 * along with some extra configurability.
 */
import Part from './Part';
import Card from './Card';
import Background from './Background';
import {
    BasicProperty
} from '../properties/PartProperties';

class Stack extends Part {
    constructor(owner, name){
        super(owner);

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

        // If we are initializing with a name,
        // set the name property
        if(name){
            this.partProperties.setPropertyNamed(
                this,
                'name',
                name
            );
        }

        // We construct with an initial
        // Background part, since there needs
        // to be at least one
        let initBackground = new Background(this);
        this.partsCollection.addPart(
            initBackground
        );

        // We create an initial Card, then
        // set that to the current card.
        this.currentCard = this.newCard();
        this.currentCardIndex = this.currentCard.numberInOwner();

        // Bound methods
        this.newCard = this.newCard.bind(this);
    }


    newCard(cardName){
        let card = new Card(this, cardName);
        this.partsCollection.addPart(card);
    }

    get type(){
        return 'stack';
    }
};

export {
    Stack,
    Stack as default
};
