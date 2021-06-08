/**
 * WrappedView Component
 * ---------------------------------------
 * I am a plain Webcomponent whose purpose is to
 * wrap a visual copy of an actual SimpleTalk View
 * element and display it in a scaled down format.
 * I make a cloned copy of the underlying view and
 * attach it to the same model as the original.
 **/
import PartView from '../PartView.js';

const templateString = `
<style>
    #number-display {
        opacity: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 0px;
        left: 0px;
        width: 100%;
        height: 100%;
        transition: opacity 0.2s ease-in;
        font-size: 2.2rem;
    }

    #number-display > span {
        transform: translateY(-10px);
        transition: transform 0.2s linear;
        pointer-events: none;
    }

    :host(:not(.current)) > #number-display {
        opacity: 0.8;
        background-color: rgba(200, 200, 200, 0.5);
        transition: opacity 0.2s ease-out;
        z-index: 1000;
    }

    :host(:not(.current)) > #number-display > span {
        transform: translateY(0px);
        transition: transform 0.2s linear;
    }
</style>
<div id="number-display">
    <span></span>
</div>
<slot name="wrapped-view"></slot>
`;


class WrappedView extends PartView {
    constructor(){
        super();
        this.wantsHalo = false;

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
        this.handleNumberChange = this.handleNumberChange.bind(this);
        this.addWrappedView = this.addWrappedView.bind(this);
        this._recursivelyUpdateLensViews = this._recursivelyUpdateLensViews.bind(this);
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
        //this.updateScaling();
        //this.updateNumberDisplay();
    }

    afterModelSet(){
        this.onPropChange('number', this.handleNumberChange);
        this.removeAttribute('part-id');
        this.addWrappedView(this.model);
        this.updateNumberDisplay();
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
        firstChild.style.transform = `scale(${scalingX})`;
        firstChild.style.transformOrigin = "0px 0px";
    }

    updateNumberDisplay(){
        let firstChild = this.children[0];
        let model = firstChild.model;
        // we only want to look at subparts of the same type (stack or card)
        let subparts = model._owner.subparts.filter((part) => {
            return model.type == part.type;
        });
        let numDisplay = this._shadowRoot.querySelector('#number-display > span');
        numDisplay.innerText = subparts.indexOf(model) + 1;
    }

    handleNumberChange(){
        // Update number display of all wrapped views in the row
        Array.from(this.parentNode.querySelectorAll(`wrapped-view`)).forEach(wrapper => {
            wrapper.updateNumberDisplay();
        });
    }

    addWrappedView(aPartModel){
        // First, clear out any existing
        // child elements
        this.innerHTML = "";

        // Create a lensed copy of the given
        // view and update key attributes on it
        let originalView = document.querySelector(`[part-id="${aPartModel.id}"]`);
        let lensedView = originalView.cloneNode(true);
        lensedView.setAttribute('lens-part-id', aPartModel.id);
        lensedView.setAttribute('slot', 'wrapped-view');
        lensedView.style.pointerEvents = "none";
        lensedView.wantsHalo = false;

        // Inline the initial scaling style properties.
        // We begin with an extremely small amount which will
        // be adjusted later during updateScaling();
        lensedView.style.transform = `scale(${0.001})`;
        lensedView.style.transformOrigin = "0px 0px";
        
        // Recursively create lens views of all subpart children
        // and append them in the correct places
        lensedView.isLensed = true;
        lensedView.setModel(aPartModel);
        lensedView.removeAttribute('part-id');
        if(lensedView.handleCurrentChange){
            lensedView.handleCurrentChange();
        }
        this._recursivelyUpdateLensViews(lensedView, aPartModel.id);

        // Insert the root lensed view into the wrapper
        this.setAttribute('wrapped-id', aPartModel.id);
        this.appendChild(lensedView);
        this.updateScaling();
    }

    _recursivelyUpdateLensViews(lensedView, anId){
        let subViews = Array.from(lensedView.children).filter(child => {
            return child.isPartView;
        });
        subViews.forEach(subView => {
            subView.isLensed = true;
            subView.wantsHalo = false;
            let subId = subView.getAttribute('part-id');
            subView.setAttribute('lens-part-id', subId);
            let model = window.System.partsById[subId];
            subView.setModel(model);
            subView.removeAttribute('part-id');
            this._recursivelyUpdateLensViews(subView, subId);
        });
    }

    /** PartView Overrides **/
    styleCSS(){
        // Do nothing
    }

    styleTextCSS(){
        // Do nothing
    }

    layoutChanged(){
        // Do nothing
    }
};

export {
    WrappedView,
    WrappedView as default
};
