import PartView from './PartView.js';

const templateString = `
    <svg width="160" height="160" viewbox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
    </svg>
`;

class SvgView extends PartView {
    constructor(){
        super();
        this.template = document.createElement('template');
        this.template.innerHTML = templateString;
        this._shadowRoot = this.attachShadow({mode: 'open'});
        this._shadowRoot.appendChild(this.template.content.cloneNode(true));
        // State
        this.state = {
            "moving": false
        };
        // Click stuff
        this.onClick = this.onClick.bind(this);
        this.onHaloResize = this.onHaloResize.bind(this);
        this.updateSrc = this.updateSrc.bind(this);
    }

    afterModelSet() {
        this.onPropChange("src", (svgUri) => {
            this.updateSrc(svgUri);
        });
    }

    connectedCallback(){
        this.addEventListener('click', this.onClick);
        // add the svg data into the custom element
        this.updateSrc(this.model.partProperties.getPropertyNamed(this, "src"));
    }

    disconnectedCallback(){
        this.removeEventListener('click', this.onClick);
    }

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

    onHaloResize(movementX, movementY){
        let svg = this.shadowRoot.children[0];
        let rect = svg.getBoundingClientRect();
        let newWidth = event.movementX + rect.width;
        let newHeight = event.movementY + rect.height;
        svg.style.width = `${newWidth}px`;
        svg.style.height = `${newHeight}px`;
    }

    // Fetch svg data, either remote url or local path;
    // checks for its integrity and updated the DOM
    updateSrc(svgUri){
        // Replacing image with another
        fetch(svgUri).then(response => {
            let contentType = response.headers.get('content-type');
            if(contentType = 'image/svg+xml'){
                return response.text();
            } else {
                throw new Error(`SVGView cannot load file of type ${contentType}`);
            }
        })
        .then(text => {
            let parser = new DOMParser();
            let xmlDocument = parser.parseFromString(text, 'application/xml');
            let newSvgEl = xmlDocument.documentElement;
            let currentSvgEl = this._shadowRoot.querySelector('svg');
            currentSvgEl.remove();
            this._shadowRoot.appendChild(newSvgEl);
        })
        .then(() => {
            this.setAttribute("src", svgUri);
        })
        .catch(error => {
            console.error(error);
        });
    }
/*
    attributeChangedCallback(name, oldVal, newVal) {
        if (name === "src") {
            console.log("ASDF: attributeChangedCallback()");
            this.model.partProperties.setPropertyNamed(this.model, "src", newVal);
        }
    }
    static get observedAttributes() {
        return ["src"]
    }
*/
};

export {
    SvgView,
    SvgView as default
};
