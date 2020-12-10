/**
 * Container
 * ----------------------------------
 * I am a Container Part.
 * I represent a 'grouping' of subparts within
 * my owner part.
 * I contain the Layout properties set, and therefore
 * can display my contained subparts according to a
 * different layout than my ancestor Card.
 *
 */
import {Part} from './Part.js';
import {
    addLayoutProperties
} from '../properties/LayoutProperties.js';
// ok

class Container extends Part {
    constructor(owner, name){
        super(owner);
        addLayoutProperties(this);

        // accept all subparts
        this.acceptedSubpartTypes = ["*"];
    }

    get type(){
        return 'container';
    }
};

export {
    Container,
    Container as default
};
