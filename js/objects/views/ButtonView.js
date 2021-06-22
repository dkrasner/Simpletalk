/**
 * ButtonView
 * ---------------------------------------------------
 * I am a webcomponent representing a Button.
 */
import PartView from './PartView.js';

const templateString = `
                <style>
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
    }

    afterDisconnected(){
    }

    afterModelSet(){
        let buttonName = this.model.partProperties.getPropertyNamed(this, "name");
        if(buttonName){
            this.innerText = buttonName;
        };
    }

    // override the base class implementation
    onClick(event){
        if(event.button == 0){
            if(event.shiftKey){
                this.onHaloActivationClick(event);
            } else if(!this.hasOpenHalo){
                // Send the click command message to self
                this.model.sendMessage({
                    type: 'command',
                    commandName: 'click',
                    args: [],
                    shouldIgnore: true // Should ignore if System DNU
                }, this.model);
            }
        }
    }

    // Overwriting the base class open/close editor methods
    openEditor(){
        window.System.openEditorForPart(this.model.id);
    }

    closeEditor(){
        window.System.closeEditorForPart(this.model.id);
    }
};

export {
    ButtonView,
    ButtonView as default
};
