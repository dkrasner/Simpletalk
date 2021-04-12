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

        // Halo settings. Cards don't want
        //a halo to open
        this.wantsHalo = false;

        // Bind component methods
        this.onClick = this.onClick.bind(this);
    }

    afterConnected(){
        // Add event listeners
        this['onclick'] = this.onClick;
    }

    afterDisconnected(){
        // Remove event listeners
        this['onclick'] = null;
    }

    onClick(event){
        if(event.button == 0 && event.shiftKey){
            event.preventDefault();
            event.stopPropagation();
            // TODO
            // in the future this should probably be a message
            if (event.altKey){
                this.openWorldCatalog();
            } else {
                // Disabling for now
                //this.openToolbox();
            }
        }
    }
};

export {
    CardView,
    CardView as default
};
