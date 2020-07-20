/**
 * ButtonView
 * ---------------------------------------------------
 * I am a webcomponent representing a Button.
 */
import PartView from './PartView.js';

class ButtonView extends PartView {
    constructor(){
        super();

        this.template = document.getElementById('button-view-template');
        this._shadowRoot = this.attachShadow({mode: 'open'});
        this._shadowRoot.appendChild(this.template.content.cloneNode(true));

        // Bound methods
        this.onClick = this.onClick.bind(this);
        this.setPropsFromModel = this.setPropsFromModel.bind(this);
    }

    connectedCallback(){
        if(this.isConnected){

            // Setup mouse event handling
            this.addEventListener('click', this.onClick);
            this.addEventListener('contextmenu', this.onContextMenu);

            // Set my initially computed height and width to
            // explicit inline style values
            let rect = this.getBoundingClientRect();
            this.style.width = `${rect.width}px`;
            this.style.height = `${rect.height}px`;
            this.style.top = `${rect.top}px`;
            this.style.left = `${rect.left}px`;

            // If there is a bound model, set all
            // the relevant view properties from
            // model properties
            if(this.model){
                this.setPropsFromModel();
            }
        }
    }

    disconnectedCallback(){
        this.removeEventListener('click', this.onClick);
    }

    onClick(event){
        console.log(event.button);
    }

    onContextMenu(event){
        event.preventDefault();
        let foundHalo = this._shadowRoot.querySelector('st-halo');
        if(foundHalo){
            this._shadowRoot.removeChild(foundHalo);
        } else {
            let newHalo = document.createElement('st-halo');
            this._shadowRoot.appendChild(newHalo);
        }
    }

    setPropsFromModel(){
        this.innerText = this.model.partProperties.getPropertyNamed(
            this.model,
            'name'
        );
    }
};

export {
    ButtonView,
    ButtonView as default
};
