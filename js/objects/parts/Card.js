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
            "window", "button",
            "field", "area", "drawing",
            "image", "audio", "browser", "resource"
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

        // Styling
        addBasicStyleProps(this);
        addLayoutStyleProps(this);
        this.setupStyleProperties();
        // part specific default style properties
        this.partProperties.setPropertyNamed(
            this,
            'background-color',
            "rgb(0, 75, 103)" // palette-blue
        );

        // remove the halo property and command handlers as these do not makes sense here
        let haloOpenProp = this.partProperties.findPropertyNamed("halo-open");
        if(haloOpenProp){
            this.partProperties.removeProperty(haloOpenProp);
        }
        this.removePrivateCommandHandler("openHalo");
        this.removePrivateCommandHandler("closeHalo");
    }

    get type(){
        return 'card';
    }
};

export {
    Card,
    Card as default
};
