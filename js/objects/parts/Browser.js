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
        this.partProperties.newBasicProp(
            "srcdoc",
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


        // Private command handlers
        this.setPrivateCommandHandler("setURLTo", this.setURL);
        this.setPrivateCommandHandler("setHTMLTo", this.setHTML);
        this.setPrivateCommandHandler("forward", this.forwardMessageFromBrowser);

        // Bind component methods
        this.setURL = this.setURL.bind(this);
        this.forwardMessageFromBrowser = this.forwardMessageFromBrowser.bind(this);


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
        this.partProperties.setPropertyNamed(
            this,
            "height",
            225,
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

    setHTML(senders, HTML) {
        this.partProperties.setPropertyNamed(this, "srcdoc", html);
    }

    forwardMessageFromBrowser(senders, message) {
        let views = window.System.findViewsById(this.id);
        views.forEach((v) => {
            const iframe = v._shadowRoot.querySelector("iframe")
            const body = iframe.contentDocument.querySelector("body");
            const event = new CustomEvent("browserMessage", {
                bubbles: false,
                composed: false, // DOES not go across shadow DOM boundary
                detail: { "message": message }
            });
            body.dispatchEvent(event);
        });
    }
}

export { 
    Browser,
    Browser as default
};
