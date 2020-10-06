/**
 * Basic User Drawing Part
 */
import {Part} from './Part.js';

class Drawing extends Part {
    constructor(owner){
        super(owner);

        // Set new properties for this
        // part type
        this.partProperties.newBasicProp(
            'image',
            null
        );

        // Adjust any properties as needed
        this.partProperties.setPropertyNamed(
            this,
            'width',
            250
        );
        this.partProperties.setPropertyNamed(
            this,
            'height',
            250
        );
    }

    get type(){
        return 'drawing';
    }
};

export {
    Drawing,
    Drawing as default
};
