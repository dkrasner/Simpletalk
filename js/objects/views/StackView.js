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
const templateString = `<slot></slot>`;

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

        // Halo settings. Cards don't want
        //a halo to open
        this.wantsHalo = false;

        // Handle current-ness prop change
        this.onPropChange('current', this.handleCurrentChange);

        // Bind methods
        this.handleCurrentChange = this.handleCurrentChange.bind(this);
    }

    afterModelSet(){
        // Do an initial setting of the
        // current card
        this.handleCurrentChange();
    }

    handleCurrentChange(){
        // The value of the current prop is the card ID
        // of the child Card that should be the
        // current one. We remove the current-card class from
        // the previous current card and add it to the new one.
        let currentCard = this.querySelector('.current-card');
        let nextCurrentId = this.model.partProperties.getPropertyNamed(
            this.model,
            'current'
        );
        let nextCurrentCard = this.querySelector(`:scope > st-card[part-id="${nextCurrentId}"]`);
        // if there is no currentCard and no next currentCard we set it to be the first
        // card child (this can happen when new ids are created on deserialization and so
        // the current property stored id is no longer relevant)
        if(!nextCurrentCard && !currentCard){
            nextCurrentCard = this.querySelector(`:scope > st-card`);
            this.model.partProperties.setPropertyNamed(
                this.model,
                "current",
                nextCurrentCard.id,
                false // do not notify
            );
        }
        if(nextCurrentCard){
            nextCurrentCard.classList.add('current-card');
        } else {
            return;
        }
        if(currentCard && currentCard != nextCurrentCard){
            currentCard.classList.remove('current-card');
        }
    }
};

export {
    StackView,
    StackView as default
};
