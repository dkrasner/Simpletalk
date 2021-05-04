/**
 * Part
 * -------------------------------
 * I represent the prototype object for all
 * SimpleTalk parts.
 */
import {
    idMaker,
    isValidId
} from '../utils/id.js';
import errorHandler from '../utils/errorHandler.js';
import {
    PartProperties,
    BasicProperty,
    DynamicProperty
} from '../properties/PartProperties.js';

import {ActivationContext} from '../ExecutionStack.js';


class Part {
    constructor(anOwnerPart, name, deserializing=false){

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
        this._stepIntervalId = null;

        this.isPart = true;

        // Bind methods
        this.setupProperties = this.setupProperties.bind(this);
        this.setupStyleProperties = this.setupStyleProperties.bind(this);

        this.addPart = this.addPart.bind(this);
        this.removePart = this.removePart.bind(this);
        this.acceptsSubpart = this.acceptsSubpart.bind(this);
        this.setPrivateCommandHandler = this.setPrivateCommandHandler.bind(this);
        this.setFuncHandler = this.setFuncHandler.bind(this);
        this.receiveCmd = this.receiveCmd.bind(this);
        this.receiveFunc = this.receiveFunc.bind(this);
        this.receiveError = this.receiveError.bind(this);
        this.receiveMessage = this.receiveMessage.bind(this);
        this.delegateMessage = this.delegateMessage.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.addPropertySubscriber = this.addPropertySubscriber.bind(this);
        this.removePropertySubscriber = this.removePropertySubscriber.bind(this);
        this.serialize = this.serialize.bind(this);
        this.toJSON = this.toJSON.bind(this);
        this.setPropsFromDeserializer = this.setPropsFromDeserializer.bind(this);
        this.openEditorCmdHandler = this.openEditorCmdHandler.bind(this);
        this.closeEditorCmdHandler = this.closeEditorCmdHandler.bind(this);
        this.copyCmdHandler = this.copyCmdHandler.bind(this);
        this.pasteCmdHandler = this.pasteCmdHandler.bind(this);
        this.isSubpartOfCurrentCard = this.isSubpartOfCurrentCard.bind(this);
        this.isSubpartOfCurrentStack = this.isSubpartOfCurrentStack.bind(this);
        this.getOwnerBranch = this.getOwnerBranch.bind(this);
        this.startStepping = this.startStepping.bind(this);
        this.stopStepping = this.stopStepping.bind(this);
        this.setTargetProp = this.setTargetProp.bind(this);


        // Finally, we finish initialization
        this.setupProperties();

        // command handlers
        this.setPrivateCommandHandler("openEditor", this.openEditorCmdHandler);
        this.setPrivateCommandHandler("closeEditor", this.closeEditorCmdHandler);
        this.setPrivateCommandHandler("setTargetTo", this.setTargetProp);
        this.setPrivateCommandHandler("copy", this.copyCmdHandler);
        this.setPrivateCommandHandler("paste", this.pasteCmdHandler);
    }

    // Convenience getter to get the id
    // from the partProperties
    get id(){
        return this.partProperties.getPropertyNamed(this, 'id');
    }

    set id(val){
        return this.partProperties.setPropertyNamed(this, 'id', val);
    }


    // Return an array of names of all of my and my ancestors' handlers
    // for the moment this is just names, type, id and whether the handler overrides
    // an owner's, but could be richer info, such as arguments, documentation etc
    get commandHandlerRegistry(){
        let handlersInfo = {};
        let ownerBranch = this.getOwnerBranch();
        for(let i = 1; i <= ownerBranch.length; i++){
            let part = ownerBranch[ownerBranch.length - i];
            let partType = part.type;
            if(part.id === -1){
                partType = "System";
            } else {
                // System doesn't have private command handlers
                Object.keys(part._privateCommandHandlers).forEach((h) => {
                    let override = false;
                    if(handlersInfo[h]){
                        override = true;
                    }
                    handlersInfo[h] = {partId: part.id, partType: partType, override: override, private: true};
                });
            }
            Object.keys(part._commandHandlers).forEach((h) => {
                let override = false;
                if(handlersInfo[h]){
                    override = true;
                }
                handlersInfo[h] = {partId: part.id, partType: partType, override: override, private: false};
            });
        }
        return handlersInfo;
    }

