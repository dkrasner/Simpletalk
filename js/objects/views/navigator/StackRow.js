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
        this.wantsHalo = false;

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
        this.handlePartRemoved = this.handlePartRemoved.bind(this);
        this.showInitially = this.showInitially.bind(this);
        this.onWrapperClick = this.onWrapperClick.bind(this);
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
        worldView.addEventListener('st-view-removed', this.handlePartRemoved);
    }

    afterModelUnset(){
        let worldView = document.querySelector('st-world');
        worldView.removeEventListener('st-view-added', this.handlePartAdded);
        worldView.removeEventListener('st-view-removed', this.handlePartRemoved);
    }

    handleCurrentChange(){
        let currentId = this.model.currentStack.id;
        let wrappedViews = Array.from(
            this.querySelectorAll('wrapped-view')
        );
        wrappedViews.forEach(wrapper => {
            let wrappedId = wrapper.getAttribute('wrapped-id');
            if(wrappedId == this.model.currentStack.id.toString()){
                wrapper.classList.add('current');
            } else {
                wrapper.classList.remove('current');
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

    handlePartRemoved(event){
        if(event.detail.partType == 'stack'){
            let wrappedView = this.querySelector(`wrapped-view[wrapped-id="${event.detail.partId}"]`);
            if(wrappedView){
                wrappedView.remove();
            }

            // Update numbers of remaining wrapped views in this StackRow
            Array.from(this.querySelectorAll('wrapped-view')).forEach(wrapper => {
                wrapper.updateNumberDisplay();
            });
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
        // Remove any existing wrapped views
        this.innerHTML = "";

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
        // Nothing for now
    }

    addWrappedStack(aStack){  
        // Insert the lensed StackView into the wrapper
        let wrapper = document.createElement('wrapped-view');
        wrapper.setAttribute("slot", "stacks");
        wrapper.addEventListener('click', this.onWrapperClick);
        this.appendChild(wrapper);
        wrapper.setModel(aStack);
    }

    subpartOrderChanged(id, currentIndex, newIndex){
        let subpartNode = this.childNodes[currentIndex];
        if(!subpartNode){
            // this could be a model subpart which is not a stack and hence not
            // displayed in the StackRow
            return;
        }
        if(newIndex == this.childNodes.length - 1){
            this.appendChild(subpartNode);
        } else {
            // we need to account for whether the index of this
            // is before or after the newIndex
            if(currentIndex < newIndex){
                newIndex = newIndex + 1;
            }
            let referenceNode = this.childNodes[newIndex];
            this.insertBefore(subpartNode, referenceNode);
        }
        // Update number display of all wrapped views in the row
        Array.from(this.querySelectorAll(`wrapped-view`)).forEach(wrapper => {
            wrapper.updateNumberDisplay();
        });
    }
};

export {
    StackRow,
    StackRow as default
};
