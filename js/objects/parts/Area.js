/**
 * Area
 * ----------------------------------
 * I am a Area Part.
 * I represent a 'grouping' of subparts within
 * my owner part.
 * I contain the Layout properties set, and therefore
 * can display my contained subparts according to 
 * different layout properties than my ancestor
 * Card.
 *
 */
import {Part} from './Part.js';
import {
    addBasicStyleProps,
    addPositioningStyleProps,
    addLayoutStyleProps
} from '../utils/styleProperties.js';

const sides = ["top", "bottom", "left", "right"];

class Area extends Part {
    constructor(...args){
        super(...args);

        this.acceptedSubpartTypes = [
            "area",
            "button",
            "field",
            "image",
            "audio",
            "video",
            "resource",
            "drawing",
            "browser",
            "window"
        ];

        // Add style props
        addBasicStyleProps(this);
        addPositioningStyleProps(this);
        addLayoutStyleProps(this);

        // Set default width and height
        // for an empty area
        this.partProperties.setPropertyNamed(
            this,
            'width',
            400,
            true, // notify
            true // set default
        );
        this.partProperties.setPropertyNamed(
            this,
            'height',
            200,
            true, // notify
            true // set default
        );
        this.partProperties.newBasicProp(
            'clipping',
            false
        );
        this.partProperties.newBasicProp(
            'allow-scrolling',
            false
        );
        this.setupStyleProperties();
        // part specific default style properties
        this.partProperties.setPropertyNamed(
            this,
            'background-transparency',
            0,
            true, // notify
            true // set default
        );
        sides.forEach((s) => {
            this.partProperties.setPropertyNamed(
                this,
                `border-${s}-width`,
                1,
                true, // notify
                true // set default
            );
        });
        sides.forEach((s) => {
            this.partProperties.setPropertyNamed(
                this,
                `border-${s}-color`,
                "rgb(107, 153, 87)",
                true, // notify
                true // set default
            );
        });
        sides.forEach((s) => {
            this.partProperties.setPropertyNamed(
                this,
                `border-${s}-transparency`,
                0.5,
                true, // notify
                true // set default
            );
        });
    }


    get type(){
        return 'area';
    }
};

export {
    Area,
    Area as default
};
