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
        this.onDrop = this.onDrop.bind(this);
    }

    afterConnected(){

        // Add event listeners
        this['onclick'] = this.onClick;
        this['ondragenter'] = (event) => {
            event.preventDefault();
        };
        this['ondragover'] = (event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
        };
        this['ondrop'] = this.onDrop;
    }

    afterDisconnected(){
        // Remove event listeners
        this['onclick'] = null;
        this['ondragenter'] = null;
        this['ondragover'] = null;
        this['ondrop'] = null;
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

    onDrop(event){
        event.preventDefault();
        let sourceModelId = event.dataTransfer.getData("text/plain");
        let sourceModel = window.System.partsById[sourceModelId];
        if(sourceModel._owner.id !== this.model.id){
            let msg = {
                type: "command",
                commandName : "copyModel",
                args: [sourceModelId, this.model.id],
                shouldIgnore: true
            };
            this.sendMessage(msg, sourceModel);
        }
    }
};

export {
    CardView,
    CardView as default
};
