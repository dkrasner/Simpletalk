/**
 * Window Part
 * ------------------------
 * A Window is a Part that wraps another
 * Part of type Card, Stack, or WorldStack
 * in a moveable window.
 * I call this, my sole subpart, my "target".
 * When my owner part is the current view, I
 * will be visible on top of everything else.
 */
import Part from './Part.js';

class Window extends Part {
    constructor(owner, name, target){
        super(owner, name);

        this.allowedTargetTypes = [
            'card',
            'stack',
            'world'
        ];
        this.setTarget(target);

        // Set up Window specific
        // part ptoperties
        this.partProperties.newBasicProp(
            'targetId',
            null
        );

        // Bind methods
        this.setTarget = this.setTarget.bind(this);
    }

    setTarget(aPart){
        let isValid = this.allowedTargetTypes.includes(aPart.type);
        if(!isValid){
            // We can replace this JS error throw
            // with some kind of message delegated
            // to the System that handles runtime errors
            // that should not be fatal
            throw new Error(`Windows cannot have targets of type ${aPart.type}`);
        }

        this.target = aPart;
        this.partProperties.setPropertyNamed(
            this,
            'targetId',
            this.target.id
        );
    }

    unsetTarget(){
        this.target = null;
        this.partProperties.setPropertyNamed(
            this,
            'targetId',
            null
        );
    }
};
