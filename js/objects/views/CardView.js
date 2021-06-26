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
    }

    afterConnected(){
    }

    afterDisconnected(){
    }

    // override the default class method
    onClick(event){
        if(event.button == 0 && event.shiftKey){
            event.preventDefault();
            event.stopPropagation();
        }
    }

    addContextMenuItems(contextMenu){
        contextMenu.addSpacer();
        // Toolbox toggle hide/unhide
        let currentStack = window.System.getCurrentStackModel();
        let toolbox = currentStack.subparts.filter((part) => {
            let name = part.partProperties.getPropertyNamed(part, "name");
            return name == "Toolbox";
        })[0];
        // if there is no toolbox at all, that's weird but don't do anything
        if(toolbox){
            let hidden = toolbox.partProperties.getPropertyNamed(toolbox, "hide");
            if(hidden){
                contextMenu.addListItem(
                    "Unhide Toolbox",
                    (event) => {
                        toolbox.partProperties.setPropertyNamed(toolbox, "hide", false);
                    }
                );
            } else {
                contextMenu.addListItem(
                    "Hide Toolbox",
                    (event) => {
                        toolbox.partProperties.setPropertyNamed(toolbox, "hide", true);
                    }
                );
            }
        }
    }
};

export {
    CardView,
    CardView as default
};
