/**
 * ButtonView
 * ---------------------------------------------------
 * I am a webcomponent representing a Button.
 */
import PartView from './PartView.js';

const templateString = `
                <style>
                 * {
                     box-sizing: border-box;
                 }

                 :host {
                     display: inline-flex;
                     flex-direction: column;
                     justify-content: center;
                     align-items: center;
                     position: relative;
                     background-color: white;
                     padding-left: 10px;
                     padding-right: 10px;
                     padding-top: 5px;
                     padding-bottom: 5px;
                     font-family: monospace;
                     border: 1px solid rgb(50, 50, 50);
                     user-select: none;
                 }

                 :host(:hover) {
                     cursor: pointer;
                 }

                 :host(:active) {
                     background-color: black;
                     color: white;
                 }
                 :host(.editing){
                     background-color: white;
                     color: black;
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
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onClick = this.onClick.bind(this);
        this.setPropsFromModel = this.setPropsFromModel.bind(this);
    }

    connectedCallback(){
        if(this.isConnected){

            // Setup mouse event handling
            this.addEventListener('mouseup', this.onMouseUp);
            this.addEventListener('mouseenter', this.onMouseEnter);
            this.addEventListener('click', this.onClick);
            this.addEventListener('contextmenu', this.onContextMenu);

            // Set my initially computed height and width to
            // explicit inline style values
            let rect = this.getBoundingClientRect();
            this.style.width = `${rect.width}px`;
            this.style.height = `${rect.height}px`;
            this.style.top = `${rect.top}px`;
            this.style.left = `${rect.left}px`;

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
        this.removeEventListener('contextmenu', this.onContextMenu);
        this.removeEventListener('mouseup', this.onMouseUp);
    }

    onClick(event){
        console.log(event.button);
    }

    onMouseUp(event){

        // Send the mouseUp command
        // message to Button Part.
        this.model.sendMessage({
            type: 'command',
            commandName: 'mouseUp',
            args: [],
            shouldIgnore: true // Should ignore if System DNU
        }, this.model);
    }

    onMouseEnter(event){
        this.model.sendMessage({
            type: 'command',
            commandName: 'mouseEnter',
            args: [],
            shouldIgnore: true
        }, this.model);
    }

    onContextMenu(event){
        event.preventDefault();
        let foundHalo = this._shadowRoot.querySelector('st-halo');
        if(foundHalo){
            this._shadowRoot.removeChild(foundHalo);
        } else {
            let newHalo = document.createElement('st-halo');
            this._shadowRoot.appendChild(newHalo);
        }
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
            if(aMessage.propertyName = "script"){
                this.model.sendMessage({
                    type: 'compile',
                    codeString: aMessage.value,
                    targetObject: this.model
                }, System);
            }
            this.setPropsFromModel();
        }
    }
};

export {
    ButtonView,
    ButtonView as default
};
