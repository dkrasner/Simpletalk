/**
 * ButtonView
 * ---------------------------------------------------
 * I am a webcomponent representing a Button.
 */
import PartView from './PartView.js';

const templateString = `
                <style>
                 :host(.editing){
                     background-color: white;
                     color: black;
                 }
                 .st-button-label {
                     user-select: none;
                     pointer-events: none;
                 }
                </style>
                <span class="st-button-label">
                    <slot></slot><!-- Text of the Name -->
                </span>
`;

class ButtonView extends PartView {
    constructor(){
        super();

        this.template = document.createElement('template');
        this.template.innerHTML = templateString;
        this._shadowRoot = this.attachShadow({mode: 'open'});
        this._shadowRoot.appendChild(this.template.content.cloneNode(true));

        // Bound methods
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onClick = this.onClick.bind(this);
        this.setupPropHandlers = this.setupPropHandlers.bind(this);

        // Setup prop change handlers
        this.setupPropHandlers();
    }

    setupPropHandlers(){
        this.onPropChange('name', (value, partId) => {
            this.innerText = value;
        });
    }

    afterConnected(){
        // Setup mouse event handling
        this.addEventListener('mousedown', this.onMouseDown);
        this.addEventListener('mouseup', this.onMouseUp);
        this.addEventListener('mouseenter', this.onMouseEnter);
        this.addEventListener('click', this.onClick);

        let buttonName = this.model.partProperties.getPropertyNamed(this, "name");
        if(buttonName){
            this.innerText = buttonName;
        };
    }

    afterDisconnected(){
        this.removeEventListener('click', this.onClick);
        this.removeEventListener('mouseup', this.onMouseUp);
        this.removeEventListener('mousedown', this.onMouseDown);
    }

    onClick(event){
        if(event.button == 0 && event.shiftKey){
            event.preventDefault();
            event.stopPropagation();
            if(this.hasOpenHalo){
                this.closeHalo();
            } else {
                this.openHalo();
            }
        } else if(event.button == 0){
            this.model.sendMessage({
                type: 'command',
                commandName: 'click',
                args: [],
                shouldIgnore: true
            }, this.model);
        }
    }

    onMouseDown(event){
        if(event.shiftKey){
            event.preventDefault();
        }

        this.model.sendMessage({
            type: 'command',
            commandName: 'mouseDown',
            args: [],
            shouldIgnore: true
        }, this.model);
    }

    onMouseUp(event){
        if(!this.hasOpenHalo){
            // Send the mouseUp command
            // message to Button Part.
            this.model.sendMessage({
                type: 'command',
                commandName: 'mouseUp',
                args: [],
                shouldIgnore: true // Should ignore if System DNU
            }, this.model);
        }
    }

    onMouseEnter(event){
        this.model.sendMessage({
            type: 'command',
            commandName: 'mouseEnter',
            args: [],
            shouldIgnore: true
        }, this.model);
    }
};

export {
    ButtonView,
    ButtonView as default
};
