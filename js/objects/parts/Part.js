/**
 * Part
 * -------------------------------
 * I represent the prototype object for all
 * SimpleTalk parts.
 */

import PartCollection from './PartCollection';
import idMaker from '../utils/idMaker';
import {
    PartProperties,
    BasicProperty,
    DynamicProperty
} from '../properties/PartProperties';

class Part {
    contructor(anOwnerPart){
        this.partsCollection = new PartCollection(this);
        this.partProperties = new PartProperties();
        this._owner = anOwnerPart;
        this._commandHandlers = {};
        this._functionHandlers = {};

        // Bind methods
        this.setupProperties = this.setupProperties.bind(this);
        this.getStack = this.getStack.bind(this);
        this.numberInOwner = this.numberInOwner.bind(this);
        this.setCmdHandler = this.setCmdHandler.bind(this);
        this.setFuncHandler = this.setFuncHandler.bind(this);

        // Finally, we finish initialization
        this.setupProperties();
    }

    // Return the Stack in which this part is
    // embedded. Involves a recursive lookup.
    // If this part is itself a Stack, just
    // return itself.
    getStack(){
        if(this.type == 'stack'){
            return this;
        }
        if(this._owner == null){
            return null;
        }
        return this._owner.getStack();
    }

    // Returns the index (ie, "number") of this part
    // in its owner's collection of parts, and only
    // the index in a collection of parts of the same
    // type as me.
    // In any collection, a part has two indicies:
    // the index in a list of parts of the same type
    // (ie, 'button 3 of card')
    // and the index in a list of parts of all types
    // (ie 'part 4 of card')
    // This retrieves only the former.
    numberInOwner(){
        if(!this.owner){
            return -1; // Per JS indexOf operations
        }
        return this.owner.partsCollection.getTypeIndexForPart(this);
    }

    // Configures the specific properties that the
    // given part can expect, along with any default
    // values.
    // Descendant Parts should override this method
    // in their own constructor after calling super,
    // so that they get the parent's general properties
    // too.
    setupProperties(){
        // Here, we set up properties common
        // to ALL Parts in the system.
        let basicProps = [
            new BasicProperty(
                'bottom',
                0
            ),
            new BasicProperty(
                'bottomRight',
                0
            ),
            new BasicProperty(
                'contents',
                null,
            ),
            new BasicProperty(
                'enabled',
                true
            ),
            new BasicProperty(
                'height',
                0
            ),
            new BasicProperty(
                'id',
                idMaker.next()
            ),
            new BasicProperty(
                'left',
                0
            ),
            new BasicProperty(
                'location',
                0,
                false,
                ['loc']
            ),
            new BasicProperty(
                'name',
                ''
            ),
            new BasicProperty(
                'rectangle',
                "0, 0, 0, 0",
                true,
                ['rect']
            ),
            new BasicProperty(
                'right',
                0
            ),
            new BasicProperty(
                'script',
                null // For now
            ),
            new BasicProperty(
                'top',
                0
            ),
            new BasicProperty(
                'topLeft',
                0
            ),
            new BasicProperty(
                'width',
                0
            )
        ];
        basicProps.forEach(prop => {
            this.partProperties.addProperty(prop);
        });

        this.partProperties.newDynamicProp(
            'number',
                function(propOwner, propObject){
                    return propOwner.numberInOwner();
                },
                null, // No setter; readOnly
                true, // Is readOnly,
                [] // No aliases
        );
    }

    /** Command Handling and Delegation **/
    setCmdHandler(commandName, handler){
        this._commandHandlers[commandName] = handler.bind(this);
    }

    setFuncHandler(funcName, handler){
        this._functionHandlers[funcName] = handler.bind(this);
    }

    sendCmd(targetPart, commandName, arguments=[]){
        targetPart.receiveCmd(commandName, arguments);
    }

    receiveCmd(commandName, arguments=[]){
        let handler = this._commandHandlers[commandName];

        if(handler){
            // If this Part has a handler for
            // the given command, we run it.
            handler();
        } else {
            // Otherwise, we have no handler for
            // it, so we delegate along the
            // message delegation chain. It is up
            // to Parts to properly implement delegation
            // for themselves!
            this.delegateCmd(commandName, arguments);
        }
    }

    delegateCmd(commandName, arguments=[]){
        return this.shouldBeImplemented('delegateCmd');
    }

    /** Logging and Reporting **/
    shouldBeImplemented(functionName){
        let msg = `${this.constructor.name} should implement ${functionName}`;
        throw new Error(msg);
    }
};

export {
    Part,
    Part as default
};
