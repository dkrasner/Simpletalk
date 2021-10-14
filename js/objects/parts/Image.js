import {Part} from './Part.js';

import {
    addBasicStyleProps,
    addPositioningStyleProps
} from '../utils/styleProperties.js';

class Image extends Part {
    constructor(owner, src) {
        super(owner);

        // Properties
        this.partProperties.newDynamicProp(
            "src",
            this.setSource,
            this.getSource
        );

        this._src = src;

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

        this.partProperties.newBasicProp(
            'force-serialization',
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


    loadImageFromSource(senders, sourceUrl){
        fetch(sourceUrl)
            .then(response => {
                let contentType = response.headers.get('content-type');
                if(!contentType.startsWith('image')){
                    throw new Error(`Invalid image mimeType: ${contentType}`);
                }
                this.partProperties.setPropertyNamed(
                    this,
                    "mimeType",
                    contentType
                );
                if(contentType.startsWith("image/svg")){
                    return response.text().then(text => {
                        this.partProperties.setPropertyNamed(
                            this,
                            'imageData',
                            text
                        );
                    });
                } else {
                    return response.blob().then(blob => {
                        let reader = new FileReader();
                        reader.onloadend = () => {
                            this.partProperties.setPropertyNamed(
                                this,
                                'imageData',
                                reader.result // will be the base64 encoded data
                            );
                        };
                        reader.readAsDataURL(blob);
                    });
                }
            })
            .then(() => {
                // Manually set the _src.
                // This ensures that we don't infinitely
                // call the load operation
                this._src = sourceUrl;
            })
            .catch(err => {
                console.error(err);
                this.partProperties.setPropertyNamed(
                    this,
                    'imageData',
                    null
                );
            });
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

    setSource(owner, property, value){
        owner._src = value;
        if(value){
            owner.loadImageFromSource([this], value);
        }
    }

    getSource(owner, property){
        return owner._src;
    }

    /**
     * Serialize this Part's state as JSON.
     * By default, we do not serialize specific
     * PartCollection information (recursively),
     * and only include basics including the current
     * state of all properties.
     * For Image Parts, we also use a combination of
     * the presence of a source URL and/or the
     * `force-serialization` property to determine
     * whether or not we serialize the `imageData` prop
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
        this.partProperties._properties.forEach(prop => {
            let name = prop.name;
            let value = prop.getValue(this);
            if(name == 'imageData'){
                // We only want to serialize image
                // data in cases where:
                // 1. There no URL specified, but the
                // part has imageData set;
                // 2. The `force-serialization` property is
                // set to true
                let url = this.partProperties.getPropertyNamed(this, 'src');
                let hasUrl = (url != null && url != undefined && url != "");
                let forceSerialization = this.partProperties.getPropertyNamed(this, 'force-serialization');
                if(hasUrl && !forceSerialization){
                    result.properties.imageData = null;
                } else {
                    result.properties.imageData = value;
                }
            } else if(value !== prop.default){
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
