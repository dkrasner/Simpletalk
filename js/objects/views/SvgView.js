import PartView from './PartView.js';

const templateString = `
    <svg draggable=true xmlns="http://www.w3.org/2000/svg">
    </svg>
`;

class SvgView extends PartView {
    constructor(){
        super();
        this.defaultWidth = "100px";
        this.defaultHeight = "100px";

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
        this.onDragstart = this.onDragstart.bind(this);
        this.onDragstart = this.onDragstart.bind(this);
        this.onHaloResize = this.onHaloResize.bind(this);
        this.updateSrc = this.updateSrc.bind(this);
    }

    afterModelSet() {
        // prop changes
        this.onPropChange("src", (svgUri) => {
            this.updateSrc(svgUri);
        });
        this.onPropChange("draggable", (value) => {
            this.setAttribute('draggable', value);
        });
    }

    afterConnected(){
        //Atributes
        this.setAttribute('draggable', true);
        // Events
        this['onclick'] = this.onClick;
        this['ondragstart'] = this.onDragstart;
        // add the svg data into the custom element
        this.updateSrc(this.model.partProperties.getPropertyNamed(this, "src"));
    }

    afterDisconnected(){
        this['onclick'] = null;
        this['ondragstart'] = null;
    }

    onClick(event){
        if(event.button == 0){
            if(event.shiftKey){
                // prevent triggering the on click message
                event.preventDefault();
                if(this.hasOpenHalo){
                    this.closeHalo();
                } else {
                    this.openHalo();
                }
            } else if(!this.hasOpenHalo){
                // Send the click command message to self
                this.model.sendMessage({
                    type: 'command',
                    commandName: 'click',
                    args: [],
                    shouldIgnore: true // Should ignore if System DNU
                }, this.model);
            }
        }
    }

    onDragstart(event){
        if(this.hasOpenHalo){
            event.stopPropagation();
            event.preventDefault();
        }
        // TODO this is janky; should we convert the svg to
        // image/png? or have a png copy of every svg
        let img = new Image()
        img.src = '../../../images/svg.png';
        event.dataTransfer.setDragImage(img, 10, 10);
        event.dataTransfer.setData("text/plain", this.model.id);
        event.dataTransfer.dropEffect = "copy";
    };

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
            if(contentType == 'image/svg+xml'){
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
            newSvgEl.style.width = this.defaultWidth;
            newSvgEl.style.height = this.defaultHeight;
            currentSvgEl.remove();
            this._shadowRoot.appendChild(newSvgEl);
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
