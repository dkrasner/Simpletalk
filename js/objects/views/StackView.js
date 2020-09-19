/**
 * StackView
 * ----------------------------------------------
 * I am a Webcomponent (custom element) representing
 * the view of a Stack.
 * I take up the full width of the current viewport
 * when I am being displayed.
 * My child elements are BackgroundView and CardView
 */

import PartView from './PartView.js';
import Stack from '../parts/Stack.js';

// by default, stacks are hidden unless they're 
// the current stack, or else they have the class
// window-stack (suggesting there's window part
// who wishes to display it)
const templateString = `
                <style>
                 * {
                     box-sizing: border-box;
                 }
                 :host {
                     display: none;
                     position: relative;
                     width: 100%;
                     height: 100%;
                     background-color: white;
                 }
                :host(.current-stack){
                    display: block;
                }
                :host(.window-stack) {
                    display: block;
                }
                </style>
                <slot></slot>
`;

class StackView extends PartView {
    constructor(){
        super();

        // Setup templating and shadow dom
        const template = document.createElement('template');
        template.innerHTML = templateString;
        this._shadowRoot = this.attachShadow({mode: 'open'});
        this._shadowRoot.appendChild(
            template.content.cloneNode(true)
        );
    }

    connectedCallback(){
        if(this.isConnected){
            // For now, do nothing here.

            // Previously, we attempted to set the current-card
            // class in this callback. This was incorrect, as the
            // StackView element can be connected before any of its
            // children are. Instead, CardView checks to see if it is
            // the only such view in its parent StackView element.
            // See the #connectedCallback in CardView.
        }
    }

    goToNextCard(){
        let cardChildren = Array.from(this.querySelectorAll('st-card'));
        if(cardChildren.length  > 1){
            let currentCardView = this.querySelector('.current-card');
            let currentCardIndex = cardChildren.indexOf(currentCardView);
            let nextCardIndex = currentCardIndex + 1;
            let nextCardView;
            if(nextCardIndex < cardChildren.length){
                // If we get here, there is another st-card element
                // in the sibling order. So we set it as the current.
                nextCardView = cardChildren[nextCardIndex];
                currentCardView.classList.remove('current-card');
                nextCardView.classList.add('current-card');
            } else {
                // Otherwise we are at the last child st-card element
                // in the stack, which means we need to loop around
                // back to the first child.
                let firstCard = this.querySelector('st-card');
                currentCardView.classList.remove('current-card');
                firstCard.classList.add('current-card');
            }

            // Then we might want to send some message through
            // the HC system, letting Parts know that we have
            // navigated?
        }
    }

    goToPrevCard(){
        let cardChildren = Array.from(this.querySelectorAll('st-card'));
        if(cardChildren.length > 1){
            let currentCardView = this.querySelector('.current-card');
            let currentCardIndex = cardChildren.indexOf(currentCardView);
            let prevCardIndex = currentCardIndex - 1;
            let prevCardView;
            if(prevCardIndex >= 0){
                // If we get here, there is another card element sibling
                // before this one, so we set that to be the current.
                prevCardView = cardChildren[prevCardIndex];
                currentCardView.classList.remove('current-card');
                prevCardView.classList.add('current-card');
            } else {
                // Otherwise, the current card is the first st-card
                // child element in the stack. So we need to 'loop around'
                // to the *last* card element.
                prevCardView = this.querySelector('st-card:last-child');
                prevCardView.classList.add('current-card');
                currentCardView.classList.remove('current-card');
            }

            // Then we might want to send some message through
            // the HC system, letting Parts know that we have
            // navigated?
        }
    }

    goToCardById(cardId){
        let currentCardView = this.querySelector('.current-card');
        let selectedCardView = this.querySelector(`[part-id='${cardId}']`)

        if (selectedCardView !== null) {
            currentCardView.classList.remove('current-card');
            selectedCardView.classList.add('current-card');
        } else {
            console.log(`The card id: ${cardId} couldn't be found on this stack`)
        }
        // Then we might want to send some message through
        // the HC system, letting Parts know that we have
        // navigated?
    }

    goToNthCard(anInteger){
        // NOTE: values here are 1-indexed, per
        // original HC and what normal people expect
        let trueIndex = anInteger - 1;
        if(trueIndex < 0){
            throw new Error(`Cannot navigate to card number ${anInteger} -- invalid!`);
        }
        let currentCard = this.querySelector('st-card.current-card');
        let targetCard = this.querySelector(`st-card:nth-child(${anInteger})`);
        if(targetCard){
            currentCard.classList.remove('current-card');
            targetCard.classList.add('current-card');
        }
    }
};

export {
    StackView,
    StackView as default
};
