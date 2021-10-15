import {Part} from './Part.js';

import {
    addBasicStyleProps,
    addPositioningStyleProps
} from '../utils/styleProperties.js';

class Image extends Part {
    constructor(owner, src) {
        super(owner);

        // Properties
        this.partProperties.newBasicProp(
            "src",
            null
        );

        this.partProperties.newBasicProp(
            "mimeType",
            "unknown"
        );

        this.partProperties.newBasicProp(
            "imageData",
            null
        );

        this.partProperties.newBasicProp(
            'draggable',
            false
        );

        // Style properties
        addBasicStyleProps(this);
        addPositioningStyleProps(this);
        this.setupStyleProperties();
        // part specific default style properties
        this.partProperties.setPropertyNamed(
            this,
            'background-transparency',
            0
        );
        this.partProperties.setPropertyNamed(
            this,
            'background-color',
            "black"
        );

        // Private command handlers
        this.setPrivateCommandHandler("loadImageFrom", this.loadImageFromSource);
        this.setPrivateCommandHandler("loadImageFromFile", this.loadImageFromFile);

        // Bind component methods
        this.loadImageFromSource = this.loadImageFromSource.bind(this);
        this.loadImageFromFile = this.loadImageFromFile.bind(this);
    }

    loadImageFromSource(senders, url){
        this.partProperties.setPropertyNamed(
            this,
            'src',
            url
        );
    }

    loadImageFromFile(){
        let filePicker = document.createElement('input');
        filePicker.type = 'file';
        filePicker.setAttribute('accept', 'image/*');
        filePicker.style.display = 'none';
        filePicker.addEventListener('change', (event) => {
            // Handle the file here
            let reader = new FileReader();
            reader.onloadend = () => {
                this.partProperties.setPropertyNamed(
                    this,
                    'mimeType',
                    filePicker.files[0].type
                );
                this.partProperties.setPropertyNamed(
                    this,
                    'imageData',
                    reader.result
                );
            };
            let imageFile = filePicker.files[0];
            if(imageFile.type.includes('svg')){
                reader.readAsText(imageFile);
            } else {
                reader.readAsDataURL(imageFile);
            }
            filePicker.remove();
        });
        document.body.append(filePicker);
        filePicker.click();
    }

    get type(){
        return 'image';
    }

    get isSvg(){
        let mimeType = this.partProperties.getPropertyNamed(
            this,
            "mimeType"
        );
        if(!mimeType){
            return false;
        }

        return mimeType.startsWith('image/svg');
    }
};

export {
    Image,
    Image as default
};
