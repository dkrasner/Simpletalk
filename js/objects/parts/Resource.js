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

        // Bind component methods
        this.loadResource = this.loadResource.bind(this);
        this.get = this.get.bind(this);

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

    get(senders, ...args){
        let sourceUrl = this.partProperties.getPropertyNamed(this, "src");
        fetch(sourceUrl)
            .then(response => {
                console.log(response);
                this.partProperties.setPropertyNamed(this, "response", response);
            })
            .catch(err => {
                console.error(err);
            });
    }
};

export {
    Resource,
    Resource as default
};
