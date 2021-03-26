/**
 * WrappedView Component
 * ---------------------------------------
 * I am a plain Webcomponent whose purpose is to
 * wrap a visual copy of an actual SimpleTalk View
 * element and display it in a scaled down format.
 * I make a cloned copy of the underlying view and
 * attach it to the same model as the original.
 **/
const templateString = `
<style>
    :host {
        display: block;
        box-sizing: border-box;
        position: relative;
        width: 150px;
        height: 100px;
        border: 1px solid brown;
    }
    :host(st-card){
        display: block;
    }
</style>
<slot name="simpletalk-view"></slot>
`;


class WrappedView extends HTMLElement {
    constructor(){
        super();

        // Set up template and shadowDom
        this.template = document.createElement('template');
        this.template.innerHTML = templateString;
        this._shadowRoot = this.attachShadow({mode: 'open'});
        this._shadowRoot.appendChild(
            this.template.content.cloneNode(true)
        );

        // Bind methods
        this.onChildSlotted = this.onChildSlotted.bind(this);
        this.updateScaling = this.updateScaling.bind(this);
    }

    connectedCallback(){
        if(this.isConnected){
            // Bind a listener for the slot change.
            // This will be triggered whenever any
            // underlying element is slotted, so we
            // know to recompute the appropriate sizing
            // and styling
            let slotEl = this._shadowRoot.querySelector('slot');
            slotEl.addEventListener('slotchange', this.onChildSlotted);
        }
    }

    disconnectedCallback(){
        let slotEl = this._shadowRoot.querySelector('slot');
        slotEl.removeEventListener('slotchange', this.onChildSlotted);
    }

    onChildSlotted(event){
        this.updateScaling();
    }

    updateScaling(){
        let firstChild = this.children[0];
        // We need to find the element corresponding to the
        // actual view for the lens-ed part, in order to get
        // its current dimensions.
        let partId = firstChild.getAttribute('lens-part-id');
        let refElement = document.querySelector(`[part-id="${partId}"]`);
        let wrapBox = this.getBoundingClientRect();
        let innerBox = document.querySelector(`st-world`).getBoundingClientRect();
        let scalingX = (wrapBox.width / innerBox.width);
        let refElementBox = refElement.getBoundingClientRect();
        firstChild.style.width = `${refElementBox.width}px`;
        firstChild.style.height = `${refElementBox.height}px`;
        firstChild.style.transform = `scale(${scalingX, scalingX})`;
        firstChild.style.transformOrigin = "0 0";
    }
};

export {
    WrappedView,
    WrappedView as default
};
