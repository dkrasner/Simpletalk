/**
 * EricField Part
 * -------------------------
 * I represent an "interim" Field type part,
 * which stores text that can be edited by
 * the user.
 * I should be replaced eventually by a more
 * comprehensive and capable Field part.
 * For now, I can store and access my text
 * contents.
 * My specific interim purpose is to enable
 * basic Part script viewing an editing
 */
import Part from './Part.js';

class EricField extends Part {
    constructor(owner, name){
        super(owner, name);

        // Set basic properties
        this.partProperties.newBasicProp(
            'textContent',
            ''
        );
    }

    delegateMessage(aMessage){
        this.sendMessage(
            aMessage,
            this._owner
        );
    }

    // For now, EricFields don't accept
    // any subparts
    acceptsSubpart(aPart){
        return false;
    }

    get type(){
        return 'eric-field';
    }
};

export {
    EricField,
    EricField as default
};
