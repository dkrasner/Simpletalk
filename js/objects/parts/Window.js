/**
 * Window Part
 * ------------------------
 * A Window is a Part that wraps another
 * Part of type Card, Stack, or WorldStack
 * in a moveable window.
 * I can also optionally hold a reference
 * to a target Part that I do not own. I call
 * this JS property target and I store the
 * target part's id as a HyperTalk property
 * called targetId.
 * When my owner part is the current view, I
 * will be visible on top of everything else.
 */
import Part from './Part.js';

class Window extends Part {
    constructor(owner, name, target){
        super(owner, name);

        this.acceptedPartTypes = [
            'card',
            'stack',
            'world'
        ];

        // If we pass in a target,
        // set it.
        if(target){
            this.setTarget(target);
        }

        // Set up Window specific
        // part ptoperties
        this.partProperties.newBasicProp(
            'targetId',
            null
        );

        this.partProperties.newBasicProp(
            'title',
            `A Window ${this.id}`
        );

        this.partProperties.newBasicProp(
            'isResizable',
            true
        );

        // Bind methods
        this.setTarget = this.setTarget.bind(this);
    }

    setTarget(aPart){
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

    /**
     * Override
     * Unlike other kinds of Parts, a window
     * has only one subpart, which should be
     * Card, Stack, or WorldStack.
     */
    addPart(aPart){
        let isValid = this.acceptedPartTypes.includes(aPart.type);
        if(!isValid){
            // Consider replacing this generic exception
            // with a message based approach that sends
            // these sorts of non-fatal errors to System
            // as a kind of message. This way we can display
            // errors in SimpltTalk objects.
            throw new Error(`Windows cannot wrap parts of type ${aPart.type}`);
        }
        this.subparts.forEach(subpart => {
            this.removePart(subpart);
        });
        this.subparts.push(aPart);
        aPart._owner = this;
    }

    checkSubpartValidity(aPart){
        return aPart.type == 'window';
    }

    delegateMessage(aMessage){
        this.sendMessage(aMessage, this._owner);
    }

    get type(){
        return 'window';
    }
};

export {
    Window,
    Window as default
}
