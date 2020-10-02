/**
 * ContainerView
 * -------------------------------------
 * I am a webcomponent representation of
 * a Container Part
 */
import PartView from './PartView.js';

const templateString = `
<style>
</style>
<slot></slot`;

class ContainerView extends PartView {
    constructor(){
        super();

        // Setup template and shadow root
        const template = document.createElement('template');
        template.innerHTML = templateString;
        this._shadowRoot = this.attachShadow({mode: 'open'});
        this._shadowRoot.appendChild(
            template.content.cloneNode(true)
        );

        // Bind component methods
        this.setPropsFromModel = this.setPropsFromModel.bind(this);
        this.onDragEnter = this.onDragEnter.bind(this);
        this.onDragLeave = this.onDragLeave.bind(this);
        this.onDrop = this.onDrop.bind(this);
        this.onClick = this.onClick.bind(this);
    }

    connectedCallback(){
        if(this.isConnected){
            if(this.model){
                this.setPropsFromModel();
            }
        }

        // Bind events
        this.addEventListener('click', this.onClick);
    }

    disconnectedCallback(){
        this.removeEventListener('click', this.onClick);
    }

    receiveMessage(aMessage){
        if(aMessage.type == 'propertyChanged'){
            this.setPropsFromModel();
        }
    }

    setPropsFromModel(){
        let layout = this.model.partProperties.getPropertyNamed(
            this.model,
            'layout'
        );
        if(layout == 'list'){
            this.classList.add('list-layout');
        } else {
            this.classList.remove('list-layout');
        }

        let listDirection = this.model.partProperties.getPropertyNamed(
            this.model,
            'listDirection'
        );
        if(layout && listDirection == 'row'){
            this.classList.remove('list-column');
            this.classList.add('list-row');
        } else if(layout && listDirection){
            this.classList.remove('list-row');
            this.classList.add('list-column');
        } else {
            this.classList.remove(
                'list-row',
                'list-column'
            );
        }
    }

    /* Halo Operations */
    onClick(event){
        if(event.button == 0 && event.shiftKey){
            this.openHalo();
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

    closeHalo(){
        let foundHalo = this._shadowRoot.querySelector('st-halo');
        if(foundHalo){
            this._shadowRoot.removeChild(foundHalo);
        }
    }

    /* Drag and Drop Operations */
    onDragEnter(event){
        console.log(event);
    }

    onDragLeave(event){
        console.log(event);
    }

    onDrop(event){
        console.log(event);
    }
};

export {
    ContainerView,
    ContainerView as default
};
