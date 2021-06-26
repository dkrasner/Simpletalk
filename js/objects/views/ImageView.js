import PartView from './PartView.js';

const linkIcon = `
<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-link" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <path d="M10 14a3.5 3.5 0 0 0 5 0l4 -4a3.5 3.5 0 0 0 -5 -5l-.5 .5" />
  <path d="M14 10a3.5 3.5 0 0 0 -5 0l-4 4a3.5 3.5 0 0 0 5 5l.5 -.5" />
</svg>
`;

const pictureIcon = `
<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-photo" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
   <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
   <line x1="15" y1="8" x2="15.01" y2="8"></line>
   <rect x="4" y="4" width="16" height="16" rx="3"></rect>
   <path d="M4 15l4 -4a3 5 0 0 1 3 0l5 5"></path>
   <path d="M14 14l1 -1a3 5 0 0 1 3 0l2 2"></path>
</svg>
`;

const templateString = `
<img id="wrapped-image" class="hidden" />
<svg class="hidden" id="wrapped-svg" xmlns="http://www.w3.org/2000/svg">
</svg>
<style>
:host {
    box-sizing: border-box;
    display: block;
    position: absolute;
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

.currently-wrapped {
    width: 100%;
    height: 100%;
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
        this.setDefaultImage = this.setDefaultImage.bind(this);
        this.onClick = this.onClick.bind(this);
        this.initCustomHaloButton = this.initCustomHaloButton.bind(this);
        this.updateImageLink = this.updateImageLink.bind(this);
        this.updateSizingForViewport = this.updateSizingForViewport.bind(this);
    }

    afterModelSet(){
        // prop changes
        this.onPropChange("imageData", (imageData) => {
            if(!imageData){
                this.setDefaultImage();
            }
            this.updateImageData(imageData);
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
        if(!currentImageData){
            if(currentSrc){
                let msg = {
                    type: 'command',
                    commandName: 'loadImageFrom',
                    args: [ currentSrc ]
                };
                this.model.sendMessage(msg, this.model);
            } else {
                this.setDefaultImage();
            }
        } else {
            this.updateImageData(currentImageData);
        }
    }

    afterConnected(){
        if(!this.haloButton){
            this.initCustomHaloButton();
        }
    }

    afterDisconnected(){
    }

    setDefaultImage(){
        this.model.partProperties.setPropertyNamed(this.model, "imageData", pictureIcon);
        this.model.partProperties.setPropertyNamed(this.model, "mimeType", "image/svg");
        this.model.partProperties.setPropertyNamed(this.model, "src", "");
        this.updateImageData(pictureIcon);
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
            //this.updateSizingForViewport();
        };
        this.preserveAspectOnResize = true;
        imgEl.classList.remove('hidden');
    }

    updateSvgImage(imageData){
        let imgEl = this._shadowRoot.getElementById('wrapped-image');
        let currentSvgEl = this._shadowRoot.getElementById('wrapped-svg');
        let parser = new DOMParser();
        let xmlDocument = parser.parseFromString(imageData, 'application/xml');
        let newSvgEl = xmlDocument.documentElement;

        // Ensure that the SVG has some width and height attributes
        // set so we have initial dimensions to display. If not present,
        // pull from viewbox.
        if(!newSvgEl.hasAttribute('width') || !newSvgEl.hasAttribute('height')){
            let viewBox = newSvgEl.getAttribute('viewBox');
            if(viewBox){
                viewBox = viewBox.split(" ");
                let viewBoxWidth = parseInt(viewBox[2]);
                let viewBoxHeight = parseInt(viewBox[3]);
                newSvgEl.setAttribute('height', viewBoxHeight);
                newSvgEl.setAttribute('width', viewBoxWidth);
            }
        } 
        newSvgEl.id = 'wrapped-svg';
        newSvgEl.classList.add('currently-wrapped');
        imgEl.classList.add('hidden');
        imgEl.classList.remove('currently-wrapped');
        currentSvgEl.remove();
        this._shadowRoot.appendChild(newSvgEl);
        this.updateSizingForViewport();
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

    updateSizingForViewport(){
        // Ensure that this component does not display larger
        // than the current remaining subrectangle of its origin
        // and the corner of the viewport
        let padding = 40;
        // First, we need to find the absolute top corner
        // locations for the element
        let el = this._shadowRoot.querySelector('.currently-wrapped');
        let top = 0;
        let left = 0;
        while(el){
            top += el.offsetTop;
            left += el.offsetLeft;
            el = el.offsetParent;
        }

        let rect = this.getBoundingClientRect();
        let heightLimit = document.documentElement.clientHeight - padding;
        if((rect.height + top) > heightLimit){
            let ratio = (heightLimit - top) / rect.height;
            // this.style.height = `${rect.height * ratio}px`;
            // this.style.width = `${rect.width * ratio}px`;
            this.model.partProperties.setPropertyNamed(
                this.model,
                'width',
                (rect.width * ratio)
            );
            this.model.partProperties.setPropertyNamed(
                this.model,
                'height',
                (rect.height * ratio)
            );
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
            //wrappedImage.style.width = `${newWidth}px`;
            //wrappedImage.style.height = `${newHeight}px`;
        }

        if(newWidth && newHeight){
            // this.style.width = `${newWidth}px`;
            // this.style.height = `${newHeight}px`;
            this.model.partProperties.setPropertyNamed(
                this.model,
                'width',
                newWidth
            );
            this.model.partProperties.setPropertyNamed(
                this.model,
                'height',
                newHeight
            );
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

    addContextMenuItems(contextMenu){
        contextMenu.addSpacer();
        contextMenu.addListItem(
            'Edit Image URL',
            this.updateImageLink
        );
    }
};

export {
    ImageView,
    ImageView as default
};
