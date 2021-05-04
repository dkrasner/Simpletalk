import {Part} from './Part.js';
import {
    addBasicStyleProps,
    addPositioningStyleProps,
    addTextStyleProps
} from '../utils/styleProperties.js';

class Resource extends Part {
    constructor(owner, src, name) {
        super(owner);
        this.resource = null;

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

        this.partProperties.newDynamicProp(
            "resourceName",
            (owner, prop, value, notify) => {
                if(!window.System.availableResources || !window.System.availableResources[value]){
                    // TODO this should be a ST error
                    throw Error(`resource ${value} not found`);
                }
                prop._value = value;
                this.resource = window.System.availableResources[value];
            },
            (owner, prop) => {
                return prop._value;
            },
            false, // not read only
            ''     // default is empty string
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
        this.resource.load(sourceUrl);
    }

    get(senders, ...args){
        this.resource.get(...args).then((response) => {
            this.partProperties.setPropertyNamed(this, "response", response);
        });
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