    // returns the this.part -> System branch by part id
    getOwnerBranch(branch){
        if(!branch){
            branch = [this];
        }
        if(this.type === "world"){
            branch.push(window.System);
            return branch;
        } else {
            branch.push(this._owner);
        };
        return this._owner.getOwnerBranch(branch);
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
                'target',
                null,
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
                'id',
                idMaker.new()
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
                'script',
                null // For now
            ),
            new BasicProperty(
                'editorOpen',
                false
            ),
            // List of (web) events the part subscribes to
            new BasicProperty(
                'events',
                new Set(),
                false,
                []
            ),
            // Styling
            // css (really JS style) key-values
            new BasicProperty(
                'cssStyle',
                {},
                false,
            ),
            // css (really JS style) key-values
            new BasicProperty(
                'cssTextStyle',
                {},
                false,
            )
        ];
        basicProps.forEach(prop => {
            this.partProperties.addProperty(prop);
        });

        this.partProperties.newDynamicProp(
            'number',
            null, // No setter; readOnly
            function(propOwner, propObject){
                if(!propOwner._owner){
                    return -1;
                }
                return propOwner._owner.subparts.filter(subpart => {
                    return subpart.type == propOwner.type;
                }).indexOf(propOwner) + 1;
            },
            true, // Is readOnly,
            [] // No aliases
        );

        this.partProperties.newDynamicProp(
            'target',
            function(propOwner, propObject, val){
                // check to see if the target is a non-ID
                let id = isValidId(val);
                if(id){
                    // if it is an ID insert "part" since our
                    // grammar doesn't handle ID without system object
                    // prefixes
                    propObject._value = `part id ${val}`;
                } else {
                    propObject._value = val;
                }
            },
            function(propOwner, propObject){
                return propObject._value;
            },
            false,
            null,
        ),

        // Stepping related props

        this.partProperties.newDynamicProp(
            // The time in milliseconds between
            // sends of the step command if the
            // stepping property is set to true
            'stepTime',
            // Dynamic setter
            function(propOwner, propObject, value){
                if(propOwner.isStepping){
                    // Interrupt the current interval
                    // and restart with new stepTime
                    propOwner.stopStepping();
                    this._value = value;
                    propOwner.startStepping();
                } else{
                    this._value = value;
                }
            },
            // Dynamic getter
            function(propOwner, propObject){
                return this._value;
            },
            false, // can read and write
            500 // Default to half a second
        );

        this.partProperties.newDynamicProp(
            'stepping',
            // Dynamic setter
            function(propOwner, propObject, value){
                if(value === false && propOwner.isStepping){
                    propOwner.stopStepping();
                } else if(value === true && !propOwner.isStepping){
                    propOwner.startStepping();
                }
            },
            // Dynamic getter
            function(propOwner, propObject){
                // If the intervalId is set, then
                // the Part is currently stepping
                return propOwner.isStepping;
            },
        );

    }

    // To be called in each sub-class that has StyleProperties
    // called after the style props are configured
    setupStyleProperties(){
        this.partProperties._properties.forEach((prop) => {
            if(prop.constructor.name === "StyleProperty"){
                // setting the value on itself ensures that the cssStyle
                // BasicProperty is updated with the appropriate styler
                // conversion css key-val
                prop.setValue(this, prop._value);
            }
        });
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
            case 'error':
                return this.receiveError(aMessage);
            default:
                return this.delegateMessage(aMessage);
        }
    }

    receiveError(aMessage){
        return errorHandler.handle(aMessage);
    }

    receiveCmd(aMessage){
        let handler = this._commandHandlers[aMessage.commandName];
        if(handler){
            // If this Part has a handler for
            // the given command, we run it.
            // We also late-bind the current part
            // instance as the 'this' context for
            // the handler
            let boundHandler = handler.bind(this);
            var activation = new ActivationContext(
                aMessage.commandName,
                this,
                aMessage,
                boundHandler
            );
            window.System.executionStack.push(activation);
            var result = boundHandler(aMessage.senders, ...aMessage.args);
            window.System.executionStack.pop();
            return result;
        }

        let privateHandler = this._privateCommandHandlers[aMessage.commandName];
        if(privateHandler){
            // If this Part has a handler for
            // the given command, we run it.
            // We also late-bind the current part
            // instance as the 'this' context for
            // the handler
            let boundHandler = privateHandler.bind(this);
            var activation = new ActivationContext(
                aMessage.commandName,
                this,
                aMessage,
                boundHandler
            );
            window.System.executionStack.push(activation);
            var result = boundHandler(aMessage.senders, ...aMessage.args);
            window.System.executionStack.pop();
            return result;
        }

        // Otherwise, we have no handler for
        // it. Unless the message indicates shouldNotDelegate
        // we delegate along the
        // message delegation chain. It is up
        // to Parts to properly implement delegation
        // for themselves!
        if(aMessage.shouldNotDelegate){
            return aMessage;
        }
        return this.delegateMessage(aMessage);
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

    openEditorCmdHandler(){
        this.partProperties.setPropertyNamed(this, 'editorOpen', true);
    }

    closeEditorCmdHandler(){
        this.partProperties.setPropertyNamed(this, 'editorOpen', false);
    }

    setTargetProp(senders, ...args){
        let target = args.join(" ");
        this.partProperties.setPropertyNamed(this, "target", target);
    }

    copyCmdHandler(){
        window.System.clipboard.copyPart(this);
    }

    pasteCmdHandler(){
        if(!window.System.clipboard.isEmpty){
            let item = window.System.clipboard.contents[0];
            if(item.type == 'simpletalk/json' && this.acceptsSubpart(item.partType)){
                window.System.clipboard.pasteContentsInto(this);
            }
        }
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

    startStepping(){
        if(this._stepIntervalId){
            this.stopStepping();
        }
        let stepTime = this.partProperties.getPropertyNamed(
            this,
            'stepTime'
        );
        if(stepTime > 0){
            this._stepIntervalId = setInterval(() => {
                this.sendMessage({
                    type: 'command',
                    commandName: 'step',
                    args: []
                }, this);
            }, stepTime);
        }
    }

    stopStepping(){
        clearInterval(this._stepIntervalId);
        this._stepIntervalId = null;
    }

    get isStepping(){
        // We know the Part is currently stepping
        // of the stored intervalId is set to
        // something besides null
        return this._stepIntervalId !== null;
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
            // If this is the events set, transform
            // it to an Array first (for serialization)
            if(name == 'events'){
                value = Array.from(value);
            } 
            result.properties[name] = value;
        });
        return result;
    }

    /**
     * Set the properties and other
     * attributes of this Part model
     * from a deserialized JSON object.
     */
    setPropsFromDeserializer(incomingProps, deserializer){
        Object.keys(incomingProps).forEach(propName => {
            let property = this.partProperties.findPropertyNamed(propName);
            if(!property){
                // If some old or invalid property is
                // present in the deserialization, simply provide
                // a warning and then skip this one.
                console.warn(`Deserialized property "${propName}" is not a valid property name for ${this.type} (id ${this.id}) and will be ignored`);
            } else if(property.name == 'events'){
                // The events property uses a Set, but sets are serialized as Arrays.
                // We need to return them to being sets.
                property.setValue(this, new Set(incomingProps[propName]), false);
            } else if(!property.readOnly){
                // Last arg is false, which tells the property
                // not to notify its owner's subscribers of
                // property changes. We don't need that when
                // deserializing
                property.setValue(this, incomingProps[propName], false);
            }
        });
    }

    toJSON(){
        return this.serialize();
    }
};

export {
    Part,
    Part as default
};
