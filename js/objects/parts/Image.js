import {Part} from './Part.js';

class Image extends Part {
    constructor(owner, src, name) {
        super(owner);

        // Properties
        this.partProperties.newBasicProp("src", null);
        let mySrc = src || "/images/noun_svg_placeholder.svg";

        this.partProperties.newBasicProp(
            "mimeType",
            "unknown"
        );

        this.partProperties.newBasicProp(
            "imageData",
            null
        );

        this.partProperties.setPropertyNamed(
            this,
            'src',
            mySrc
        );
        let myName = name || `Image ${this.id}`;
        this.partProperties.setPropertyNamed(
            this,
            'name',
            myName
        );

        // set up DOM events to be handled
        this.partProperties.setPropertyNamed(
            this,
            'events',
            new Set(['click', 'dragstart'])
        );

        this.partProperties.newBasicProp(
            'draggable',
            true
        );

        // Private command handlers
        this.setPrivateCommandHandler("loadImageFrom", this.loadImageFromSource);

        // Bind component methods
        this.loadImageFromSource = this.loadImageFromSource.bind(this);
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
            .catch(err => {
                console.error(err);
            });
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
