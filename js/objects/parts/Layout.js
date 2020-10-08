/**
 * Layout
 * ----------------------------------
 * I am a "grouping" of Parts within a Card.
 * I have properties that specify the layout of
 * my subparts within my bounds visually.
 */
import Part from './Part.js';

class Layout extends Part {
    constructor(owner, name){
        super(owner, name);

        // Add properties
        this.partProperties.newBasicProp(
            'horizontalResizing',
            ''
        );
        this.partProperties.newBasicProp(
            'verticalResizing',
            ''
        );
        this.partProperties.newBasicProp(
            'listDirection',
            'column'
        );
    }

    get type(){
        return 'layout';
    }
};

export {
    Layout,
    Layout as default
};
