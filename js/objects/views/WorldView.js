/**
 * WorldView
 * ---------------------------------------------
 * I am a Webcomponent (custom element) that represents
 * a view of a WorldStack model.
 * My element children should contain a single StackView representing
 * the current displayed stack (this comes from the model).
 * I am the root-level element for the SimpleTalk system in a web
 * page. There should only be one of me on any given HTML page.
 */
import PartView from './PartView.js';

const templateString = `
                <style>
                 * {
                     box-sizing: border-box;
                 }
                 :host {
                     display: block;
                     position: relative;
                     width: 100%;
                     height: 100%;
                     background-color: pink;
                 }

                 #available-stacks {
                     display: block;
                     width: 100%;
                     height: 100%;
                     position: relative;
                 }

                 #available-stacks > st-stack {
                     display: none;
                 }

                 #available-stacks > st-stack.current-stack {
                     display: inherit;
                 }
                </style>
                <div id="available-stacks">
                    <slot></slot>
                </div>
`;

class WorldView extends PartView {
    constructor(){
        super();

        // Set up templating and shadow dom
        // TODO: Put the template definition in this
        // module as formatted text
        const template = document.createElement('template');
        template.innerHTML = templateString;
        this._shadowRoot = this.attachShadow({mode: 'open'});
        this._shadowRoot.appendChild(
            template.content.cloneNode(true)
        );

        // Bound methods
        this.updateCurrentStack = this.updateCurrentStack.bind(this);
        this.receiveMessage = this.receiveMessage.bind(this);
        this.onPropertyChange = this.onPropertyChange.bind(this);
    }

    connectedCallback(){
        if(this.isConnected && this.model){

            // If the model specifies a current stack,
            // update it.
            let currStackId = this.model.partProperties.getPropertyNamed(
                this.model,
                'currentStack'
            );
            if(currStackId >= 0){
                let found = document.getElementById(currStackId);
                if(found){
                    found.classList.add('current-stack');
                }
            } else {
                // Otherwise, attempt to set the first stack
                // in the world's list of stacks as the current
                // one.
                let firstAvailableStack = this.firstElementChild;
                if(firstAvailableStack){
                    this.model.partProperties.setPropertyNamed(
                        this.model,
                        'currentStack',
                        firstAvailableStack.id
                    );
                }
            }
        }
    }

    receiveMessage(aMessage){
        switch(aMessage.type){
        case 'propertyChanged':
            this.onPropertyChange(
                aMessage.propertyName,
                aMessage.value
            );
            break;
        default:
            break;
        }
    }

    onPropertyChange(propName, value){
        switch(propName){
        case 'currentStack':
            this.updateCurrentStack(value);
            break;
        default:
            break;
        }
    }

    // Given a stack ID, attempt to find the
    // child component that matches and set
    // it as the current stack. If the id
    // is -1, this means we set no current stack,
    // and instead display the view of all available stacks
    updateCurrentStack(stackId){
        let currentStackView = this.querySelector('.current-stack');
        let nextStackView = document.getElementById(stackId);
        if(currentStackView){
            currentStackView.classList.remove('current-stack');
        }
        if(nextStackView){
            nextStackView.classList.add('current-stack');
        }
    }
};

export {
    WorldView,
    WorldView as default
};
