/**
 * Part
 * -------------------------------
 * I represent the prototype object for all
 * SimpleTalk parts.
 */
import idMaker from '../utils/idMaker.js';
import eventMessenger from '../utils/eventMessenger.js';
import {
    PartProperties,
    BasicProperty,
    DynamicProperty
} from '../properties/PartProperties.js';


class Part {
    constructor(anOwnerPart){

        this.name = this.constructor.name;

        // An array of child parts
        this.subparts = [];
        // a list of all accepted subparts by type
        // By default this is null and each Part subclcass should
        // specify if otherwise
        this.acceptedSubpartTypes = [];

        this.partProperties = new PartProperties();
        this._owner = anOwnerPart;
        this._commandHandlers = {};
        this._privateCommandHandlers = {};
        this._functionHandlers = {};
        this._scriptSemantics = {};
        this._propertySubscribers = new Set();

        this.isPart = true;

        // Bind methods
        this.copy = this.copy.bind(this);
        this.setupProperties = this.setupProperties.bind(this);

        this.addPart = this.addPart.bind(this);
        this.removePart = this.removePart.bind(this);
        this.acceptsSubpart = this.acceptsSubpart.bind(this);
        this.setPrivateCommandHandler = this.setPrivateCommandHandler.bind(this);
        this.setFuncHandler = this.setFuncHandler.bind(this);
        this.receiveCmd = this.receiveCmd.bind(this);
        this.receiveFunc = this.receiveFunc.bind(this);
        this.receiveMessage = this.receiveMessage.bind(this);
        this.delegateMessage = this.delegateMessage.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.addPropertySubscriber = this.addPropertySubscriber.bind(this);
        this.removePropertySubscriber = this.removePropertySubscriber.bind(this);
        this.serialize = this.serialize.bind(this);
        this.setFromDeserialized = this.setFromDeserialized.bind(this);
        this.deleteModelCmdHandler = this.deleteModelCmdHandler.bind(this);
        this.isSubpartOfCurrentCard = this.isSubpartOfCurrentCard.bind(this);
        this.isSubpartOfCurrentStack = this.isSubpartOfCurrentStack.bind(this);


        // Finally, we finish initialization
        this.setupProperties();

        // command handlers
        this.setPrivateCommandHandler("deleteModel", this.deleteModelCmdHandler);
        this.setPrivateCommandHandler("newModel", this.newModelCmdHandler);
    }

    // Convenience getter to get the id
    // from the partProperties
    get id(){
        return this.partProperties.getPropertyNamed(this, 'id');
    }

    set id(val){
        return this.partProperties.setPropertyNamed(this, 'id', val);
    }

