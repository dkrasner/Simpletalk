import {Part} from './Part.js';

class Ar extends Part {
    constructor(owner, src, name) {
        super(owner);

        // Properties
        this.partProperties.newBasicProp("src", null);
        let mySrc = src || "/images/noun_ar_placeholder.svg";
        this.partProperties.setPropertyNamed(
            this,
            'src',
            mySrc
        );
        let myName = name || `Ar ${this.id}`;
        this.partProperties.setPropertyNamed(
            this,
            'name',
            myName
        );

        // set up DOM events to be handled
        this.partProperties.setPropertyNamed(
            this,
            'events',
            new Set(['click', 'dragstart'])
        );

        this.partProperties.newBasicProp(
            'draggable',
            true
        );

    }

    get type(){
        return 'ar';
    }
};

export {
    Ar,
    Ar as default
};
