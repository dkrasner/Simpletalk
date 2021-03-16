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

        // Bind navigation methods
        this.goToNextStack = this.goToNextStack.bind(this);
        this.goToPrevStack = this.goToPrevStack.bind(this);
        this.goToNthStack = this.goToNthStack.bind(this);
        this.goToStackById = this.goToStackById.bind(this);
    }

    goToNextStack(){
        let stacks = this.subparts.filter(subpart => {
            return subpart.type == 'stack';
        });
        if(stacks.length < 2){
            return;
        }
        let current = stacks.find(stack => {
            return stack._current == true;
        });
        let currentIdx = stacks.indexOf(current);
        console.log(`currentIdx: ${currentIdx}`);
        let nextIdx = currentIdx + 1;
        if(nextIdx >= stacks.length){
            nextIdx = (nextIdx % stacks.length);
        }
        console.log(`nextIdx: ${nextIdx}`);
        let nextStack = stacks[nextIdx];
        nextStack.partProperties.setPropertyNamed(
            nextStack,
            'current',
            true
        );
    }

    goToStackById(anId){
        let stacks = this.subparts.filter(subpart => {
            return subpart.type == 'stack';
        });
        let found = stacks.find(stack => {
            return stack.id == anId;
        });
        if(!found){
            throw new Error(`The stack id: ${anId} cant be found on this stack`);
        }
        found.partProperties.setPropertyNamed(
            found,
            'current',
            true
        );
    }

    goToPrevStack(){
        let stacks = this.subparts.filter(subpart => {
            return subpart.type == 'stack';
        });
        if(stacks.length < 2){
            return;
        }
        let current = stacks.find(stack => {
            return stack._current == true;
        });
        let currentIdx = stacks.indexOf(current);
        let nextIdx = currentIdx - 1;
        if(nextIdx < 0){
            nextIdx = stacks.length + nextIdx;
        }
        let nextStack = stacks[nextIdx];
        nextStack.partProperties.setPropertyNamed(
            nextStack,
            'current',
            true
        );
    }

    goToNthStack(anIndex){
        // NOTE: We are using 1-indexed values
        // per the SimpleTalk system
        let trueIndex = anIndex - 1;
        let stacks = this.subparts.filter(subpart => {
            return subpart.type == 'stack';
        });
        if(trueIndex < 0 || trueIndex > stacks.length -1){
            throw new Error(`Cannot navigate to stack number ${anIndex} -- out of bounds`);
        }
        let nextStack = stacks[trueIndex];
        nextStack.partProperties.setPropertyNamed(
            nextStack,
            'current',
            true
        );
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
