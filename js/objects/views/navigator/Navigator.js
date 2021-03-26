/**
 * SimpleTalk Navigator Webcomponent
 * ------------------------------------------
 * This is a standalone component that allows
 * authors to navigate the WorldStack and individual
 * Stacks therein using a convenient pop-out tray from
 * the bottom of the screen.
 **/
import WrappedView from './WrappedView.js';
const templateString = `
<style>
    :host {
        position: absolute;
        width: 100%;
        top: 100%;
        min-height: 100px;
        background-color: white;
        transition: top 0.2s ease-out;
    }
</style>
<div id="stacks-display">
    <slot name="stacks"></slot>
</div>
<div id="cards-display">
    <slot name="cards"></slot>
</div>
`;

class STNavigator extends HTMLElement {
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
        
    }

    updateStacksDisplay(aWorldView){
        // Clear any existing wrappers inside the stacks display
        let existing = Array.from(this.querySelectorAll('wrapped-view[slot="stacks"]'));
        console.log(existing.length);
        existing.forEach(el => { el.remove(); });
        Array.from(aWorldView.querySelectorAll('st-world > st-stack')).forEach(sourceStackView => {
            let stackViewCopy = sourceStackView.cloneNode(true);
            stackViewCopy.setModel(sourceStackView.model);
            stackViewCopy.handleCurrentChange(); // Re-sets the current card attribute to match model
            stackViewCopy.removeAttribute('part-id');
            stackViewCopy.setAttribute('lens-part-id', sourceStackView.getAttribute('part-id'));
            stackViewCopy.setAttribute('slot', 'simpletalk-view');
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
