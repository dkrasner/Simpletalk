/**
 * Navigator Card Row
 * --------------------------------------------
 * I am a view on a given Stack that shows each
 * subpart card item as a wrapped lens view along
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
<slot name="cards"></slot>
`;

class CardRow extends PartView {
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
        this.addWrappedCard = this.addWrappedCard.bind(this);
        this.handleCurrentChange = this.handleCurrentChange.bind(this);
        this.handlePartAdded = this.handlePartAdded.bind(this);
        this.showInitially = this.showInitially.bind(this);
        this.onWrapperClick = this.onWrapperClick.bind(this);
    }

    afterModelSet(){
        this.removeAttribute('part-id');
        this.setAttribute('card-id', this.model.id);
        this.onPropChange('current', this.handleCurrentChange);

        // Find the Stack Model's main view element.
        // We add the st-view-added/removed CustomEvent listeners
        // here so we can react only to direct stack additions
        // to the Stack (and not, say, to Windows or other nested kinds)
        let stackView = window.System.findViewById(this.model.id);
        stackView.addEventListener('st-view-added', this.handlePartAdded);
    }

    afterModelUnset(removedModel){
        let stackView = window.System.findViewById(removedModel.id);
        stackView.removeEventListener('st-view-added', this.handlePartAdded);
    }

    handleCurrentChange(){
        if(!this.model.currentCard){
            return;
        }
        let wrappers = Array.from(this.querySelectorAll('wrapped-view'));
        wrappers.forEach(wrapper => {
            let wrappedId = wrapper.getAttribute('wrapped-id');
            if(wrappedId == this.model.currentCard.id.toString()){
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
        if(event.detail.partType == 'card'){
            let cardPart = window.System.partsById[event.detail.partId];
            this.addWrappedCard(cardPart);
            this.showInitially();
        }
    }

    onWrapperClick(event){
        let wrapperIsCurrent = event.target.classList.contains('current');
        if(this.model && !wrapperIsCurrent){
            this.model.goToCardById(event.target.getAttribute('wrapped-id'));
        }
    }

    initView(){
        // First, we clear out any existing children
        this.innerHTML = "";
        
        // We iterate over each card of the stack and:
        // * Create a clone of the card view element;
        // * Attach the correct model;
        // * Set it to be a lensed view;
        // * Do the same for all children, recursively
        this.model.subparts.filter(subpart => {
            return subpart.type == 'card';
        }).forEach(cardPart => {
            this.addWrappedCard(cardPart);
        });

        // Update setting the current
        this.handleCurrentChange();
    }

    showInitially(){
        // Nothing for now
    }

    addWrappedCard(aCard){
        // Insert the lensed CardView into the wrapper
        let wrapper = document.createElement('wrapped-view');
        wrapper.setAttribute('slot', 'cards');
        wrapper.addEventListener('click', this.onWrapperClick);
        this.appendChild(wrapper);
        wrapper.setModel(aCard);
    }
};

export {
    CardRow,
    CardRow as default
};
