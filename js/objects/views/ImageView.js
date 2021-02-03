import PartView from './PartView.js';

const linkIcon = `
<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-link" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <path d="M10 14a3.5 3.5 0 0 0 5 0l4 -4a3.5 3.5 0 0 0 -5 -5l-.5 .5" />
  <path d="M14 10a3.5 3.5 0 0 0 -5 0l-4 4a3.5 3.5 0 0 0 5 5l.5 -.5" />
</svg>
`;

const templateString = `
<img id="wrapped-image" class="hidden" />
<svg class="hidden" id="wrapped-svg" draggable=true xmlns="http://www.w3.org/2000/svg">
</svg>
<style>
:host {
    box-sizing: border-box;
    display: block;
    position: absolute;
    padding: 1px;
    user-select: none;
}

.hidden {
    display: none;
}
img {
    width: 100%;
    height: auto;
    display: block;
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
        this.initCustomHaloButton = this.initCustomHaloButton.bind(this);
        this.updateImageLink = this.updateImageLink.bind(this);
        this.updateSizingForBinaryImage = this.updateSizingForBinaryImage.bind(this);
        this.updateSizingForViewport = this.updateSizingForViewport.bind(this);
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

        if(!this.haloButton){
            this.initCustomHaloButton();
        }
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
        svgEl.classList.remove('currently-wrapped');
        imgEl.classList.add('currently-wrapped');
        imgEl.src = imageData;
        imgEl.onload = () => {
            console.log('image onload');
            //this.updateSizingForBinaryImage();
        };
        this.preserveAspectOnResize = true;
        imgEl.classList.remove('hidden');
    }

    updateSvgImage(imageData){
        console.log('updateSvgImage triggered...');
        let imgEl = this._shadowRoot.getElementById('wrapped-image');
        let currentSvgEl = this._shadowRoot.getElementById('wrapped-svg');
        let parser = new DOMParser();
        let xmlDocument = parser.parseFromString(imageData, 'application/xml');
        let newSvgEl = xmlDocument.documentElement;

        // Ensure that the SVG has some width and height attributes
        // set so we have initial dimensions to display. If not present,
        // pull from viewbox.
        if(!newSvgEl.hasAttribute('width') || !newSvgEl.hasAttribute('height')){
            let viewBox = newSvgEl.getAttribute('viewBox').split(" ");
            let viewBoxWidth = parseInt(viewBox[2]);
            let viewBoxHeight = parseInt(viewBox[3]);
            newSvgEl.setAttribute('height', viewBoxHeight);
            newSvgEl.setAttribute('width', viewBoxWidth);
        } 
        newSvgEl.id = 'wrapped-svg';
        newSvgEl.classList.add('currently-wrapped');
        imgEl.classList.add('hidden');
        imgEl.classList.remove('currently-wrapped');
        currentSvgEl.remove();
        this._shadowRoot.appendChild(newSvgEl);
        //this.updateSizingForViewport();
        this.preserveAspectOnResize = false;
    }

    updateImageLink(event){
        // Tells the model to update its
        // src link for the image
        let currentSrc = this.model.partProperties.getPropertyNamed(
            this.model,
            'src'
        );
        let result = window.prompt("Edit URL for image:", currentSrc);
        if(result && result !== '' && result !== currentSrc){
            this.sendMessage(
                {
                    type: 'command',
                    commandName: 'loadImageFrom',
                    args: [ result ]
                },
                this.model
            );
        }
    }

    updateSizingForBinaryImage(){
        // Ensure that the web component's dimensions
        // match the aspect ratio of the incoming image binary.
        // This prevents odd resizing behavior when using the halo.
        let image = this._shadowRoot.getElementById('wrapped-image');
        this.style.width = `${image.naturalWidth}px`;
        this.style.height = `${image.naturalHeight}px`;
    }

    updateSizingForViewport(){
        // Ensure that this component does not display larger
        // than the current remaining subrectangle of its origin
        // and the corner of the viewport
        console.log('updateSizingForViewport called');
        let rect = this.getBoundingClientRect();
        let padding = 60;
        if((rect.width - padding) > document.clientWidth){
            let newWidth = document.clientWidth - padding;
            let widthRatio = newWidth / rect.width;
            this.style.width = `${newWidth}px`;
            this.style.height = `${rect.height * widthRatio}px`;
            this.updateSizingForViewport();
        }
        if((rect.height - padding) > document.clientHeight){
            let newHeight = document.clientHeight - padding;
            let heightRatio = newHeight / rect.height;
            this.style.height = `${newHeight}px`;
            this.style.width = `${rect.width * heightRatio}px`;
            this.updateSizingForViewport();
        }
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

    openHalo(){
        // Override default. Here we add a custom button
        // when showing.
        let foundHalo = this.shadowRoot.querySelector('st-halo');
        if(!foundHalo){
            foundHalo = document.createElement('st-halo');
            this.shadowRoot.appendChild(foundHalo);
        }
        foundHalo.append(this.haloButton);
    }

    onHaloResize(movementX, movementY){
        // Override default behavior.
        // We resize the wrapped svg or img instead
        // and have the outer component simply react to
        // the change.
        let wrappedImage = this._shadowRoot.querySelector('.currently-wrapped');
        let rect = wrappedImage.getBoundingClientRect();
        let newWidth, newHeight;
        if(this.preserveAspectOnResize){
            let ratio = rect.width / rect.height;
            let hyp = Math.sqrt((movementX**2) + (movementY**2));
            if(movementX < 0 || movementY < 0){
                hyp = hyp * -1;
            }
            newHeight = rect.height + hyp;
            newWidth = rect.width + hyp;
        } else {
            newWidth = rect.width + movementX;
            newHeight = rect.height + movementY;
            wrappedImage.style.width = `${newWidth}px`;
            wrappedImage.style.height = `${newHeight}px`;
        }

        if(newWidth && newHeight){
            this.style.width = `${newWidth}px`;
            this.style.height = `${newHeight}px`;
        }
        
    }

    initCustomHaloButton(){
        this.haloButton = document.createElement('div');
        this.haloButton.id = 'halo-image-link';
        this.haloButton.classList.add('halo-button');
        this.haloButton.innerHTML = linkIcon;
        this.haloButton.style.marginTop = "6px";
        this.haloButton.setAttribute('slot', 'right-column');
        this.haloButton.setAttribute('title', 'Edit link for image file');
        this.haloButton.addEventListener('click', this.updateImageLink);
    }
};

export {
    ImageView,
    ImageView as default
};
