/**
 * Navigator Stack Row
 * --------------------------------------------
 * I am a view on the WorldStack that shows each
 * subpart stack item as a wrapped lens view along
 * a row.
 */
import PartView from '../PartView.js';

const templateString = `
<style>
    :host {
        display: flex;
        position: relative;
        align-items: center;
        justify-content: flex-start;
        flex: 1;
    }    
</style>
<slot name="stacks"></slot>
`;

class StackRow extends PartView {
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
        this.initView = this.initView.bind(this);
        this.addWrappedStack = this.addWrappedStack.bind(this);
        this.handleCurrentChange = this.handleCurrentChange.bind(this);
        this.handlePartAdded = this.handlePartAdded.bind(this);
        this.showInitially = this.showInitially.bind(this);
        this.onWrapperClick = this.onWrapperClick.bind(this);
        this._recursivelyUpdateLensViewSubparts = this._recursivelyUpdateLensViewSubparts.bind(this);
    }

    afterModelSet(){
        this.removeAttribute('part-id');
        this.setAttribute('stack-id', this.model.id);
        this.onPropChange('current', this.handleCurrentChange);

        // Find the World Model's main view element.
        // We add the st-view-added CustomEvent listener
        // here so we can react only to direct stack additions
        // to the WorldStack (and not, say, to Windows or other nested kinds)
        let worldView = document.querySelector('st-world');
        worldView.addEventListener('st-view-added', this.handlePartAdded);
    }

    afterModelUnset(){
        let worldView = document.querySelector('st-world');
        worldView.removeEventListener('st-view-added', this.handlePartAdded);
    }

    handleCurrentChange(){
        let currentId = this.model.currentStack.id;
        let wrappedViews = Array.from(
            this.querySelectorAll('wrapped-view')
        );
        wrappedViews.forEach(wrappedView => {
            let wrappedChild = wrappedView.children[0];
            if(wrappedChild.model.id == currentId){
                wrappedView.classList.add('current');
            } else {
                wrappedView.classList.remove('current');
            }
        });
    }

    handlePartAdded(event){
        // This handler is for the st-view-added
        // CustomEvent that is triggered by System when
        // newModel() has completed.
        if(event.detail.partType == 'stack'){
            let stackPart = window.System.partsById[event.detail.partId];
            this.addWrappedStack(stackPart);
            this.showInitially();
        }
    }

    onWrapperClick(event){
        let wrapperIsCurrent = event.target.classList.contains('current');
        if(this.model && !wrapperIsCurrent){
            this.model.goToStackById(
                event.target.getAttribute('wrapped-id')
            );
        }
    }

    initView(){
        // We iterate over each corresponding Stack and:
        // * Create a clone of its view node;
        // * Attach the correct model;
        // * Set it to be a lensed view
        // * Do the same for all children, recursively
        this.model.subparts.filter(subpart => {
            return subpart.type == 'stack';
        }).forEach(stackPart => {
            this.addWrappedStack(stackPart);
        });

        // Setup the initial current-ness display
        this.handleCurrentChange();
    }

    showInitially(){
        let wrappers = Array.from(this.querySelectorAll('wrapped-view'));
        wrappers.forEach(wrapper => {
            wrapper.classList.remove('hide');
            wrapper.showContent();
        });
    }

    addWrappedStack(aStack){
        // Create a lensed copy of the StackView
        let stackView = document.querySelector(`[part-id="${aStack.id}"]`);
        let stackLensView = stackView.cloneNode(true);
        stackLensView.setAttribute('lens-part-id', aStack.id);
        stackLensView.setAttribute('slot', 'wrapped-view');
        stackLensView.style.pointerEvents = "none";

        // Recursively create lens views of all subpart children
        // and append them in the correct places
        stackLensView.isLensed = true;
        stackLensView.setModel(aStack);
        stackLensView.removeAttribute('part-id');
        stackLensView.handleCurrentChange();
        this._recursivelyUpdateLensViewSubparts(stackLensView, aStack.id);
        
        // Insert the lensed StackView into the wrapper
        let wrapper = document.createElement('wrapped-view');
        wrapper.setAttribute("slot", "stacks");
        wrapper.setAttribute("wrapped-id", aStack.id);
        wrapper.addEventListener('click', this.onWrapperClick);
        wrapper.appendChild(stackLensView);
        wrapper.hideContent();
        wrapper.classList.add('hide');
        this.appendChild(wrapper);
    }

    _recursivelyUpdateLensViewSubparts(aLensView, aLensId){
        let subViews = Array.from(aLensView.children);
        subViews.forEach(subView => {
            subView.isLensed = true;
            let id = subView.getAttribute('part-id');
            subView.setAttribute('lens-part-id', id);
            let model = window.System.partsById[id];
            subView.setModel(model);
            subView.removeAttribute('part-id');
            this._recursivelyUpdateLensViewSubparts(subView, id);
        });
    }
};

export {
    StackRow,
    StackRow as default
};
