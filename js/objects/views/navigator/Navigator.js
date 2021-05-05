/**
 * SimpleTalk Navigator Webcomponent
 * ------------------------------------------
 * This is a standalone component that allows
 * authors to navigate the WorldStack and individual
 * Stacks therein using a convenient pop-out tray from
 * the bottom of the screen.
 **/
import PartView from '../PartView.js';
import WrappedView from './WrappedView.js';
import StackRow from './StackRow.js';
import CardRow from './CardRow.js';

// Add any needed customElements
window.customElements.define('nav-stack-row', StackRow);
window.customElements.define('nav-card-row', CardRow);
window.customElements.define('wrapped-view', WrappedView);

const stackIcon = `
<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-stack" width="50" height="50" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
   <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
   <polyline points="12 4 4 8 12 12 20 8 12 4"></polyline>
   <polyline points="4 12 12 16 20 12"></polyline>
   <polyline points="4 16 12 20 20 16"></polyline>
</svg>
`;

const cardIcon = `
<svg
   xmlns:dc="http://purl.org/dc/elements/1.1/"
   xmlns:cc="http://creativecommons.org/ns#"
   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
   xmlns:svg="http://www.w3.org/2000/svg"
   xmlns="http://www.w3.org/2000/svg"
   class="icon icon-tabler icon-tabler-stack"
   width="50"
   height="20.833309"
   viewBox="0 0 24 9.9999884"
   stroke-width="2"
   stroke="currentColor"
   fill="none"
   stroke-linecap="round"
   stroke-linejoin="round"
   version="1.1"
   id="svg893">
  <metadata
     id="metadata899">
    <rdf:RDF>
      <cc:Work
         rdf:about="">
        <dc:format>image/svg+xml</dc:format>
        <dc:type
           rdf:resource="http://purl.org/dc/dcmitype/StillImage" />
        <dc:title></dc:title>
      </cc:Work>
    </rdf:RDF>
  </metadata>
  <defs
     id="defs897" />
  <path
     stroke="none"
     d="M -2.7669151,-1.2564948 H 21.233085 V 22.743505 H -2.7669151 Z"
     fill="none"
     id="path885" />
  <polyline
     points="12 4 4 8 12 12 20 8 12 4"
     id="polyline887"
     transform="translate(0,-3)" />
</svg>
`;

const templateString = `
<style>
    :host {
        box-sizing: border-box;
        position: absolute;
        width: 100%;
        bottom: 0;
        min-height: 271px;
        background-color: white;
        backdrop-filter: blur(4px);
        transition: transform 0.2s ease-out;
        padding: 20px;
        transform: translateY(100%);
        border-top: 1px solid rgba(50, 50, 50, 0.4);
        overflow-y: hidden;
        overflow-x: auto;
        z-index: 1000;
    }

    .nav-display-row {
        box-sizing: border-box;
        display: flex;
        position: relative;
        align-items: center;
        justify-content: flex-start;
        margin-bottom: 15px;
    }
    .nav-icon {
        color: gray;
        margin-right: 30px;
    }
</style>
<div id="stacks-display" class="nav-display-row">
    <div id="stack-icon" class="nav-icon">${stackIcon}</div>
    <slot name="stack-row"></slot>
</div>
<div id="cards-display" class="nav-display-row">
    <div id="card-icon" class="nav-icon">${cardIcon}</div>
    <slot name="card-row"></slot>
</div>
`;

class STNavigator extends PartView {
    constructor(){
        super();

        this.initialized = false;
        
        // Set up template
        this.template = document.createElement('template');
        this.template.innerHTML = templateString;
        this._shadowRoot = this.attachShadow({mode: 'open'});
        this._shadowRoot.appendChild(
            this.template.content.cloneNode(true)
        );

        // Bound methods
        this.toggle = this.toggle.bind(this);
        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
        this.handleCurrentChange = this.handleCurrentChange.bind(this);
        this.handlePartAdded = this.handlePartAdded.bind(this);
        this.handlePartRemoved = this.handlePartRemoved.bind(this);
        this.createCardRowFor = this.createCardRowFor.bind(this);
    }

    afterDisconnected(){
        let worldView = document.querySelector('st-world');
        worldView.removeEventListener('st-view-added', this.handlePartAdded);
        worldView.removeEventListener('st-view-removed', this.handlePartRemoved);
    }

    afterModelSet(){
        this.removeAttribute('part-id');

        // Respond to the System part-added CustomEvent
        let worldView = document.querySelector('st-world');
        worldView.addEventListener('st-view-added', this.handlePartAdded);
        worldView.addEventListener('st-view-removed', this.handlePartRemoved);

        // Add a StackRow view.
        this.stackRowEl = this.querySelector(':scope > nav-stack-row');
        if(!this.stackRowEl){
            this.stackRowEl = document.createElement('nav-stack-row');
            this.stackRowEl.setAttribute('slot', 'stack-row');
            this.appendChild(this.stackRowEl);
        }
        this.stackRowEl.setModel(this.model);

        // Create any needed CardRow views for all stacks
        // currently in the world
        this.model.subparts.filter(subpart => {
            return subpart.type == 'stack';
        }).forEach(stackPart => {
            this.createCardRowFor(stackPart);
        });

        // Init the StackRow
        this.stackRowEl.initView();
        
        // Update the current card/stack values
        this.handleCurrentChange();

        // Respond to eventual current-ness prop
        // changes from the WorldStack.
        this.onPropChange('current', this.handleCurrentChange);
    }

    handleCurrentChange(){
        // If we get here, this means that the current *stack* has changed.
        // So we need to find the correct CardRow for it and set it
        // to be the slotted one in the shadow DOM
        let currentStackId = this.model.currentStack.id.toString();
        Array.from(this.querySelectorAll('nav-card-row')).forEach(cardRow => {
            let rowId = cardRow.getAttribute('stack-id');
            cardRow.removeAttribute('slot');
            if(currentStackId == rowId){
                cardRow.setAttribute('slot', 'card-row');
                Array.from(cardRow.querySelectorAll('wrapped-view')).forEach(wrapper => {
                    wrapper.updateScaling();
                });
            }
        });
    }

    handlePartAdded(event){
        // If a new stack is added, we need to create
        // a new CardRow for it.
        if(event.detail.partType == 'stack'){
            let stackPart = window.System.partsById[event.detail.partId];
            this.createCardRowFor(stackPart);
        }
    }

    handlePartRemoved(event){
        // If a stack has been removed, we need to
        // remove the corresponding CardRow
        if(event.detail.partType == 'stack'){
            let cardRow = this.querySelector(`[stack-id="${event.detail.partId}"]`);
            if(cardRow){
                cardRow.remove();
            }
        }
    }

    createCardRowFor(aStack){
        let cardRow = document.createElement('nav-card-row');
        cardRow.setAttribute('stack-id', aStack.id);
        cardRow.setModel(aStack);
        this.appendChild(cardRow);
        cardRow.initView();
    }

    toggle(){
        this.classList.toggle('open');
        if(this.classList.contains('open')){
            this.open();
        } else {
            this.close();
        }
    }

    open(){
        this.style.transform = "translateY(0)";
    }

    close(){
        this.style.transform = "translateY(100%)";
    }

    
};

export {
    STNavigator,
    STNavigator as default
};
