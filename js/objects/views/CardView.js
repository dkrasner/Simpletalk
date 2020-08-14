/**
 * CardView
 * --------------------------------------------------
 * I am a webcomponent representation of a Card.
 */

import PartView from './PartView.js';

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
                 }
:host(.current-card){
display: block;
}

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
};

export {
    CardView,
    CardView as default
};
