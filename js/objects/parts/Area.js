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

class Area extends Part {
    constructor(...args){
        super(...args);

        // Add style props
        addBasicStyleProps(this);
        addPositioningStyleProps(this);
        addLayoutStyleProps(this);
        this.setupStyleProperties();
    }
};

export {
    Area,
    Area as default
};
