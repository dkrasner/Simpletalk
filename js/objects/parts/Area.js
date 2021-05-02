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
            "resource",
            "drawing",
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
            50
        );
        this.partProperties.setPropertyNamed(
            this,
            'height',
            50
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
            0
        );
        sides.forEach((s) => {
            this.partProperties.setPropertyNamed(
                this,
                `border-${s}-width`,
                1,
            );
        });
        sides.forEach((s) => {
            this.partProperties.setPropertyNamed(
                this,
                `border-${s}-color`,
                "rgb(238, 238, 238)",
            );
        });
        sides.forEach((s) => {
            this.partProperties.setPropertyNamed(
                this,
                `border-${s}-transparency`,
                0.5,
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
