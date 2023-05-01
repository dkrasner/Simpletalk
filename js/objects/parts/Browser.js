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
        this.partProperties.newDynamicProp(
            "srcdoc",
            (owner, prop, value, notify) => {
                // The DOM Parser is greedy with the <script> and will
                // terminate close at the first </script> instance found,
                // even if this instance is within a string. This causes
                // incomplete parsing and de-serialization fails. To avoid this
                // we replace the <script> tag with a placeholder
                let propVal = value;
                if (propVal) {
                    propVal = propVal.replace(/(&lt;|<)script(&gt;|>)/, "[SCRIPT_TAG_START]");
                    propVal = propVal.replace(/(&lt;|<)\/script(&gt;|>)/, "[SCRIPT_TAG_END]");
                }
                prop._value = propVal;
                // null the srcdoc prop since we can't have both
                owner.partProperties.setPropertyNamed(
                    owner,
                    'src',
                    null,
                    false // do not notify to avoid inf loop
                )
            },
            (owner, prop, serialized) => {
                if (!serialized) {
                    if (prop._value) {
                        // as above we replace the <script> tag placeholders with the original
                        let value = prop._value.replace("[SCRIPT_TAG_START]", "<script>");
                        value = value.replace("[SCRIPT_TAG_END]", "</script>");
                        return value;
                    }
                }
                return prop._value;
            },
            false, // not readonly
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
            iframe.contentWindow.postMessage(message, "*");
        });
    }
}

export { 
    Browser,
    Browser as default
};
