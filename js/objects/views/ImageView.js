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
        this.loadImageFromSource = this.loadImageFromSource.bind(this);
        this.initCustomHaloButton = this.initCustomHaloButton.bind(this);
        this.updateImageLink = this.updateImageLink.bind(this);
        this.updateSizingForViewport = this.updateSizingForViewport.bind(this);
    }

    afterModelSet(){

        // If the imageData property has a valid value,
        // we want to update the actual image but also
        // clear any `src` property value (without notifying,
        // to prevent infinite recursion)
        this.onPropChange('imageData', (imageData) => {
            if(imageData && imageData !== ""){
                this.model.partProperties.setPropertyNamed(
                    this.model,
                    'src',
                    "",
                    false // do not notify
                );
                this.updateImageData(imageData);
            }
        });

        // If the src property changes, there are a couple
        // of possibilities:
        // 1. There is a valid URL. We reload the image and
        // update all associated properties;
        // 2. There is an invalid URL, but there is imageData
        // present. We do nothing.
        // 3. There is an invalid URL and no imageData present.
        // we load the default placeholder image.
        this.onPropChange('src', (src) => {
            let urlIsValid = (src && src !== "");
            let existingImageData = this.model.partProperties.getPropertyNamed(
                this.model,
                'imageData'
            );
            if(urlIsValid){
                this.loadImageFromSource(src);
            } else {
                this.setDefaultImage();
            }
        });
        
        // Make sure we have imageData. If not, try
        // to load from a src.
        let currentSrc = this.model.partProperties.getPropertyNamed(
            this.model,
            "src"
        );
        let currentImageData = this.model.partProperties.getPropertyNamed(
                this.model,
                "imageData"
            );
        if(currentSrc && currentSrc !== ""){
            this.loadImageFromSource(currentSrc);
        } else if(currentImageData){
            this.updateImageData(currentImageData);
        } else {
            this.setDefaultImage();
        }
        // if(!currentImageData){
        //     if(currentSrc){
        //         let msg = {
        //             type: 'command',
        //             commandName: 'loadImageFrom',
        //             args: [ currentSrc ]
        //         };
        //         this.model.sendMessage(msg, this.model);
        //     } else {
        //         this.setDefaultImage();
        //     }
        // } else {
        //     this.updateImageData(currentImageData);
        // }
    }

    afterConnected(){
        if(!this.haloButton){
            this.initCustomHaloButton();
        }
    }

    afterDisconnected(){
    }

    setDefaultImage(){
        this.model.partProperties.setPropertyNamed(this.model, "imageData", pictureIcon, false);
        this.model.partProperties.setPropertyNamed(this.model, "mimeType", "image/svg");
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
        if(result && result !== currentSrc){
            this.model.partProperties.setPropertyNamed(
                this.model,
                'src',
                result
            );
        } else if(result == ""){
            this.model.partProperties.setPropertyNamed(
                this.model,
                'src',
                result
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

    loadImageFromSource(sourceUrl){
        fetch(sourceUrl)
            .then(response => {
                let contentType = response.headers.get('content-type');
                if(!contentType.startsWith('image')){
                    throw new Error(`Invalid image mimeType: ${contentType}`);
                }
                this.model.partProperties.setPropertyNamed(
                    this.model,
                    "mimeType",
                    contentType
                );

                if(contentType.startsWith("image/svg")){
                    return response.text().then(text => {
                        // Set the content of the appropriate area
                        // to be SVG inline markup
                        this.updateSvgImage(text);
                    });
                } else {
                    return response.blob().then(blob => {
                        let reader = new FileReader();
                        reader.onloadend = () => {
                            // Set the binary image data
                            this.updateBinaryImage(reader.result);
                        };
                        reader.readAsDataURL(blob);
                    });
                }
            })
            .catch(err => {
                console.error(err);
                this.model.partProperties.setPropertyNamed(
                    this.model,
                    'src',
                    ""
                );
                this.model.partProperties.setPropertyNamed(
                    this.model,
                    'imageData',
                    null
                );
            });
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
        // If the part is rotated this will throw off the bounding rectangle
        // browser calcualtion. So the hack here is to rotate the part to 0
        // (if necessary) do the calculations and then rotate it back
        let angle = this.model.partProperties.getPropertyNamed(this.model, "rotate");
        if(angle){
            this.model.partProperties.setPropertyNamed(this.model, "rotate", 0);
        }
        let wrappedImage = this._shadowRoot.querySelector('.currently-wrapped');
        let rect = wrappedImage.getBoundingClientRect();
        let newWidth, newHeight;
        if(this.preserveAspectOnResize){
            let maxWidth = rect.width + movementX;
            let maxHeight = rect.height + movementY;
            let ratio = Math.min(maxWidth / rect.width, maxHeight / rect.height);
            newHeight = rect.height * ratio;
            newWidth = rect.width * ratio;
        } else {
            newWidth = rect.width + movementX;
            newHeight = rect.height + movementY;
        }

        if(newWidth && newHeight){
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
        // reset the rotate angle to the original (if necessary)
        if(angle){
            this.model.partProperties.setPropertyNamed(this.model, "rotate", angle);
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
