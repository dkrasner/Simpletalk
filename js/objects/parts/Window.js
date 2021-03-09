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
import Stack from './Stack.js';
import {
    addBasicStyleProps,
    addPositioningStyleProps
} from '../utils/styleProperties.js';

class Window extends Part {
    constructor(owner, name, target, deserializing=false){
        super(owner, name);

        this.acceptedSubpartTypes = [
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
        // Style
        addBasicStyleProps(this);
        addPositioningStyleProps(this);
        this.setupStyleProperties();

        // Bind methods
        this.setTarget = this.setTarget.bind(this);
        this.onWindowClose = this.onWindowClose.bind(this);

        // Add private handlers
        this.setPrivateCommandHandler('windowClose', this.onWindowClose);
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
        let isValid = this.acceptsSubpart(aPart.type);
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

    onWindowClose(senders, ...args){
        // Default behavior is to delete
        // the window model from the System.
        // Scripts can override this handler
        this.sendMessage(
            {
                type: 'command',
                commandName: 'deleteModel',
                args: [ this.id ]
            },
            window.System
        );
    }

    get type(){
        return 'window';
    }

    static fromSerialized(ownerId, json){
        let ownerPart = window.System.partsById[ownerId];
        if(!ownerPart){
            throw new Error(`Could not find owner part id ${ownerId} on deserialization!`);
        }
        let instance = new this(ownerPart, null, null, true);
        instance.setFromDeserialized(json);
        ownerPart.addPart(instance);
        return instance;
    };
}

export {
    Window,
    Window as default
}
