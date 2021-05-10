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
            "notReady"
        );

        this.partProperties.newBasicProp(
            "prerequisite",
            null
        );

        this.partProperties.newBasicProp(
            "resourceName",
            null
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
        this.setPrivateCommandHandler("setSourceTo", this.setSourceTo);
        this.setPrivateCommandHandler("get", this.get);

        // Bind component methods
        this.loadResource = this.loadResource.bind(this);
        this.get = this.get.bind(this);
        this.reset = this.reset.bind(this);

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

    loadResource(senders, resourceName){
        if(!window.System.availableResources || !window.System.availableResources[resourceName]){
            // TODO this should be a ST error
            throw Error(`resource ${resourceName} not found`);
        }
        this.resource = window.System.availableResources[resourceName];
        this.partProperties.setPropertyNamed(this, "resourceName", resourceName);
        // we can't guarantee the state of a resource and so it should be re-set every time
        this.reset();
    }

    setSourceTo(senders, sourceUrl){
        if(!this.resource){
            // TODO this should be a ST error
            throw Error(`no resource loaded for resource part id ${this.id}`);
        }
        this.partProperties.setPropertyNamed(this, "src", sourceUrl);
        this.resource.load(sourceUrl);
        // we can't guarantee the state of a resource and so it should be re-set every time
        this.reset();

    }

    get(senders, ...args){
        this.partProperties.setPropertyNamed(this, "readyState", "fetching");
        let prerequisite = this.partProperties.getPropertyNamed(this, "prerequisite");
        this.resource.get(prerequisite, ...args).then((response) => {
            this.partProperties.setPropertyNamed(this, "response", response);
            this.partProperties.setPropertyNamed(this, "readyState", "ready");
        });
    }

    reset(){
        this.partProperties.setPropertyNamed(this, "readyState", "notReady");
        this.partProperties.setPropertyNamed(this, "response", null);
    }
};

export {
    Resource,
    Resource as default
};
