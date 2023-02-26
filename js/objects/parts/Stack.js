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
        this.acceptedSubpartTypes = [
            "card", "window", "button", "area", "field",
            "drawing", "image", "audio", "video", "browser"
        ];

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
            null
        );

        // Bind general methods
        this.sendOpenCardTo = this.sendOpenCardTo.bind(this);
        this.sendCloseCardTo = this.sendCloseCardTo.bind(this);

        // Bind stack navigation methods
        this.goToNextCard = this.goToNextCard.bind(this);
        this.goToPrevCard = this.goToPrevCard.bind(this);
        this.goToCardById = this.goToCardById.bind(this);
        this.goToNthCard = this.goToNthCard.bind(this);

        // remove the halo property and command handlers as these do not makes sense here
        let haloOpenProp = this.partProperties.findPropertyNamed("halo-open");
        if(haloOpenProp){
            this.partProperties.removeProperty(haloOpenProp);
        }
        this.removePrivateCommandHandler("openHalo");
        this.removePrivateCommandHandler("closeHalo");
    }

    goToNextCard(){
        let cards = this.subparts.filter(subpart => {
            return subpart.type == 'card';
        });
        if(cards.length < 2){
            return;
        }
        let currentCardId = this.currentCardId;
        let currentCard = this.currentCard;
        let currentIdx = cards.indexOf(currentCard);
        let nextIdx = currentIdx + 1;
        if(nextIdx >= cards.length){
            nextIdx = (nextIdx % cards.length);
        }
        let nextCard = cards[nextIdx];
        this.partProperties.setPropertyNamed(
            this,
            'current',
            nextCard.id
        );
        if(currentCardId != nextCard.id){
            this.sendCloseCardTo(currentCard);
            this.sendOpenCardTo(nextCard);
        }
    }

    goToCardById(anId){
        let currentCardId = this.currentCardId;
        let currentCard = this.currentCard;
        let cards = Object.values(window.System.partsById).filter((part) => {
            return part.type == "card";
        });
        let nextCard = cards.find(card => {
            return card.id == anId;
        });
        if(!nextCard){
            throw new Error(`The card id: ${anId} cant be found stack`);
        }
        // if the card is not on this stack we should go to the corresponding stack
        if(nextCard._owner != this){
            this._owner.goToStackById(nextCard._owner.id);
        }
        nextCard._owner.partProperties.setPropertyNamed(
            nextCard._owner,
            'current',
            nextCard.id
        );
        if(currentCardId != nextCard.id){
            this.sendCloseCardTo(currentCard);
            this.sendOpenCardTo(nextCard);
        }
    }

    goToPrevCard(){
        let cards = this.subparts.filter(subpart => {
            return subpart.type == 'card';
        });
        if(cards.length < 2){
            return;
        }
        let currentCardId = this.currentCardId;
        let currentCard = this.currentCard;
        let currentIdx = cards.indexOf(currentCard);

        let nextIdx = currentIdx - 1;
        if(nextIdx < 0){
            nextIdx = cards.length + nextIdx;
        }
        let nextCard = cards[nextIdx];
        this.partProperties.setPropertyNamed(
            this,
            'current',
            nextCard.id
        );
        if(currentCardId != nextCard.id){
            this.sendCloseCardTo(currentCard);
            this.sendOpenCardTo(nextCard);
        }
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
        let currentCardId = this.currentCardId;
        let currentCard = this.currentCard;
        let nextCard = cards[trueIndex];
        this.partProperties.setPropertyNamed(
            this,
            'current',
           nextCard.id
        );
        if(currentCardId != nextCard.id){
            this.sendCloseCardTo(currentCard);
            this.sendOpenCardTo(nextCard);
        }
    }

    sendCloseCardTo(aCard){
        this.sendMessage(
            {
                type: 'command',
                commandName: 'closeCard',
                args: [],
                shouldIgnore: true
            },
            aCard
        );
    }

    sendOpenCardTo(aCard){
        this.sendMessage(
            {
                type: 'command',
                commandName: 'openCard',
                args: [],
                shouldIgnore: true
            },
            aCard
        );
    }

    get type(){
        return 'stack';
    }

    get currentCardId(){
        return this.partProperties.getPropertyNamed(
            this,
            'current'
        );
    }

    get currentCard(){
        return window.System.partsById[this.currentCardId];
    }

    // override the base class methods
    moveSubpartDown(part){
        let currentIndex = this.subparts.indexOf(part);
        let lastValidPartIndex = this.subparts.length - 1;
        if(part.type == "card"){
            let allCards = this.subparts.filter((part) => {
                return part.type == "card";
            });
            lastValidPartIndex = allCards.length - 1;
        }
        if(currentIndex < lastValidPartIndex){
            this.subpartOrderChanged(part.id, currentIndex, currentIndex + 1);
        }
    }

    moveSubpartToLast(part){
        let currentIndex = this.subparts.indexOf(part);
        let lastValidPartIndex = this.subparts.length - 1;
        if(part.type == "card"){
            let allCards = this.subparts.filter((part) => {
                return part.type == "card";
            });
            lastValidPartIndex = allCards.length - 1;
        }
        if(currentIndex < lastValidPartIndex){
            this.subpartOrderChanged(part.id, currentIndex, lastValidPartIndex);
        }
    }

    moveSubpartUp(part){
        let currentIndex = this.subparts.indexOf(part);
        let firstValidPartIndex = 0;
        if(part.type != "card"){
            let allCards = this.subparts.filter((part) => {
                return part.type == "card";
            });
            firstValidPartIndex = allCards.length;
        }
        if(currentIndex > firstValidPartIndex){
            this.subpartOrderChanged(part.id, currentIndex, currentIndex - 1);
        }
    }

    moveSubpartToFirst(part){
        let currentIndex = this.subparts.indexOf(part);
        let firstValidPartIndex = 0;
        if(part.type != "card"){
            let allCards = this.subparts.filter((part) => {
                return part.type == "card";
            });
            firstValidPartIndex = allCards.length;
        }
        if(currentIndex > firstValidPartIndex){
            this.subpartOrderChanged(part.id, currentIndex, firstValidPartIndex);
        }
    }

    addPart(aPart){
        if(!this.acceptsSubpart(aPart.type)){
            throw new Error(`${this.type} does not accept subparts of type ${aPart.type}`);
        }

        let found = this.subparts.indexOf(aPart);
        if(found < 0){
            // if the part is a card then append after the last card
            if(aPart.type == "card"){
                let allCards = this.subparts.filter((part) => {
                    return part.type == "card";
                });
                this.subparts.splice(allCards.length, 0, aPart);
            } else {
                this.subparts.push(aPart);
            }
            aPart._owner = this;
        }
    }
};

export {
    Stack,
    Stack as default
};
