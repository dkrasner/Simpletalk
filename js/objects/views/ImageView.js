import PartView from './PartView.js';

const templateString = `
<img id="wrapped-image" class="hidden" />
<svg class="hidden" id="wrapped-svg" draggable=true xmlns="http://www.w3.org/2000/svg">
</svg>
<style>
:host {
    display: block;
    position: absolute;
}
.hidden {
    display: none;
}
</style>
`;

class ImageView extends PartView {
    constructor(){
        super();

        // Setup template and shadow dom
        this.template = document.createElement('template');
        this.template.innerHTML = templateString;
        this._shadowRoot = this.attachShadow({mode: 'open'});
        this._shadowRoot.appendChild(this.template.content.cloneNode(true));

        // Bind component methods
        this.updateImageData = this.updateImageData.bind(this);
        this.updateSvgImage = this.updateSvgImage.bind(this);
        this.updateBinaryImage = this.updateBinaryImage.bind(this);
        this.onClick = this.onClick.bind(this);
        //this.onDragstart = this.onDragstart.bind(this);
        //this.onDragstart = this.onDragstart.bind(this);
        //this.onHaloResize = this.onHaloResize.bind(this);
    }

    afterModelSet(){
        // prop changes
        this.onPropChange("imageData", (imageData) => {
            this.updateImageData(imageData);
        });
        this.onPropChange("draggable", (value) => {
            this.setAttribute("draggable", value);
        });

        // Make sure we have imageData. If not, try
        // to load from a src.
        let currentImageData = this.model.partProperties.getPropertyNamed(
            this.model,
            "imageData"
        );
        let currentSrc = this.model.partProperties.getPropertyNamed(
            this.model,
            "src"
        );
        if(!currentImageData && currentSrc){
            let msg = {
                type: 'command',
                commandName: 'loadImageFrom',
                args: [ currentSrc ]
            };
            this.model.sendMessage(msg, this.model);
        } else {
            this.updateImageData(currentImageData);
        }
    }

    afterConnected(){
        this['onclick'] = this.onClick;
        //this['ondragstart'] = this.onDragstart;
    }

    afterDisconnected(){
        this['onclick'] = null;
        this['ondragstart'] = null;
    }

    updateImageData(imageData){
        if(this.model.isSvg){
            this.updateSvgImage(imageData);
        } else {
            this.updateBinaryImage(imageData);
        }
        
    }

    updateBinaryImage(imageData){
        // In this case, the imageData is
        // a base64 encoded data url describing
        // the bits of the image.
        let imgEl = this._shadowRoot.getElementById('wrapped-image');
        let svgEl = this._shadowRoot.getElementById('wrapped-svg');
        svgEl.classList.add('hidden');
        imgEl.src = imageData;
        imgEl.classList.remove('hidden');
    }

    updateSvgImage(imageData){
        let imgEl = this._shadowRoot.getElementById('wrapped-image');
        let currentSvgEl = this._shadowRoot.getElementById('wrapped-svg');
        let parser = new DOMParser();
        let xmlDocument = parser.parseFromString(imageData, 'application/xml');
        let newSvgEl = xmlDocument.documentElement;
        newSvgEl.id = 'wrapped-svg';
        imgEl.classList.add('hidden');
        currentSvgEl.remove();
        this._shadowRoot.appendChild(newSvgEl);
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
};

export {
    ImageView,
    ImageView as default
};
