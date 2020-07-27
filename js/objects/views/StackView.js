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

const templateString = `
                <style>
                 * {
                     box-sizing: border-box;
                 }
                 :host {
                     display: block;
                     width: 100%;
                     height: 100%;
                     position: relative;
                     background-color: white;
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
            // If the model has no subparts at this
            // point, we should create a default background
            // and single card.
            if(this.model){
                let cards = this.model.subparts.filter(part => {
                    return part.type == 'card';
                });
                let backgrounds = this.model.subparts.filter(part => {
                    return part.type =='backgrounds';
                });
                if(!backgrounds.length){
                    this.sendMessage({
                        type: 'newModel',
                        modelType: 'background',
                        owner: this.model
                    }, window.System);
                }
                if(!cards.length){
                    this.sendMessage({
                        type: 'newModel',
                        modelType: 'card',
                        owner: this.model
                    }, window.System);
                }
            }
        }
    }
};

export {
    StackView,
    StackView as default
};
