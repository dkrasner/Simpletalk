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

        // Styling
        this.partProperties.newStyleProp(
            'background-color',
            null,
        );
        this.partProperties.newStyleProp(
            'width',
            "300px",
        );
        this.partProperties.newStyleProp(
            'height',
            "200px",
        );
        this.partProperties.newStyleProp(
            'top',
            "0",
        );
        this.partProperties.newStyleProp(
            'left',
            "0",
        );
        this.partProperties.newStuyleProp(
            'rotate',
            null
        );
        this.partProperties.newStyleProp(
            'hide',
            false,
        );
        this.partProperties.newStyleProp(
            'transparency',
            1.0,
        );
        this.setupStyleProperties();
    }

    get type(){
        return 'container';
    }
};

export {
    Container,
    Container as default
};
