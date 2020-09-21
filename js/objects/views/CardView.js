/**
 * CardView
 * --------------------------------------------------
 * I am a webcomponent representation of a Card.
 */

import PartView from './PartView.js';

const templateString = `
                <style>
                </style>
                <slot></slot>
`;

class CardView extends PartView {
    constructor(){
        super();

        // Setup template and shadow root
        const template = document.createElement('template');
        template.innerHTML = templateString;
        this._shadowRoot = this.attachShadow({mode: 'open'});
        this._shadowRoot.appendChild(
            template.content.cloneNode(true)
        );
    }

    connectedCallback(){
        if(this.isConnected){
            // Check to see if the parent StackView has another
            // current card set. If not, and I am the first card
            // in the StackView, set myself to be the current card.
            let currentCard = Array.from(this.parentElement.children).find(childEl => {
                return childEl.classList.contains('current-card');
            });

            if(!currentCard){
                this.classList.add('current-card');
            }
        }
    }
};

export {
    CardView,
    CardView as default
};
