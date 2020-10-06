import {Part} from './Part.js';

class Svg extends Part {
    constructor() {
        super();
        this.partProperties.newBasicProp("src", null)
    }

    get type(){
        return 'svg';
    }
};

export {
    Svg,
    Svg as default
};
