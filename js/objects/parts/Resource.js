import {Part} from './Part.js';
import {
    addBasicStyleProps,
    addPositioningStyleProps,
    addTextStyleProps
} from '../utils/styleProperties.js';

class Resource extends Part {
    constructor(owner, src, name) {
        super(owner);

        // Properties
        this.partProperties.newBasicProp(
            "src",
            null
        );

        this.src = null;
        let myName = name || `Resource ${this.id}`;
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
            "prerequisite",
            ""
        );

        this.partProperties.newBasicProp(
            "response",
            null
        );
        // set up DOM events to be handled
        this.partProperties.setPropertyNamed(
            this,
            'events',
            new Set(['mousedown', 'mouseup', 'mouseenter', 'click'])
        );

        // Private command handlers
        this.setPrivateCommandHandler("loadResource", this.loadResource);
        this.setPrivateCommandHandler("get", this.get);
        this.setPrivateCommandHandler("retrieve", this.retrieve);

        // Bind component methods
        this.loadResource = this.loadResource.bind(this);
        this.get = this.get.bind(this);
        this.retrieve = this.retrieve.bind(this);

        // load the src if provided
        if(src){
            this.partProperties.setPropertyNamed(this, "src", url);
        }
        // Style properties
        addBasicStyleProps(this);
        addPositioningStyleProps(this);
        addTextStyleProps(this);
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
                1
            );
        });
    }

    get type(){
        return 'resource';
    }

    loadResource(senders, sourceUrl){
        this.partProperties.setPropertyNamed(this, "src", sourceUrl);
    }

    async get(senders, ...args){
        let sourceUrl = this.partProperties.getPropertyNamed(this, "src");
        let response = await fetch(sourceUrl);
        if (response.ok) { // if HTTP-status is 200-299
            // get the response body (the method explained below)
            let json = await response.json();
            this.partProperties.setPropertyNamed(this, "response", json);
        } else {
            console.error("HTTP-Error: " + response.status);
        }
    }

    retrieve(senders, ...args){
        let key = args[0];
        let response = this.partProperties.getPropertyNamed(this, "response");
        if(response){
            return response[key];
        }
    }
};

export {
    Resource,
    Resource as default
};
