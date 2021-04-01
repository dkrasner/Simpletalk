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
        this._recursivelyUpdateLensViewSubparts = this._recursivelyUpdateLensViewSubparts.bind(this);
    }

    afterModelSet(){
        this.removeAttribute('part-id');
        this.setAttribute('card-id', this.model.id);
        this.onPropChange('current', this.handleCurrentChange);
    }

    handleCurrentChange(){
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

    initView(){
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

    addWrappedCard(aCard){
        // Create a lensed copy of the CardView
        let cardView = document.querySelector(`[part-id="${aCard.id}"]`);
        let cardLensView = cardView.cloneNode(true);
        cardLensView.setAttribute('lens-part-id', aCard.id);
        cardLensView.setAttribute('slot', 'wrapped-view');
        cardLensView.style.pointerEvents = "none";

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
        wrapper.appendChild(cardLensView);
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
