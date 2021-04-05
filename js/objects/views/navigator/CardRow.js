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
        this._recursivelyUpdateLensViewSubparts = this._recursivelyUpdateLensViewSubparts.bind(this);
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
        let currentId = this.model.currentCard.id;
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
        let wrappers = Array.from(this.querySelectorAll('wrapped-view'));
        let delay = 100;
        for(let i = 0; i < wrappers.length; i++){
            let wrapper = wrappers[i];
            setTimeout(() => {
                wrapper.classList.remove('hide');
            }, delay * (i + 1));
            setTimeout(() => {
                wrapper.showContent();
            }, delay * (i + 2));
        }
    }

    addWrappedCard(aCard){
        // Create a lensed copy of the CardView
        let cardView = document.querySelector(`[part-id="${aCard.id}"]`);
        let cardLensView = cardView.cloneNode(true);
        cardLensView.setAttribute('lens-part-id', aCard.id);
        cardLensView.setAttribute('slot', 'wrapped-view');
        cardLensView.style.pointerEvents = "none";

        // The wrapper will handle current-ness, so remove
        // the class from the lensed version
        cardLensView.classList.remove('current-card');

        // Recursively create lens views of all subpart
        // children and append them in the correct places
        cardLensView.isLensed = true;
        cardLensView.setModel(aCard);
        cardLensView.removeAttribute('part-id');
        this._recursivelyUpdateLensViewSubparts(cardLensView, aCard.id);

        // Insert the lensed CardView into the wrapper
        let wrapper = document.createElement('wrapped-view');
        wrapper.setAttribute('slot', 'cards');
        wrapper.setAttribute('wrapped-id', aCard.id);
        wrapper.addEventListener('click', this.onWrapperClick);
        wrapper.appendChild(cardLensView);
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
    CardRow,
    CardRow as default
};
