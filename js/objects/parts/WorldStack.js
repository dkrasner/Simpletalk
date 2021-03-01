/**
 * WorldStack
 * ---------------------------------------------------
 * I am a Stack part that represents the root of a
 * hierarchy of parts. I am the end of the ownership
 * chain for any given configuration of Parts.
 * I am also the final resolver of all unhandled
 * messages sent along the delegation chain for parts.
 * All parts can eventually resolve to me via the delegation
 * chain or ownership hierarchy.
 * There should only be one instance of me in any given
 * SimpleTalk environment.
 */
import Part from './Part.js';


class WorldStack extends Part {
    constructor(){
        super(null);

        this.acceptedSubpartTypes = ["stack"];

        // The currentStack is the
        // stack that should be currently displayed.
        this.currentStack = null; // TODO

        this.isWorld = true;

        // Add additional properties
        this.partProperties.newBasicProp(
            'currentStack',
            -1
        );

        // Set the id property to always
        // be 'world'
        this.id = 'world';
    }

    get type(){
        return 'world';
    }

    get loadedStacks(){
        return this.subparts.filter(subpart => {
            return subpart.type == 'stack';
        });
    }

    // Override normal Part serialization.
    // Here we need to also include an array of ids of
    // loaded stacks and the id of the current stack
    serialize(){
        let currentStackId;
        if(this.currentStack){
            currentStackId = this.currentStack.id;
        } else {
            currentStackId = null;
        }
        let result = {
            type: this.type,
            id: this.id,
            properties: [],
            subparts: this.subparts.map(subpart => {
                return subpart.id;
            }),
            ownerId: null,
            loadedStacks: (this.loadedStacks.map(stack => {
                return stack.id;
            })),
            currentStack: currentStackId
        };

        // Serialize current part properties
        // values
        this.partProperties._properties.forEach(prop => {
            let name = prop.name;
            let value = prop.getValue(this);
            result.properties[name] = value;
        });
        return result;
    }

    // Override for delegation.
    // We send any messages that should be delegated
    // to the global System object, which has any
    // 'handlers of last resort'
    delegateMessage(aMessage){
        return this.sendMessage(aMessage, window.System);
    }

    static fromSerialized(ownerId, json){
        // Unlike the default Part.js implementation,
        // the WorldStack will not have any ownerId
        // since it is the root in the hierarchy.
        // so it ignores the first value passed in
        let instance = new this();
        instance.setFromDeserialized(json);
        return instance;
    }
};

export {
    WorldStack,
    WorldStack as default
};
