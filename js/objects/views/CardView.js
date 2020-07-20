/**
 * CardView
 * --------------------------------------------------
 * I am a webcomponent representation of a Card.
 */

import PartView from './PartView.js';

class CardView extends PartView {
    constructor(){
        super();

        // Setup template and shadow root
        const template = document.getElementById('card-view-template');
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
