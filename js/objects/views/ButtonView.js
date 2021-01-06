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
        this.onDragstart = this.onDragstart.bind(this);
        this.onDragend = this.onDragend.bind(this);
        this.onClick = this.onClick.bind(this);
        this.setupPropHandlers = this.setupPropHandlers.bind(this);

        // Setup prop change handlers
        this.setupPropHandlers();
    }

    setupPropHandlers(){
        this.onPropChange('name', (value, partId) => {
            this.innerText = value;
        });
        this.onPropChange("draggable", (value) => {
            this.setAttribute('draggable', value);
        });
    }

    afterConnected(){
        //Atributes
        this.setAttribute('draggable', true);
        // Setup mouse event handling
        this['onmousedown'] = this.onMouseDown;
        this['onmouseup'] = this.onMouseUp;
        this['onmouseenter'] = this.onMouseEnter;
        this['onclick'] = this.onClick;
        this['ondragstart'] = this.onDragstart;
        this['ondragend'] = this.onDragend;

        let buttonName = this.model.partProperties.getPropertyNamed(this, "name");
        if(buttonName){
            this.innerText = buttonName;
        };
    }

    afterDisconnected(){
        this['onmousedown'] = null;
        this['onmouseup'] = null;
        this['onmouseenter'] = null;
        this['onclick'] = null;
        this['ondragstart'] = null;
        this['ondragend'] = null;
    }

    onClick(event){
        if(event.button == 0){
            if(event.shiftKey){
                // prevent triggering the on click message
                event.preventDefault();
                if(this.hasOpenHalo){
                    this.closeHalo();
                } else {
                    this.openHalo();
                }
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

    onMouseDown(event){
        if(event.shiftKey){
            event.preventDefault();
        } else if(!this.hasOpenHalo){
            this.classList.add('active');
        }

        this.model.sendMessage({
            type: 'command',
            commandName: 'mouseDown',
            args: [],
            shouldIgnore: true
        }, this.model);
    }

    onMouseUp(event){
        if(event.shiftKey){
            event.preventDefault();
        } else if(!this.hasOpenHalo){
            // Send the mouseUp command
            // message to Button Part.
            this.model.sendMessage({
                type: 'command',
                commandName: 'mouseUp',
                args: [],
                shouldIgnore: true // Should ignore if System DNU
            }, this.model);
            this.classList.remove('active');
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

    onDragstart(event){
        if(this.hasOpenHalo){
            event.stopPropagation();
            event.preventDefault();
        }
        event.dataTransfer.setData("text/plain", this.model.id);
        event.dataTransfer.dropEffect = "copy";
    };

    onDragend(event){
        this.classList.remove('active');
    };
};

export {
    ButtonView,
    ButtonView as default
};
