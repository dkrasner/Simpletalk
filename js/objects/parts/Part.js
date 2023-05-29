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

import { STDeserializer, STSerializer } from '../utils/serialization.js';
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
        this._viewSubscribers = new Set();
        this._stepIntervalId = null;

        this.isPart = true;

        // Bind methods
        this.setupProperties = this.setupProperties.bind(this);
        this.setupStyleProperties = this.setupStyleProperties.bind(this);

        this.addPart = this.addPart.bind(this);
        this.removePart = this.removePart.bind(this);
        this.acceptsSubpart = this.acceptsSubpart.bind(this);
        this.setPrivateCommandHandler = this.setPrivateCommandHandler.bind(this);
        this.removePrivateCommandHandler = this.removePrivateCommandHandler.bind(this);
        this.setFuncHandler = this.setFuncHandler.bind(this);
        this.receiveCmd = this.receiveCmd.bind(this);
        this.receiveFunc = this.receiveFunc.bind(this);
        this.receiveError = this.receiveError.bind(this);
        this.receiveMessage = this.receiveMessage.bind(this);
        this.delegateMessage = this.delegateMessage.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.addPropertySubscriber = this.addPropertySubscriber.bind(this);
        this.removePropertySubscriber = this.removePropertySubscriber.bind(this);
        this.addViewSubscriber = this.addViewSubscriber.bind(this);
        this.removeViewSubscriber = this.removeViewSubscriber.bind(this);
        this.serialize = this.serialize.bind(this);
        this.toJSONString = this.toJSONString.bind(this);
        this.setPropsFromDeserializer = this.setPropsFromDeserializer.bind(this);
        this.findAncestorOfType = this.findAncestorOfType.bind(this);
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
        this.move = this.move.bind(this);
        this.moveSubpartUp = this.moveSubpartUp.bind(this);
        this.moveSubpartDown = this.moveSubpartDown.bind(this);
        this.moveSubpartToFirst = this.moveSubpartToFirst.bind(this);
        this.moveSubpartToLast = this.moveSubpartToLast.bind(this);



        // Finally, we finish initialization
        this.setupProperties();

        // command handlers
        this.setPrivateCommandHandler("openEditor", this.openEditorCmdHandler);
        this.setPrivateCommandHandler("closeEditor", this.closeEditorCmdHandler);
        this.setPrivateCommandHandler("openHalo", () => {this.partProperties.setPropertyNamed(this, "halo-open", true);});
        this.setPrivateCommandHandler("closeHalo", () => {this.partProperties.setPropertyNamed(this, "halo-open", false);});
        this.setPrivateCommandHandler("setTargetTo", this.setTargetProp);
        this.setPrivateCommandHandler("copy", this.copyCmdHandler);
        this.setPrivateCommandHandler("paste", this.pasteCmdHandler);
        this.setPrivateCommandHandler("move", this.move);
        this.setPrivateCommandHandler("moveUp", () => {this._owner.moveSubpartUp(this);});
        this.setPrivateCommandHandler("moveDown", () => {this._owner.moveSubpartDown(this);});
        this.setPrivateCommandHandler("moveToFirst", () => {this._owner.moveSubpartToFirst(this);});
        this.setPrivateCommandHandler("moveToLast", () => {this._owner.moveSubpartToLast(this);});
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
                'wants-move',
                false
            ),
            new BasicProperty(
                'id',
                idMaker.new()
            ),
            new BasicProperty(
                'name',
                `New ${this.type}`
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
            'halo-open',
            function(propOwner, propObject, val){
                // close all other halos
                // (there really should only be one open at a time)
                if(val){
                    Array.from(document.querySelectorAll('.editing')).forEach(el => {
                        el.model.partProperties.setPropertyNamed(el.model, "halo-open", false);
                    });
                }
                propObject._value = val;
            },
            function(propOwner, propObject){
                return propObject._value;
            },
            false, // read & write
            false  // default value
        );
        this.partProperties.newDynamicProp(
            'editor-open',
            function(propOwner, propObject, val){
                if(val){
                    // open the halo on this part if it accepts halos
                    let haloOpenProp = propOwner.partProperties.findPropertyNamed("halo-open");
                    if(haloOpenProp){
                        haloOpenProp.setValue(propOwner, true);
                    } else {
                        // even if the part does not accept halos (like card, stack etc)
                        // we should still close them elsewhere
                        Array.from(document.querySelectorAll('.editing')).forEach(el => {
                            el.model.partProperties.setPropertyNamed(el.model, "halo-open", false);
                        });
                    }
                }
                propObject._value = val;
            },
            function(propOwner, propObject){
                return propObject._value;
            },
            false, // read & write
            false  // default value
        );
        // the index number of the part in part._owner.subpart
        // array. Note: this is 1-indexed
        this.partProperties.newDynamicProp(
            'number',
            null, // no setter
            function(propOwner, propObject){
                if(propOwner.type == "world"){
                    return 1;
                }
                return propOwner._owner.subparts.indexOf(propOwner) + 1;
            },
            true // readonly
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

        // Custom Properties store props defined within the
        // ST environment
        this.partProperties.newCustomProp(
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

    removePrivateCommandHandler(commandName){
        delete this._privateCommandHandlers[commandName];
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
        this.partProperties.setPropertyNamed(this, "editor-open", true);
    }

    closeEditorCmdHandler(){
        this.partProperties.setPropertyNamed(this, "editor-open", false);
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

    move(senders, movementX, movementY){
        if(!this.partProperties.getPropertyNamed(this, "wants-move")){
            throw Error(`Part ${this.id} trying to move with 'wants-move' property false`);
        }
        let top = this.partProperties.getPropertyNamed(this, "top");
        top += movementY;
        this.partProperties.setPropertyNamed(this, "top", top);
        let left = this.partProperties.getPropertyNamed(this, "left");
        left += movementX;
        this.partProperties.setPropertyNamed(this, "left", left);
    }

    moveSubpartDown(part){
        let currentIndex = this.subparts.indexOf(part);
        if(currentIndex < this.subparts.length - 1){
            this.subpartOrderChanged(part.id, currentIndex, currentIndex + 1);
        }
    }

    moveSubpartUp(part){
        let currentIndex = this.subparts.indexOf(part);
        if(currentIndex > 0){
            this.subpartOrderChanged(part.id, currentIndex, currentIndex - 1);
        }
    }

    // Note: moveSubpartToFirst means move to first in the view
    // i.e. last as a subaprt
    moveSubpartToFirst(part){
        let currentIndex = this.subparts.indexOf(part);
        this.subpartOrderChanged(part.id, currentIndex, 0);
    }

    moveSubpartToLast(part){
        let currentIndex = this.subparts.indexOf(part);
        this.subpartOrderChanged(part.id, currentIndex, this.subparts.length - 1);
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

    /** View Subscribers
        ------------------------
        Objects added as view subscribers
        will be 'notified' whenever this Part
        incurrs a view change (add, delete subparts, reorder etc)
    **/
    addViewSubscriber(anObject){
        this._viewSubscribers.add(anObject);
    }

    removeViewSubscriber(anObject){
        this._viewSubscribers.delete(anObject);
    }

    viewChanged(changeName, ...args){
        let message = {
            type: 'viewChanged',
            changeName: changeName,
            partId: this.id,
            args: args
        };
        this._viewSubscribers.forEach(subscriber => {
            this.sendMessage(message, subscriber);
        });
    }

    subpartOrderChanged(id, currentIndex, newIndex){
        let subpart = this.subparts.splice(currentIndex, 1)[0];
        this.subparts.splice(newIndex, 0, subpart);
        this.viewChanged("subpart-order", id, currentIndex, newIndex);
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
        this.partProperties._properties.filter(prop => {
            // we make sure to only serialize those properties which have non-default values
            // with the exception of the "custom-properties" prop which we always serialize
            return (prop.name == "custom-properties" || prop.getValue(this) !== prop.default);
        }).forEach(prop => {
            let name = prop.name;
            // due to race-conditions incurred if the editor is
            // open before world we exclude `editor-open` from serialization
            if(name == "editor-open"){
                return;
            }
            let value = prop.getValue(this, true); // get the serialzed value
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
            } else if(propName == "custom-properties"){
                // custom properties are serialized as an object like other props
                // and we need to create properties from these and set their respective
                // values. Then we need to set the value of "custom-properties" prop
                // itself to be the object containing all of these
                let customPropsData = incomingProps[propName];
                let newCustomPropsObject = {};
                Object.values(customPropsData).forEach((propData) => {
                    let newProp = new BasicProperty(propData.name, null);
                    newProp.setValue(this, propData._value, false); // no need to notify
                    newCustomPropsObject[propData.name] = newProp;
                });
                property.setValue(this, newCustomPropsObject, false); // no need to notify
            } else if(!property.readOnly){
                // Last arg is false, which tells the property
                // not to notify its owner's subscribers of
                // property changes. We don't need that when
                // deserializing
                property.setValue(this, incomingProps[propName], false);
            }
        });
    }

    /**
      * I return my full JSON serialization (string) object
      */
    toJSONString(){
        const serializer = new STSerializer(window.System);
        return serializer.serialize(this, false);
    }

    findAncestorOfType(aPartType){
        let owner = this._owner;
        while(owner){
            if(owner.type == aPartType){
                return owner;
            }
            owner = owner._owner;
        }
        return null;
    }
};

export {
    Part,
    Part as default
};
