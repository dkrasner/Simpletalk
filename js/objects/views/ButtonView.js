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
        this.setPropsFromModel = this.setPropsFromModel.bind(this);
    }

    connectedCallback(){
        if(this.isConnected){

            // Setup mouse event handling
            this.addEventListener('mousedown', this.onMouseDown);
            this.addEventListener('mouseup', this.onMouseUp);
            this.addEventListener('mouseenter', this.onMouseEnter);
            this.addEventListener('click', this.onClick);

            // If there is a bound model, set all
            // the relevant view properties from
            // model properties
            if(this.model){
                this.setPropsFromModel();
            }
        }
    }

    disconnectedCallback(){
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
        }
    }

    onMouseDown(event){
        if(event.shiftKey){
            event.preventDefault();
        }
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

    setPropsFromModel(){
        this.innerText = this.model.partProperties.getPropertyNamed(
            this.model,
            'name'
        );
    }

    receiveMessage(aMessage){
        if(aMessage.type == 'propertyChanged'){
            // TODO should script property change be handled in the based class?
            if(aMessage.propertyName == "script"){
                this.model.sendMessage({
                    type: 'compile',
                    codeString: aMessage.value,
                    targetId: this.model.id
                }, window.System);
            } else {
                this.setPropsFromModel();
            }
        }
    }
};

export {
    ButtonView,
    ButtonView as default
};
