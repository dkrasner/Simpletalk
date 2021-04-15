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

        this.acceptedSubpartTypes = ["stack", "image"];

        this.isWorld = true;

        // This property specifies the stack
        // index of the current stack (0-indexed)
        this.partProperties.newBasicProp(
            'current',
            0
        );

        // Set the id property to always
        // be 'world'
        this.id = 'world';

        // Bind general methods
        this.sendOpenStackTo = this.sendOpenStackTo.bind(this);
        this.sendCloseStackTo = this.sendCloseStackTo.bind(this);

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
        let currentIdx = this.currentStackIndex;
        let currentStack = stacks[currentIdx];
        let nextIdx = currentIdx + 1;
        if(nextIdx >= stacks.length){
            nextIdx = (nextIdx % stacks.length);
        }
        this.partProperties.setPropertyNamed(
            this,
            'current',
            nextIdx
        );
        let nextStack = stacks[nextIdx];
        if(currentStack.id != nextStack.id){
            this.sendCloseStackTo(currentStack);
            this.sendOpenStackTo(nextStack);
        }
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
        let currentStack = this.currentStack;
        let foundIdx = stacks.indexOf(found);
        this.partProperties.setPropertyNamed(
            this,
            'current',
            foundIdx
        );
        let nextStack = stacks[foundIdx];
        if(currentStack.id != nextStack.id){
            this.sendCloseStackTo(currentStack);
            this.sendOpenStackTo(nextStack);
        }
    }

    goToPrevStack(){
        let stacks = this.subparts.filter(subpart => {
            return subpart.type == 'stack';
        });
        if(stacks.length < 2){
            return;
        }
        let currentIdx = this.currentStackIndex;
        let currentStack = stacks[currentIdx];
        let nextIdx = currentIdx - 1;
        if(nextIdx < 0){
            nextIdx = stacks.length + nextIdx;
        }
        this.partProperties.setPropertyNamed(
            this,
            'current',
            nextIdx
        );
        let nextStack = stacks[nextIdx];
        if(currentStack.id != nextStack.id){
            this.sendCloseStackTo(currentStack);
            this.sendOpenStackTo(nextStack);
        }
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
        let currentStack = this.currentStack;
        this.partProperties.setPropertyNamed(
            this,
            'current',
            trueIndex
        );
        let nextStack = stacks[trueIndex];
        if(currentStack.id != nextStack.id){
            this.sendCloseStackTo(currentStack);
            this.sendOpenStackTo(nextStack);
        }
    }

    sendCloseStackTo(aStack){
        this.sendMessage({
            type: 'command',
            commandName: 'closeStack',
            args: [],
            shouldIgnore: true
        }, aStack);
        let currentCard = aStack.currentCard;
        if(currentCard){
            aStack.sendMessage({
                type: 'command',
                commandName: 'closeCard',
                args: [],
                shouldIgnore: true
            }, aStack.currentCard);
        }
    }

    sendOpenStackTo(aStack){
        this.sendMessage({
            type: 'command',
            commandName: 'openStack',
            args: [],
            shouldIgnore: true
        }, aStack);
        let currentCard = aStack.currentCard;
        if(currentCard){
            aStack.sendMessage({
                type: 'command', 
                commandName: 'ope nCard',
                args: [],
                shouldIgnore: true
            }, aStack.currentCard);
        }
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
        let result = {
            type: this.type,
            id: this.id,
            properties: {},
            subparts: this.subparts.map(subpart => {
                return subpart.id;
            }),
            ownerId: null,
            loadedStacks: (this.loadedStacks.map(stack => {
                return stack.id;
            })),
        };

        // Serialize current part properties
        // values
        this.partProperties._properties.forEach(prop => {
            let name = prop.name;
            let value = prop.getValue(this);
            // If this is the events set, transform
            // it to an Array first (for serialization)
            if(name == 'events'){
                value = Array.from(value);
            }
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

    get currentStackIndex(){
        return this.partProperties.getPropertyNamed(
            this,
            'current'
        );
    }

    get currentStack(){
        let stacks = this.subparts.filter(subpart => {
            return subpart.type == 'stack';
        });
        if(stacks.length){
            return stacks[this.currentStackIndex];
        }
        return null;
    }
};

export {
    WorldStack,
    WorldStack as default
};
