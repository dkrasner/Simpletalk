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

        // Bind component methods
        this.setPropsFromModel = this.setPropsFromModel.bind(this);
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

    receiveMessage(aMessage){
        if(aMessage.type == 'propertyChanged'){
            this.setPropsFromModel();
        }
    }

    setPropsFromModel(){
        // Layout stuff
        let layout = this.model.partProperties.getPropertyNamed(
            this.model,
            'layout'
        );
        if(layout == 'list'){
            this.classList.add('list-layout');
        } else {
            this.classList.remove('list-layout');
        }
        let listDirection = this.model.partProperties.getPropertyNamed(
            this.model,
            'listDirection'
        );
        if(layout && listDirection == 'row'){
            this.classList.add('list-row');
            this.classList.remove('list-column');
        } else if(layout && listDirection){
            this.classList.remove('list-row');
            this.classList.add('list-column');
        } else {
            this.classList.remove(
                'list-row',
                'list-column'
            );
        }
    }
};

export {
    CardView,
    CardView as default
};
