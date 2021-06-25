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
        let shouldNotify = false;
        let selector = `:scope > st-card[part-id="${nextCurrentId}"]`;
        if(this.isLensed){
            selector = `:scope > st-card[lens-part-id="${nextCurrentId}"]`;
            shouldNotify = true;
        }
        let nextCurrentCard = this.querySelector(selector);
        // if there is no currentCard and no next currentCard we set it to be the first
        // card child (this can happen when new ids are created on deserialization and so
        // the current property stored id is no longer relevant)
        if(!nextCurrentCard && !currentCard){
            nextCurrentCard = this.querySelector(`:scope > st-card`);
            // if there are no cards at all, this must be a brand new stack
            if(!nextCurrentCard){
                return;
            }
            this.model.partProperties.setPropertyNamed(
                this.model,
                "current",
                nextCurrentCard.id,
                shouldNotify
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

    // override subclass methods
    newSubpartView(newView){
        if(this.childNodes.length && newView.name == "CardView"){
            let lastCardNode;
            this.childNodes.forEach((child) => {
                if(child.name == "CardView"){
                    lastCardNode = child;
                }
            });
            if(lastCardNode){
                // insert after the last card
                lastCardNode.after(newView);
            } else {
                // since there are no cards
                // insert before all children
                this.childNodes[0].insertBefore(newView);
            }
        } else {
            this.appendChild(newView);
        }
    }

};

export {
    StackView,
    StackView as default
};
