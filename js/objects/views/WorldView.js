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
        let nextCurrentIdx = this.model.partProperties.getPropertyNamed(
            this.model,
            'current'
        );
        let stackViews = Array.from(this.querySelectorAll(':scope > st-stack'));
        stackViews.forEach((stackView, idx) => {
            if(idx == nextCurrentIdx){
                stackView.classList.add('current-stack');
            } else {
                stackView.classList.remove('current-stack');
            }
        });
    }

    handleKeyDown(event){
        if(event.altKey && event.ctrlKey && event.code == "Space"){
            let navigator = document.querySelector('st-navigator');
            navigator.toggle();
        }
    }
};

export {
    WorldView,
    WorldView as default
};
