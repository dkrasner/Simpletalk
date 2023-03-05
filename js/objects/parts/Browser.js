import { Part } from './Part.js';
import {
    addBasicStyleProps,
    addPositioningStyleProps,
} from '../utils/styleProperties.js';

class Browser extends Part {
    constructor(owner, src) {
        super(owner);

        // Properties
        this.partProperties.newBasicProp(
            "src",
            null
        );

        this.src = null;
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

        this.partProperties.newBasicProp(
            "iframe",
            null
        );

        // Private command handlers
        this.setPrivateCommandHandler("setURLTo", this.setURL);
        this.setPrivateCommandHandler("setIFrameTo", this.setIFrame);
        this.setPrivateCommandHandler("forward", this.sendMessageToBrowser);

        // Bind component methods
        this.setURL = this.setURL.bind(this);
        this.sendMessageToBrowser = this.sendMessageToBrowser.bind(this);


        // load the src if provided
        if (src) {
            this.partProperties.setPropertyNamed(this, "src", src);
        }
        // Style properties
        addBasicStyleProps(this);
        addPositioningStyleProps(this);
        this.setupStyleProperties();
        this.partProperties.setPropertyNamed(
            this,
            'background-transparency',
            0,
            true, // notify
            true // set default
        );
        ["right", "left", "top", "bottom"].forEach((side) => {
            this.partProperties.setPropertyNamed(
                this,
                `border-${side}-width`,
                5,
                true, // notify
                true // set default
            );
        });
        this.partProperties.setPropertyNamed(
            this,
            "width",
            400,
            true, // notify
            true // set default
        );
    }

    get type() {
        return 'browser';
    }

    setURL(senders, sourceUrl) {
        this.partProperties.setPropertyNamed(this, "src", sourceUrl);
    }

    setIFrame(senders, iframe) {
        this.partProperties.setPropertyNamed(this, "iframe", iframe);
    }

    sendMessageToBrowser(senders, message) {
        let views = window.System.findViewsById(this.id);
        views.forEach((v) => {
            let iframe = v._shadowRoot.querySelector("iframe");
            iframe.contentWindow.postMessage(message, window.origin);
        });
    }
}

export {
    Browser,
    Browser as default
};
