/**
 * LayoutView
 * -----------------------------------
 * I am a webcomponent representing a Layout
 */

import PartView from './PartView.js';

const templateString = `
<style>
    :host(.editing){
        border: 1px dotted black;
    }
    ::slotted(*) {
        position: relative !important;
    }
}
</style>
<slot></slot>
`;

class LayoutView extends PartView {
    constructor(){
        super();
        this.template = document.createElement('template');
        this.template.innerHTML = templateString;
        this._shadowRoot = this.attachShadow({mode: 'open'});
        this._shadowRoot.appendChild(this.template.content.cloneNode(true));

        // Bind event methods
        this.onClick = this.onClick.bind(this);
        this.setPropsFromModel = this.setPropsFromModel.bind(this);
    }

    connectedCallback(){
        if(this.isConnected){
            this.addEventListener('click', this.onClick);

            if(this.model){
                this.setPropsFromModel();
            }
        }
    }

    disconnectedCallback(){
        this.removeEventListener('click', this.onClick);
    }

    closeHalo(){
        let foundHalo = this._shadowRoot.querySelector('st-halo');
        if(foundHalo){
            this._shadowRoot.removeChild(foundHalo);
        }
    }

    openHalo(){
        // Compute the appropriate width and height from
        // current rect
        let rect = this.getBoundingClientRect();
        this.style.width = `${Math.floor(rect.width)}px`;
        this.style.height = `${Math.floor(rect.height)}px`;
        this.style.top = `${Math.floor(rect.top)}px`;
        this.style.left = `${Math.floor(rect.left)}px`;
        let foundHalo = this._shadowRoot.querySelector('st-halo');
        if(foundHalo){
            this._shadowRoot.removeChild(foundHalo);
        } else {
            let newHalo = document.createElement('st-halo');
            this._shadowRoot.appendChild(newHalo);
        }
    }

    onClick(event){
        if(event.button == 0 && event.shiftKey){
            event.preventDefault();
            this.openHalo();
            event.stopPropagation();
        }
    }

    setPropsFromModel(){
        let hResizing = this.model.partProperties.getPropertyNamed(
            this.model,
            'horizontalResizing'
        );
        if(hResizing == 'matchParent'){
            this.style.width = "100%";
        } else {
            this.style.width = "";
        }

        let vResizing = this.model.partProperties.getPropertyNamed(
            this.model,
            'verticalResizing'
        );
        if(vResizing == 'matchParent'){
            this.style.height = "100%";
        } else {
            this.style.height = "";
        }

        let listDirection = this.model.partProperties.getPropertyNamed(
            this.model,
            'listDirection'
        );
        if(listDirection == 'row'){
            this.classList.remove('list-column');
            this.classList.add('list-row');
        } else {
            this.classList.remove('list-row');
            this.classList.add('list-column');
        }
    }

    receiveMessage(aMessage){
        if(aMessage.type == 'propertyChanged'){
            console.log(aMessage);
            this.setPropsFromModel();
        }
    }

};

export {
    LayoutView,
    LayoutView as default
};
