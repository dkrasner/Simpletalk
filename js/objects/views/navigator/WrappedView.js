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
        width: 150px;
        height: 100px;
        border: 1px solid rgba(100, 100, 100, 0.4);
        overflow: hidden;
        margin-left: 15px;
        flex-shrink: 0;
        transition: transform 0.2s ease-in, opacity 0.2s ease-in, box-shadow 0.2s linear;
        transform: translateY(0);
        opacity: 1.0;
    }

    :host(:hover:not(.current)){
        cursor: pointer;
        border: 1px solid rgba(100, 100, 100, 0.8);
        box-shadow: 1px 1px 20px 1px rgba(150, 150, 150, 0.5);
        transition: box-shadow 0.1s linear, border 0.1s linear;
    }

    :host(.hide),
    :host(.hide.current){
        transform: translateY(100%);
        opacity: 0.01;
        transition: transform 0.2s ease-out, opacity 0.2s ease-out, box-shadow 0.2s linear;
    }

    :host(.hide) > st-card {
        display: none;
    }

    :host(.current){
        box-shadow: 1px 1px 20px 2px rgba(100, 100, 100, 0.8);
    }
    :host(:not(.current)){
        opacity: 0.5;
        transition: transform 0.2s ease-out, opacity 0.2s ease-out, box-shadow 0.2s linear;
    }
</style>
<slot name="wrapped-view"></slot>
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
        this.hideContent = this.hideContent.bind(this);
        this.showContent = this.showContent.bind(this);
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
        let refElement = document.querySelector(`st-world`);
        let wrapBox = this.getBoundingClientRect();
        let innerBox = document.querySelector(`st-world`).getBoundingClientRect();
        let scalingX = (wrapBox.width / innerBox.width);
        let refElementBox = refElement.getBoundingClientRect();
        firstChild.style.width = `${refElementBox.width}px`;
        firstChild.style.height = `${refElementBox.height}px`;
        firstChild.style.transform = `scale(${scalingX, scalingX})`;
        firstChild.style.transformOrigin = "0px 0px";
    }

    hideContent(){
        this.children[0].style.display = "none";
    }

    showContent(){
        this.children[0].style.display = "block";
    }
};

export {
    WrappedView,
    WrappedView as default
};
