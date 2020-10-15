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
        this.onClick = this.onClick.bind(this);
    }

    onClick(event){
        if(event.button == 0 && event.shiftKey){
            event.preventDefault();
            event.stopPropagation();
            // TODO
            // At the moment we close the toolbox in the UI natively
            // but in the future this should probably be a message
            if(!this.hasOpenToolbox){
                this.openToolbox();
            }
        }
    }

    afterConnected(){
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

    afterModelSet(){
        this.setPropsFromModel();
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
        // background stuff
        let backgroundColor = this.model.partProperties.getPropertyNamed(
            this.model,
            'backgroundColor'
        );
        this.style['backgroundColor'] = backgroundColor;
        // TODO this could bemore propgrammatic. For example
        // styleProperties((prop) => {this.style[prop.name] = prop.value}) etc
    }
};

export {
    CardView,
    CardView as default
};
