/**
 * LayoutView
 * -----------------------------------
 * I am a webcomponent representing a Layout
 */

import PartView from './PartView.js';

const templateString = `
<style>
    :host {
        display: flex;
        position: absolute;
        min-height: 50px;
        min-width: 50px;
        border: 1px solid transparent;
        box-sizing: border-box;
    }
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
    }

    connectedCallback(){
        if(this.isConnected){
            this.addEventListener('click', this.onClick);
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

};

export {
    LayoutView,
    LayoutView as default
};
