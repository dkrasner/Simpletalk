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

const templateString = `<slot></slot>`;

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

        // The world never wants a halo
        this.wantsHalo = false;

        // Bound methods
        this.updateCurrentStack = this.updateCurrentStack.bind(this);
        this.receiveMessage = this.receiveMessage.bind(this);
        this.setupPropHandlers = this.setupPropHandlers.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);

        // Setup prop handlers
        this.setupPropHandlers();
    }

    setupPropHandlers(){
        this.onPropChange('current', this.updateCurrentStack);
    }

    afterConnected(){
        document.addEventListener('keydown', this.handleKeyDown);
    }

    afterDisconnected(){
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    afterModelSet(){
        // Do an initial update to display
        // the model's current stack
        this.updateCurrentStack();
    }

    updateCurrentStack(){
        // The value of the current prop is the stack ID
        // of the child Stack that should be the
        // current one. We remove the current-stack class from
        // the previous current stack and add it to the new one.
        let currentStack = this.querySelector('.current-stack');
        let nextCurrentId = this.model.partProperties.getPropertyNamed(
            this.model,
            'current'
        );
        let nextCurrentStack = this.querySelector(`:scope > st-stack[part-id="${nextCurrentId}"]`);
        if(nextCurrentStack){
            nextCurrentStack.classList.add('current-stack');
        } else {
            return;
        }
        // To prevent the setting of the same id as the current stack make sure
        // next and current are not the same
        if(currentStack && currentStack != nextCurrentStack){
            currentStack.classList.remove('current-stack');
        }
    }

    handleKeyDown(event){
        if(event.altKey && event.ctrlKey && event.code == "Space"){
            let navigator = document.querySelector('st-navigator');
            navigator.toggle();
        }
    }

    // override subclass methods
    newSubpartView(newView){
        if(this.childNodes.length && newView.name == "StackView"){
            let lastStackNode;
            this.childNodes.forEach((child) => {
                if(child.name == "StackView"){
                    lastStackNode = child;
                }
            });
            if(lastStackNode){
                // insert after the last stack
                lastStackNode.after(newView);
            } else {
                // since there are no stacks
                // insert before all children
                this.childNodes[0].insertBefore(newView);
            }
        } else {
            this.appendChild(newView);
        }
    }

};

export {
    WorldView,
    WorldView as default
};
