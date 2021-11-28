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
            0,
            true, // notify
            true  // set default
        );
        this.partProperties.setPropertyNamed(
            this,
            'background-color',
            "black",
            true, // notify
            true  // set default
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

    /**
     * Serialize this Part's state as JSON.
     * By default, we do not serialize specific
     * PartCollection information (recursively),
     * and only include basics including the current
     * state of all properties.
     * ---
     * Note: Here we override the default implementation
     * in order to account for src/imageData property
     * serialization logic
     */
    serialize(){
        let ownerId = null;
        if(this._owner){
            ownerId = this._owner.id;
        }
        let result = {
            type: this.type,
            id: this.id,
            properties: {},
            subparts: this.subparts.map(subpart => {
                return subpart.id;
            }),
            ownerId: ownerId
        };

        // Grab the current image src url value
        // and the current imageData value
        let url = this.partProperties.getPropertyNamed(
            this,
            'src'
        );
        let urlIsValid = (url && url !== "");
        let currentData = this.partProperties.getPropertyNamed(
            this,
            'imageData'
        );
        this.partProperties._properties.filter(prop => {
            return prop.getValue(this) !== prop.default;
        }).forEach(prop => {
            let name = prop.name;
            // due to race-conditions incurred if the editor is
            // open before world we exclude `editor-open` from serialization
            if(name == "editor-open"){
                return;
            }
            let value = prop.getValue(this);
            if(name == "imageData"){
                if(!urlIsValid){
                    result.properties.imageData = value;
                    result.properties.src = null;
                } else {
                    result.properties.imageData = null;
                }
            } else {
                result.properties[name] = value;
            }
        });
        return result;
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
