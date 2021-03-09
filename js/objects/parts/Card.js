/**
 * Card
 * --------------------------
 * I am a Card Part.
 * I represent a collection of Parts that is
 * displayed on the screen. My owner is always
 * a Stack Part.
 * I can contain any kind of Part, including
 * buttons and fields.
 */
import {Part} from './Part.js';
import {
    BasicProperty
} from '../properties/PartProperties.js';

import {
    addBasicStyleProps,
    addLayoutStyleProps
} from '../utils/styleProperties.js';

class Card extends Part {
    constructor(owner, name){
        super(owner);
        this.stack = this._owner;
        this.acceptedSubpartTypes = [
            "button", "button-editor", "field", "field", "area", "drawing", "image"
        ];
        this.isCard = true;

        // Add Card-specific part
        // properties
        this.partProperties.newBasicProp(
            'marked',
            false
        );
        this.partProperties.newBasicProp(
            'cantDelete',
            false
        );
        this.partProperties.newBasicProp(
            'dontSearch',
            false
        );
        this.partProperties.newBasicProp(
            'showPict',
            false
        );

        // If we are initializing with a name
        // set the name property
        if(name){
            this.partProperties.setPropertyNamed(
                this,
                'name',
                name
            );
        }

        // Cards can set their own current-ness
        this._current = false;
        this.partProperties.newDynamicProp(
            'current',
            this.setCurrent,
            function(){
                return this._current;
            }
        );

        // set up DOM events to be handled
        this.partProperties.setPropertyNamed(
            this,
            'events',
            new Set(['click', 'dragenter', 'dragover', 'drop'])
        );

        // Bind methods
        this.setCurrent = this.setCurrent.bind(this);

        // Styling
        addBasicStyleProps(this);
        addLayoutStyleProps(this);
        this.setupStyleProperties();
    }

    setCurrent(propOwner, property, value){
        // If setting current-ness to false,
        // we simply update the private property.
        // Otherwise, we go through all sibling Cards
        // and set theirs to false first, then set
        // this Card's _current to true
        if(value == false){
            propOwner._current = false;
        } else {
            propOwner._owner.subparts.filter(subpart => {
                return subpart.type == 'card';
            }).forEach(sibling => {
                sibling.partProperties.setPropertyNamed(
                    sibling,
                    'current',
                    false
                );
            });
            propOwner._current = true;
        }
    }
    
    get type(){
        return 'card';
    }
};

export {
    Card,
    Card as default
};
