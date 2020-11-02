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
        this.onClick = this.onClick.bind(this);
        this.onDrop = this.onDrop.bind(this);
        this.setupPropHandlers = this.setupPropHandlers.bind(this);
        this.layoutChanged = this.layoutChanged.bind(this);
        this.bgColorChanged = this.bgColorChanged.bind(this);

        // Setup prop handlers
        this.setupPropHandlers();
    }

    setupPropHandlers(){
        this.onPropChange('layout', this.layoutChanged);
        this.onPropChange('backgroundColor', this.bgColorChanged);
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

        // Add event listeners
        this.addEventListener('click', this.onClick);
        // this.addEventListener('dragenter', (event) => {event.preventDefault()});
        this.addEventListener('dragover', (event) => {
            event.preventDefault()
            event.dataTransfer.dropEffect = "copy";
        });
        this.addEventListener('drop', this.onDrop);
    }

    afterDisconnected(){
        // Remove event listeners
        this.removeEventListener('click', this.onClick);
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
                this.openToolbox();
            }
        }
    }

    onDrop(event){
        event.preventDefault();
        let sourceModelId = event.dataTransfer.getData("text/plain");
        let msg = {
            type: "command",
            commandName : "newView",
            args: ["", sourceModelId, this.model.id]
        }
        this.sendMessage(msg, window.System);
    }

    layoutChanged(value, partId){
        // Layout stuff
        let layout = value;
        if(layout == 'list'){
            this.classList.add('list-layout');
        } else {
            this.classList.remove('list-layout');
        }
        let listDirection = this.model.partProperties.getPropertyNamed(
            this.model,
            'listDirection'
        );
        this.classList.remove(
            'list-row',
            'list-column'
        );
        if(layout && listDirection == 'row'){
            this.classList.add('list-row');
        } else if(layout && listDirection){
            this.classList.add('list-column');
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

    // TODO: this shold be a more general prop change handler
    bgColorChanged(value){
        this.style['backgroundColor'] = value;
    }
};

export {
    CardView,
    CardView as default
};
