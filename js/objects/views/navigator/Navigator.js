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
        position: absolute;
        width: 100%;
        top: 100%;
        min-height: 100px;
        background-color: white;
        transition: top 0.2s ease-out;
        padding: 20px;
    }
    .nav-display-row {
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
    <slot name="stacks"></slot>
</div>
<div id="cards-display" class="nav-display-row">
    <div id="card-icon" class="nav-icon">${cardIcon}</div>
    <slot name="cards"></slot>
</div>
`;

class STNavigator extends PartView {
    constructor(){
        super();

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
        this.attachToWorld = this.attachToWorld.bind(this);
        this.updateStacksDisplay = this.updateStacksDisplay.bind(this);
        this.updateCardsDisplay = this.updateCardsDisplay.bind(this);
        this._recursivelyUpdateViewChildren = this._recursivelyUpdateViewChildren.bind(this);
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
        let worldView = document.querySelector('st-world');
        this.attachToWorld(worldView);
        let height = this.getBoundingClientRect().height;
        let heightPx = `calc(100% - ${height}px)`;
        this.style.top = heightPx;
    }

    close(){
        this.style.top = null;
    }

    attachToWorld(aWorldView){
        this.updateStacksDisplay(aWorldView);
        let currentStackView = aWorldView.querySelector('.current-stack');
        this.updateCardsDisplay(currentStackView);
    }

    updateCardsDisplay(aStackView){
        // Clear any existing wrappers inside the cards display
        let existing = Array.from(this.querySelectorAll('wrapped-view[slot="cards"]'));
        existing.forEach(el => { el.remove(); });
        Array.from(aStackView.querySelectorAll('st-world > st-stack.current-stack > st-card')).forEach(sourceCardView => {
            let cardViewCopy = sourceCardView.cloneNode(true);
            cardViewCopy.setModel(sourceCardView.model);
            cardViewCopy.removeAttribute('part-id');
            cardViewCopy.setAttribute('lens-part-id', sourceCardView.getAttribute('part-id'));
            cardViewCopy.setAttribute('slot', 'simpletalk-view');
            cardViewCopy.style.pointerEvents = "none";
            this._recursivelyUpdateViewChildren(cardViewCopy);
            let wrapper = document.createElement('wrapped-view');
            wrapper.setAttribute('slot', 'cards');
            wrapper.appendChild(cardViewCopy);
            this.appendChild(wrapper);
        });
    }

    updateStacksDisplay(aWorldView){
        // Clear any existing wrappers inside the stacks display
        let existing = Array.from(this.querySelectorAll('wrapped-view[slot="stacks"]'));
        existing.forEach(el => { el.remove(); });
        Array.from(aWorldView.querySelectorAll('st-world > st-stack')).forEach(sourceStackView => {
            let stackViewCopy = sourceStackView.cloneNode(true);
            stackViewCopy.setModel(sourceStackView.model);
            stackViewCopy.handleCurrentChange(); // Re-sets the current card attribute to match model
            stackViewCopy.removeAttribute('part-id');
            stackViewCopy.setAttribute('lens-part-id', sourceStackView.getAttribute('part-id'));
            stackViewCopy.setAttribute('slot', 'simpletalk-view');
            stackViewCopy.style.pointerEvents = "none";
            this._recursivelyUpdateViewChildren(stackViewCopy);
            let wrapper = document.createElement('wrapped-view');
            wrapper.setAttribute('slot', 'stacks');
            wrapper.appendChild(stackViewCopy);
            this.appendChild(wrapper);
        });
    }

    _recursivelyUpdateViewChildren(aLensView){
        Array.from(aLensView.querySelectorAll('[part-id]')).forEach(subView => {
            let mappedId = subView.getAttribute('part-id');
            subView.setAttribute('lens-part-id', mappedId);
            subView.removeAttribute('part-id');
            let model = document.querySelector(`[part-id="${mappedId}"]`).model;
            subView.setModel(model);
            this._recursivelyUpdateViewChildren(subView);
        });
    }
};

window.customElements.define('wrapped-view', WrappedView);

export {
    STNavigator,
    STNavigator as default
};
