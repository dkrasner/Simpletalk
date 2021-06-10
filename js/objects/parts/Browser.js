import {Part} from './Part.js';
import {
    addBasicStyleProps,
    addPositioningStyleProps,
    addTextStyleProps
} from '../utils/styleProperties.js';

class Browser extends Part {
    constructor(owner, src, name) {
        super(owner);

        // Properties
        this.partProperties.newBasicProp(
            "src",
            null
        );

        this.src = null;
        let myName = name || `Browser ${this.id}`;
        this.partProperties.setPropertyNamed(
            this,
            'name',
            myName
        );

        this.partProperties.newBasicProp(
            'readyState',
            "HAVE_NOTHING"
        );

        this.partProperties.newBasicProp(
            "play",
            false
        );

        this.partProperties.newBasicProp(
            "stop",
            null
        );

        // Private command handlers
        this.setPrivateCommandHandler("setURLTo", this.setURL);
        this.setPrivateCommandHandler("forward", this.sendMessageToBrowser);

        // Bind component methods
        this.setURL = this.setURL.bind(this);
        this.sendMessageToBrowser = this.sendMessageToBrowser.bind(this);


        // load the src if provided
        if(src){
            this.partProperties.setPropertyNamed(this, "src", url);
        }
        // Style properties
        addBasicStyleProps(this);
        addPositioningStyleProps(this);
        this.setupStyleProperties();
        this.partProperties.setPropertyNamed(
            this,
            'background-transparency',
            0
        );
        ["right", "left", "top", "bottom"].forEach((side) => {
            this.partProperties.setPropertyNamed(
                this,
                `border-${side}-width`,
                5
            );
        });
    }

    get type(){
        return 'browser';
    }

    setURL(senders, sourceUrl){
        this.partProperties.setPropertyNamed(this, "src", sourceUrl);
    }

    sendMessageToBrowser(senders, message){
        let views = window.System.findViewsById(this.id);
        views.forEach((v) => {
            let iframe = v._shadowRoot.querySelector("iframe");
            iframe.contentWindow.postMessage(message, window.origin);
        });
    }
};

export {
    Browser,
    Browser as default
};