    // perform a deep copy of myself (and all my suparts)
    // assigning new ids
    copy(ownerPart){
        let modelClass = window.System.availableParts[this.type];
        let model = new modelClass(ownerPart);
        // cache the model id so it does not get overwritten by
        // copying partProperties
        let modelId = model.id;
        // TODO: we cannot just copy of over neither property subscribers
        // nor handlers, since these will be incorrectly bound. There is no
        // native way to clone a js function, although we could implement a
        // strategy to do so. At the moment any subscribers and handlers that
        // are not part of the model class natively will be missing from the copy.
        this.partProperties._properties.forEach((prop) => {
            model.partProperties.setPropertyNamed(model, prop.name, prop._value);
        });
        model.id = modelId;
        // add the model to the system parts
        window.System.partsById[model.id] = model;
        // if there is a script attached to the part we need to compile it
        let script = model.partProperties.getPropertyNamed(model, "script");
        if(script){
            this.sendMessage({
                type: 'compile',
                codeString: script,
                targetId: modelId
            }, window.System);
        }
        // recursively copy each subpart, setting model as its owner
        model.subparts.forEach((subpart) => {
            subpart.copy(model);
        });
        return model;
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
                idMaker.new()
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
            ),
            new BasicProperty(
                'backgroundColor',
                'white'
            ),
            // List of (web) events the part subscribes to
            new BasicProperty(
                'events',
                new Set(),
                false,
                []
            )
        ];
        basicProps.forEach(prop => {
            this.partProperties.addProperty(prop);
        });

        this.partProperties.newDynamicProp(
            'number',
            null, // No setter; readOnly
            function(propOwner, propObject){
                return propOwner.subparts.indexOf(this);
            },
            true, // Is readOnly,
            [] // No aliases
        );

        // eventResopnd and eventIgnore are "helper" dynamic props
        // they add and delete eventNamed from the "events" basic property
        // hence, they do not need getters
        this.partProperties.newDynamicProp(
            "eventRespond",
            function(propOwner, propObject, value){
                let eventsProperty = propOwner.partProperties.findPropertyNamed("events");
                let events = eventsProperty.getValue(propOwner);
                events.add(value);
                eventsProperty.setValue(propOwner, events, false);
            },
            function(){return} // no getter
        );

        this.partProperties.newDynamicProp(
            "eventIgnore",
            function(propOwner, propObject, value){
                let eventsProperty = propOwner.partProperties.findPropertyNamed("events");
                let events = eventsProperty.getValue(propOwner);
                events.delete(value);
                eventsProperty.setValue(propOwner, events, false); // no need to notify
            },
            function(){return} // no getter
        );
    }

    /** Subpart Access **/
    /**
     * Each subclass will implement its own set of checks,
     * and throw an approprite error if the subpart type is invalid.
     */
    acceptsSubpart(aPartType){
        if (this.acceptedSubpartTypes[0] === "*"){
            return true;
        }
        return this.acceptedSubpartTypes.includes(aPartType.toLowerCase());
    }

    /**
     * Adds a part to this part's subparts
     * collection, if not already present.
     * It will also set the owner of the
     * added part to be this part.
     */
    addPart(aPart){
        if(!this.acceptsSubpart(aPart.type)){
            throw new Error(`${this.type} does not accept subparts of type ${aPart.type}`);
        }

        let found = this.subparts.indexOf(aPart);
        if(found < 0){
            this.subparts.push(aPart);
            aPart._owner = this;
        }
    }

    /**
     * Removes the given part from this
     * part's list of subparts (if present).
     * It will also unset the owner of the
     * given part.
     */
    removePart(aPart){
        let partIndex = this.subparts.indexOf(aPart);
        if(partIndex >= 0){
            this.subparts.splice(partIndex, 1);
            aPart._owner = null;
        }
    }

    /** Checks whether the Part instance is a subpart of the current
     * Card.
     */
    isSubpartOfCurrentCard(){
    }

    /** Checks whether the Part instance is a subpart of the current
     * Stack.
     */
    isSubpartOfCurrentStack(){
    }

    /** Logging and Reporting **/
    shouldBeImplemented(functionName){
        let msg = `${this.constructor.name} should implement ${functionName}`;
        throw new Error(msg);
    }

    /** Message Handling and Delegation **/
    delegateMessage(aMessage){
        return this.sendMessage(
            aMessage,
            this._owner
        );
    }

    sendMessage(aMessage, target){
        return window.System.sendMessage(aMessage, this, target);
    }

    receiveMessage(aMessage){
        // By default, Parts will only handle
        // messages of type 'command' and 'function'
        switch(aMessage.type){
            case 'command':
                return this.receiveCmd(aMessage);
                //break;
            case 'function':
                return this.receiveFunc(aMessage);
                //break;
            default:
                return this.delegateMessage(aMessage);
        }
    }

    receiveCmd(aMessage){
        let handler = this._commandHandlers[aMessage.commandName];
        let privateHandler = this._privateCommandHandlers[aMessage.commandName];

        if(handler){
            // If this Part has a handler for
            // the given command, we run it.
            // We also late-bind the current part
            // instance as the 'this' context for
            // the handler
            let boundHandler = handler.bind(this);
            let originalSender;
            if(aMessage.senders){
                originalSender = window.System.partsById[aMessage.senders[0].id];
            }
            return boundHandler(aMessage.senders, ...aMessage.args);
        } else if(privateHandler){
            // If this Part has a handler for
            // the given command, we run it.
            // We also late-bind the current part
            // instance as the 'this' context for
            // the handler
            let boundHandler = privateHandler.bind(this);
            let originalSender;
            if(aMessage.senders){
                originalSender = window.System.partsById[aMessage.senders[0].id];
            }
            return boundHandler(aMessage.senders, ...aMessage.args);
        } else {
            // Otherwise, we have no handler for
            // it, so we delegate along the
            // message delegation chain. It is up
            // to Parts to properly implement delegation
            // for themselves!
            return this.delegateMessage(aMessage);
        }
    }

    receiveFunc(aMessage){
        let handler = this._functionHandlers[aMessage.functionName];

        if(handler){
            let boundHandler = handler.bind(this);
            return boundHandler();
        } else {
            return this.delegateMessage(aMessage);
        }
    }

    setPrivateCommandHandler(commandName, handler){
        this._privateCommandHandlers[commandName] = handler;
    }

    setFuncHandler(funcName, handler){
        this._functionHandlers[funcName] = handler;
    }

    /** Command Handlers
        ----------------
        Command handlers which are invoked at the Part level
        which are not immediately delegaed to the Part._owner
    **/

    deleteModelCmdHandler(senders, objectId, modelType){
        if (modelType && modelType.toLowerCase() === this.type && !objectId){
            objectId = this.id;
        }
        this.delegateMessage({
            type: 'command',
            commandName: 'deleteModel',
            args: [objectId, modelType]
        });
    }

    newModelCmdHandler(senders, modelType, ownerId, targetModelType, context, name){
        let message = {
            type: 'command',
            commandName: 'newModel',
            args: [modelType, ownerId, targetModelType, context, name]
        };
        // If the context is explicitely "current" we find the corresponding part
        // (card or stack) and send the updated message to it
        // Note: this assumes that the only current parts or cards or stacks
        if(context === "current"){
            // we won't need to the context anymore after sending to the corresponding
            // target part
            message.args[3] = "";
            let targetModel;
            if(targetModelType.toLowerCase() === "card"){
                targetModel = window.System.getCurrentCardModel();
            };
            if(targetModelType.toLowerCase() === "stack"){
                targetModel = window.System.getCurrentStackModel();
            };
            message.args[1] = targetModel.id;
            return this.sendMessage(message, targetModel);
        }
        // if no owner Id and no targetModelTyope are provided
        // and I accept the modelType
        // as a subpart, then add the new model as a subpart
        // if targetModelType is provided then I check to make sure
        // my type matches targetModelType
        if (this.acceptsSubpart(modelType) && !ownerId){
            if(targetModelType){
                if(this.type === targetModelType){
                    message.args[1] = this.id;
                };
            } else {
                message.args[1] = this.id;
            }
        }
        this.delegateMessage(message);
    }

    /** Property Subscribers
        ------------------------
        Objects added as property subscribers
        will be 'notified' whenever one of this
        Part's properties changes
    **/
    addPropertySubscriber(anObject){
        this._propertySubscribers.add(anObject);
    }

    removePropertySubscriber(anObject){
        this._propertySubscribers.delete(anObject);
    }

    propertyChanged(propertyName, newValue){
        let message = {
            type: 'propertyChanged',
            propertyName: propertyName,
            value: newValue,
            partId: this.id
        };
        this._propertySubscribers.forEach(subscriber => {
            this.sendMessage(message, subscriber);
        });
    }

    /**
     * Serialize this Part's state as JSON.
     * By default, we do not serialize specific
     * PartCollection information (recursively),
     * and only include basics including the current
     * state of all properties.
     */
    serialize(){
        let ownerId = null;
        if(this._owner){
            ownerId = this._owner.id;
        }
        let result = {
            type: this.type,
            id: this.id,
            properties: {},
            subparts: this.subparts.map(subpart => {
                return subpart.id;
            }),
            ownerId: ownerId
        };
        this.partProperties._properties.forEach(prop => {
            let name = prop.name;
            let value = prop.getValue(this);
            result.properties[name] = value;
        });
        return JSON.stringify(result, null, 4);
    }

    /**
     * Set the properties and other
     * attributes of this Part model
     * from a deserialized JSON object.
     */
    setFromDeserialized(anObject){
        // First, set all writeable properties
        // to the incoming values
        let incomingProps = anObject.properties;
        Object.keys(incomingProps).forEach(propName => {
            let property = this.partProperties.findPropertyNamed(propName);
            if(!property){
                throw new Error(`Invalid deserialized property: ${propName}`);
            }
            if(!property.readOnly){
                // Last arg is false, which tells the property
                // not to notify its owner's subscribers of
                // property changes. We don't need that when
                // deserializing
                property.setValue(this, incomingProps[propName], false);
            }
        });

        // Next, set the id based on the
        // incoming value
        this.id = anObject.id;
    }
};

export {
    Part,
    Part as default
};
