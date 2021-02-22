/**
 * System Object
 * -------------------------------------
 * I am an object representing the "top" of the
 * sytem. I am the point of communication between
 * Models and Views.
 */
import Card from './parts/Card.js';
import Stack from './parts/Stack.js';
import Button from './parts/Button.js';
import Field from './parts/Field.js';
import WorldStack from './parts/WorldStack.js';
import Window from './parts/Window.js';
import Container from './parts/Container.js';
import Drawing from './parts/Drawing.js';
import Image from './parts/Image.js';

import ButtonEditor from './parts/editors/ButtonEditor.js';

import WorldView from './views/WorldView.js';
import StackView from './views/StackView.js';
import ButtonView from './views/ButtonView.js';

import CardView from './views/CardView.js';
import WindowView from './views/WindowView';
import FieldView from './views/FieldView.js';
import ContainerView from './views/ContainerView.js';
import DrawingView from './views/drawing/DrawingView.js';
import ImageView from './views/ImageView.js';

import Halo from './views/Halo.js';
import ButtonEditorView from './views/editors/ButtonEditorView.js';

import ohm from 'ohm-js';
import interpreterSemantics from '../ohm/interpreter-semantics.js';
import {ExecutionStack, ActivationContext} from './ExecutionStack.js';

const video = document.createElement('video');
const canvas = document.createElement('canvas');
var handDetectionModel = null;

const System = {
    name: "System",
    id: -1,
    isLoaded: false,
    partsById: {},
    _commandHandlers: {},
    _functionHandlers: {},

    // a list of "current" toolbox elements
    // these can be added or remove from the World Catalog
    // TODO: we might want toolbox to be tied to context, example:
    // world or stack , account or some notion of project context
    toolbox: [],

    // A dictionary mapping part types like
    // 'button' to their classes (Button)
    availableParts: {},

    // A dictionary mapping part types like
    // 'button' to their view classes (ButtonView)
    availableViews: {},

    // A registry that keeps all system messages from
    // beginnign of time; TODO in the future we might want
    // to note keep all this in memory
    // each log consists of:
    // [aMessage, (sourceName, sourceId), (targetName, targetId)]
    messageLog: [],

    // Will be called when a page loads.
    // Checks for any view elements in the
    // page and attempts to find serialized
    // model state for each of them. If present,
    // deserializes the model and attaches it
    // to the view.
    initialLoad: function(){

        // If we have a serialization script tag
        // containing JSON of serialized information,
        // attempt to load from it
        let serializationEl = document.getElementById('serialization');
        if(serializationEl){
            this.deserialize();
        } else {
            this.loadFromEmpty();
        }

        // By this point we should have a WorldView with
        // a model attached.
        this.isLoaded = true;
    },

    loadFromWorldView: function(aWorldView){
        let worldSerialization = this.getSerializationFor(aWorldView.getAttribute("part-id"));
        if(!worldSerialization || worldSerialization == undefined){
            // The element has no corresponding serialized model.
            // Remove the element from the DOM and initialize
            // as if this is an empty system.
            aWorldView.parentElement.removeChild(aWorldView);
            this.loadFromEmpty();
        } else {
            let worldModel = WorldStack.fromSerialization(
                worldSerialization
            );
            aWorldView.setModel(worldModel);
            this.partsById['world'] = worldModel;
            this.attachSubPartsFromDeserialized(
                worldModel,
                JSON.parse(worldSerialization)
            );
            worldModel.subparts.forEach(subpart => {
                this.attachView(subpart, worldModel);
            });

            // Finally, compile all of the scripts on
            // the available Part models
            Object.keys(this.partsById).forEach(partId => {
                let targetPart = this.partsById[partId];
                let scriptText = targetPart.partProperties.getPropertyNamed(
                    targetPart,
                    'script'
                );
                if(scriptText){
                    // Here we just re-set the script
                    // to its original value. This should trigger
                    // all prop change subscribers that listen
                    // for script changes, which will trigger
                    // a compilation step
                    targetPart.partProperties.setPropertyNamed(
                        targetPart,
                        'script',
                        scriptText
                    );
                }
            });

        }
    },

    loadFromEmpty: function(){
        let worldModel = new this.availableParts['world']();
        this.partsById[worldModel.id] = worldModel;
        let worldView = document.createElement(
            this.tagNameForViewNamed('world')
        );
        worldView.setModel(worldModel);
        document.body.appendChild(worldView);

        // Uncomment the following to see hand detection frames.
        //document.body.appendChild(video);
        //document.body.appendChild(canvas);

        // Create an initial blank Stack in this
        // case
        this.newModel('stack', worldModel.id);
        document.querySelector('st-stack').classList.add('current-stack');

        // Update serialization
        this.serialize();
        
        let msg = {type: 'command', commandName: 'openToolbox', args:[]};
        this.receiveMessage(msg);
    },

    attachSubPartsFromDeserialized: function(aModel, aSerialization){
        // The serialization contains an array of subparts
        // that contains integer ids of other models.
        // For each of these IDs we need to find the
        // subpart serialization for that id and create a new model
        // instance
        aSerialization.subparts.forEach(partId => {
            let subSerialization = JSON.parse(this.getSerializationFor(partId));
            let partClass = this.availableParts[subSerialization.type];
            if(!partClass){
                throw new Error(`Could not deserialize Part of type ${subSerialization.type}`);
            }
            let part = partClass === Stack ?
                new partClass(aModel, subSerialization.properties.name, true) :
                new partClass(aModel, subSerialization.properties.name);

            part.id = subSerialization.id;
            part.setFromDeserialized(subSerialization);
            aModel.addPart(part);
            this.partsById[subSerialization.id] = part;

            // Recursively get the subparts of the subpart
            this.attachSubPartsFromDeserialized(
                part,
                subSerialization
            );
        });
    },

    attachView: function(aModel, parentView){
        // We look up to see if a view for this
        // model by id is already in the DOM.
        // If so, we set it to the model.
        // If not, we ignore it. It was already absent from
        // the DOM in the serialized saved state
        let found = this.findViewById(aModel.id);
        if(found){
            found.setModel(aModel);
            // Now recursively do the same for any
            // children
            aModel.subparts.forEach(subpart => {
                this.attachView(subpart, found);
            });
        }
    },

    // returns a recursive tree structure, specified by a parent NODE
    // where a NODE has the form {id: ID, type: TYPE, children: [NODES]}
    buildSimpleTree: function(partsById, node) {
        var part = partsById[node.id];

        var children = part.subparts.map(spart => {
            return {id: spart.id, type: spart.type};
        });

        return {...node, children: children.map(child => this.buildSimpleTree(partsById, child))};
    },

    passDevToolMessage: function(aMessage, source, target){
        // TODO: in the future, we'd likely pass some more complete "state" through to the
        // debug tool.  But for now, the tree result 
        var simpleTree = this.buildSimpleTree(this.partsById, {id: 'world', type: 'World'});
        let messageData = {
            msg: aMessage,
            source: {
                name: source.name,
                id: source.id,
            },
            target: {
                name: target.name,
                id: target.id,
            },
            tree: simpleTree,
        };

        // if we don't have an origin we are running at test
        // can return the string "null"
        if (window.location.origin !== null && window.location.origin !== "null"){
            try{
                window.postMessage(messageData, window.location.origin);
            } catch(error){
                console.log("failed to postMessage to devtool: ");
                console.log(messageData);
            }
        }
        this.messageLog.push(messageData);
    },

    sendMessage: function(aMessage, source, target){
        if(!target || target == undefined){
            throw new Error('Messages must be sent with target receivers specified!');
        }

        // keep track of all sources which pass this message
        if (!("senders" in aMessage)) {
            aMessage["senders"] = [];
        }
        aMessage.senders.push({
            name: source.name,
            id: source.id,
        });

        this.passDevToolMessage(aMessage, source, target);
        return target.receiveMessage(aMessage);
    },

    receiveMessage: function(aMessage){
        switch(aMessage.type){
            case 'newView':
                return this.newView(
                    aMessage.viewType,
                    aMessage.modelId
                );
            case 'compile':
                return this.compile(aMessage);
            case 'command':
                return this.receiveCommand(aMessage);
            default:
                return this.doesNotUnderstand(aMessage);
        }
    },

    doesNotUnderstand: function(aMessage){
        // If the message has the shouldIgnore property
        // set to true, it means we should just swallow
        // this message if we don't understand it. This is
        // useful for messages like mouse events on buttons
        // which are not captured by default and would otherwise
        // end up arriving to this System object via the
        // message delegation chain.
        if(aMessage.shouldIgnore){
            return;
        }
        let originalSender = this.partsById[aMessage.senders[0].id];
        let msg = {
            type: "error",
            name: "MessageNotUnderstood",
            message: aMessage
        };
        originalSender.sendMessage(msg, originalSender);
    },

    compile: function(aMessage){
        let targetObject = this.partsById[aMessage.targetId];
        if(!targetObject || targetObject == undefined){
            throw new Error(`System could not compile target object ${aMessage.targetId}`);
        }


        // Attempt to parse the incoming SimpleTalk script string.
        // If there are grammatical errors, report them and bail.
        // Otherwise, create a new semantics on the targetPart, add
        // the required semantic operations, and interpret the top
        // level of the script, which will create the JS handler functions
        let parsedScript = languageGrammar.match(aMessage.codeString);
        if(parsedScript.failed()){
            // consider using the parse data from trace
            // example: let tracedScript = languageGrammar.trace(aMessage.codeString);
            // let tree = tracedScript.toString();
            let msg = {
                type: "error",
                name: "GrammarMatchError",
                parsedScript: parsedScript,
                partId: aMessage.targetId
            };
            targetObject.sendMessage(msg, targetObject);
        } else {
            // First, clear out any currently compiled handlers
            // since the incoming script might get rid of them
            targetObject._commandHandlers = {};

            // Create a semantics object whose partContext
            // attribute is set to be the target object.
            targetObject._semantics = languageGrammar.createSemantics();
            targetObject._semantics.addOperation(
                'interpret',
                interpreterSemantics(targetObject, this)
            );
            targetObject._semantics(parsedScript).interpret();
        }


        // Be sure to then update the
        // serialization for the target
        // part, thus adding the script to
        // its serialization
        this.serialize();
    },

    receiveCommand: function(aMessage){
        let handler = this._commandHandlers[aMessage.commandName];
        if(handler){
            let boundHandler = handler.bind(this);
            let activation = new ActivationContext(
                aMessage.commandName,
                this,
                aMessage,
                boundHandler
            );
            this.executionStack.push(activation);
            var result = boundHandler(aMessage.senders, ...aMessage.args);
            this.executionStack.pop();
            return result;
        } else {
            return this.doesNotUnderstand(aMessage);
        }
    },

    newModel: function(kind, ownerId, name, buildView=true){
        // If no ownerId is provided, we assume
        // current card to be the owner of the new part
        if(!ownerId){
            ownerId = this.getCurrentCardModel().id;
        }

        // Lookup the instance of the model that
        // matches the owner's id        
        let ownerPart = this.partsById[ownerId];
        if(!ownerPart || ownerPart == undefined){
            throw new Error(`System could not locate owner part with id ${ownerId}`);
        }

        // TODO This is an exception to the general newModel
        // message and method structure; potentially should be
        // reworked
        // if (ownerPart === "toolbox"){
        //     this.addToToolbox(kind, context, name);
        //     return true;
        // }

        // Find the class constructor for the kind of
        // part requested as a new model. If not known,
        // throw an error
        let modelClass = this.availableParts[kind];
        if(!modelClass){
            throw new Error(`Cannot create unknown part type: ${kind}`);
        }
        let model = new modelClass(ownerPart);
        if(name){
            // TODO! this is a total hack, shold we update the grammar?
            // find a better way to pass args?
            if (kind === "image"){
                model.partProperties.setPropertyNamed(model, "src", name);
            } else {
                model.partProperties.setPropertyNamed(model, 'name', name);
            }
        }
        this.partsById[model.id] = model;

        // Any created part might initialize its
        // own subparts. We need to let the System know
        // about those too
        model.subparts.forEach(subpart => {
            this.partsById[subpart.id] = subpart;
        });


        // If there is a valid owner part for
        // the newly created part model,
        // add the new model to the owner's
        // subparts list
        if(ownerPart){
            ownerPart.addPart(model);
        }

        // Add the System as a property subscriber to
        // the new model. This will send a message to
        // this System object whenever any of this model's
        // properties have changed
        model.addPropertySubscriber(this);

        if(buildView){
            // See if there is already a view for the model.
            // If not, create and attach it.
            let viewForModel = this.findViewById(model.id);
            if(!viewForModel){
                this.newView(model.type, model.id);
            }
        }

        return model;
    },

    // "Deep" copy an existing model, including all it's partProperties
    // (id excluded and owner excluded)
    copyModel(modelId, ownerId){
        // Lookup the instance of the model that
        // matches the owner's id
        let ownerPart = this.partsById[ownerId];
        if(!ownerPart || ownerPart == undefined){
            throw new Error(`System could not locate owner part with id ${ownerId}`);
        }

        let templateModel = this.partsById[modelId];
        let model = templateModel.copy(ownerPart);

        // add the new model to the owner's
        // subparts list
        ownerPart.addPart(model);

        // Add the System as a property subscriber to
        // the new model. This will send a message to
        // this System object whenever any of this model's
        // properties have changed
        model.addPropertySubscriber(this);

        // See if there is already a view for the model.
        // If not, create and attach it.
        let viewForModel = this.findViewById(model.id);
        if(!viewForModel){
            this.newView(model.type, model.id);
        }

        // Reserialize the world
        this.serialize();

        return model;
    },

    // setProperty(property, value, ownerId){
    //     let ownerPart = this.partsById[ownerId];
    //     if(!ownerPart || ownerPart == undefined){
    //         throw new Error(`System could not locate owner part with id ${ownerId}`);
    //     }
    //     ownerPart.partProperties.setPropertyNamed(ownerPart, property, value);
    //     // for now stack properties propagate down to their direct card children
    //     // TODO this should be refactored within a better lifecycle model and potenitally
    //     // use dynamic props. A similar propagation should probably exist for world -> stacks,
    //     // window -> subpart etc
    //     if(ownerPart.type === "stack"){
    //         ownerPart.subparts.forEach((subpart) => {
    //             if(subpart.type === "card"){
    //                 subpart.partProperties.setPropertyNamed(subpart, property, value);
    //             }
    //         });
    //     }
    // },

    setProperty(senders, propName, value, objectId){
        let target;
        let originalSender = senders[0].id;

        if(objectId){
            // Otherwise, if there is an objectId, we are
            // setting the property of a specific part by
            // id
            target = this.partsById[objectId];
        } else {
            // Otherwise we are setting the property on the part
            // that originally sent the message
            target = this.partsById[originalSender];
        }

        if(!target){
            throw new Error(`Could not find setProperty target!`);
        }

        target.partProperties.setPropertyNamed(
            target,
            propName,
            value
        );

        // If the target part is a Stack, we also
        // set this property on all of its Card
        // subparts
        if(target.type == 'stack'){
            target.subparts.filter(subpart => {
                return subpart.type == 'card';
            }).forEach(card => {
                card.partProperties.setPropertyNamed(
                    card,
                    propName,
                    value
                );
            });
        }
    },

    // Remove the model with the given ID from
    // the System's registry, as well as from the subparts
    // array of any owners
    deleteModel: function(modelId){
        let foundModel = this.partsById[modelId];
        if(!foundModel){
            return false;
        }

        let ownerModel = foundModel._owner;
        if(ownerModel){
            ownerModel.removePart(foundModel);
        }

        delete this.partsById[modelId];
        this.removeViews(modelId);
        // in case the model/partView was in the toolbox
        // remove the id reference
        this.removeFromToolbox(modelId);

        // Serialize the state
        this.serialize();
        return true;
    },

    // Remove all views with the corresponding
    // model id from the DOM
    removeViews: function(modelId){
        let views = Array.from(this.findViewsById(modelId));
        views.forEach(view => {
            view.parentElement.removeChild(view);
        });
    },

    newView: function(partName, modelId, parentId){
        let model = this.partsById[modelId];
        if(!model || model == undefined){
            throw new Error(`System does not know part ${partName}[${modelId}]`);
        }
        if(!partName){
            partName = model.type;
        }

        // Find the parent model id. This will
        // help us find the parent view element for
        // appending the new element.
        if (!parentId){
            parentId = model._owner.id;
        }
        let parentElement = this.findViewById(parentId);
        if(!parentElement){
            throw new Error(`Could not find parent element for ${partName}[${modelId}] (model owner id: ${model._owner.id})`);
        }

        // Create the new view instance,
        // append to parent, and set the model
        let newView = document.createElement(
            this.tagNameForViewNamed(partName)
        );
        newView.setModel(model);
        parentElement.appendChild(newView);

        // TODO do we want to allow the possibiliy of a view on an
        // element but no subpart of that view on the element?

        // For all subparts of this model, call
        // the newView method recursively
        model.subparts.forEach(subpart => {
            this.newView(subpart.type, subpart.id);
        });

        return newView;
    },

    addToToolbox(kind, context, name){
        let toolboxModel = this.findToolbox();
        let model = this.newModel(kind, toolboxModel.id, name);
        this.toolbox.push(model.id);
    },

    removeFromToolbox(partId){
        let index = this.toolbox.indexOf(partId);
        if (index > -1){
            this.toolbox.splice(index, 1);
        }
    },

    findToolbox(){
        // TODO this is an awkward way to see if an element is there!
        let toolboxCardModel = null;
        document.querySelectorAll('st-window').forEach((stWindow) => {
            let windowId = stWindow.getAttribute("part-id");
            let part = window.System.partsById[windowId];
            let titleProperty = part.partProperties.findPropertyNamed("title");
            if(titleProperty.getValue() === "Toolbox"){
               // Note: we return the toolbox card not window since this is where
               // toolbox subparts are attached.
               toolboxCardModel = stWindow.querySelector("st-card").model;
            };
        });
        return toolboxCardModel;
    },

    registerPart: function(name, cls){
        this.availableParts[name] = cls;
    },

    registerView: function(name, cls){
        this.availableViews[name] = cls;
    },

    tagNameForViewNamed: function(name){
        return `st-${name}`;
    },

    // Find the first matching view element
    // with the given id
    findViewById: function(id){
        return document.querySelector(`[part-id="${id}"]`);
    },

    // Find all matching view elements with
    // the given part id
    findViewsById: function(id){
        return document.querySelectorAll(`[part-id="${id}"]`);
    },

    // return the model corresponding to the current stack
    getCurrentStackModel: function(){
        // make sure there is only one current-stack
        let currentStacks = document.querySelectorAll('st-world > st-stack.current-stack');
        if(currentStacks.length > 1){
            throw "Found multiple current stacks in world!";
        }
        return currentStacks[0].model;
    },

    // return the model corresponding to the current card
    getCurrentCardModel: function(){
        // there could be multiple current cards (in windows for example) but only one
        // current-card child of a current-stack
        let currentStack = document.querySelector('st-world > st-stack.current-stack');
        let currentCards = currentStack.querySelectorAll(':scope > st-card.current-card');
        if(currentCards.length > 1){
            throw "Found multiple current cards in current stack!";
        }
        return currentCards[0].model;
    },

    // return the model corresponding to the world stack
    getWorldStackModel: function(){
        let worldStack = document.querySelectorAll('st-world');
        if(worldStack.length > 1){
            throw "Found multiple world stack!";
        }
        return worldStack[0].model;
    },

    // return the model corresponding script editor st-field
    // Note: we use the window.model.target to locate the corresponding window
    // but return its st-field subpart
    findScriptEditorByTargetId: function(id){
        let scriptEditorField;
        let windows = document.querySelectorAll("st-window");
        windows.forEach((w) => {
            let target = w.model.target;
            if(target && target.id === id){
                scriptEditorField = w.querySelector("st-field");
            }
        });
        return scriptEditorField;
    },

    serialize: function(){
        let result = {
            parts: {},
            currentCardId: this.getCurrentCardModel().id,
            currentStackId: this.getCurrentStackModel().id
        };
        let world = this.partsById['world'];
        this.serializePart(world, result.parts);

        // If there is not a script tag in the
        // body for the serialization, create it
        let serializationScriptEl = document.getElementById('serialization');
        if(!serializationScriptEl){
            serializationScriptEl = document.createElement('script');
            serializationScriptEl.id = 'serialization';
            serializationScriptEl.type = 'application/json';
            document.body.append(serializationScriptEl);
        }
        serializationScriptEl.innerText = JSON.stringify(result);
        
    },

    deserialize: function(){
        let serializationEl = document.getElementById('serialization');
        if(!serializationEl){
            throw new Error(`No serialization found for this page`);
        }
        let deserializedInfo = JSON.parse(serializationEl.innerText);

        // Start from the WorldStack and recursively
        // create new Parts/Views from the deserialized
        // dictionary
        let worldJSON = deserializedInfo.parts['world'];
        if(!worldJSON){
            throw new Error(`World not found in serialization!`);
        }
        this.deserializePart(worldJSON, null, deserializedInfo.parts);

        // Restore the correct current card
        // and current stack
        let currentStackView = document.querySelector(`[part-id="${deserializedInfo.currentStackId}"]`);
        let currentCardView = document.querySelector(`[part-id="${deserializedInfo.currentCardId}"]`);
        currentStackView.classList.add('current-stack');
        currentCardView.classList.add('current-card');

        // Compile all of the scripts on
        // the available Part models
        Object.keys(this.partsById).forEach(partId => {
            let targetPart = this.partsById[partId];
            let scriptText = targetPart.partProperties.getPropertyNamed(
                targetPart,
                'script'
            );
            if(scriptText){
                // Here we just re-set the script
                // to its original value. This should trigger
                // all prop change subscribers that listen
                // for script changes, which will trigger
                // a compilation step
                targetPart.partProperties.setPropertyNamed(
                    targetPart,
                    'script',
                    scriptText
                );
            }
        });
    },

    serializePart: function(aPart, aDict){
        aDict[aPart.id] = aPart.toJSON();
        aPart.subparts.forEach(subpart => {
            this.serializePart(subpart, aDict);
        });
    },

    deserializePart: function(aPartJSON, ownerId, fullJSON){
        let ownerPart = this.partsById[ownerId];
        let newPartClass = this.availableParts[aPartJSON.type];
        if(!newPartClass){
            throw new Error(`Cannot deserialize Part of type ${aPartJSON.type}!`);
        }
        let newPart = new newPartClass(ownerPart);
        newPart.setFromDeserialized(aPartJSON);
        this.partsById[newPart.id] = newPart;

        // Sometimes a new part will automatically
        // create subparts on itself (stacks make initial card etc)
        // For deserialization we want to undo this
        newPart.subparts.forEach(subpart => {
            newPart.removePart(subpart);
        });

        // Add the System as a prop subscriber
        // to the new part model
        newPart.addPropertySubscriber(this);

        if(ownerPart){
            ownerPart.addPart(newPart);
        }

        // Build a view for the part
        if(newPart.type != 'world'){
            this.newView(newPart.type, newPart.id);
        } else {
            let newView = document.createElement(
                this.tagNameForViewNamed('world')
            );
            newView.setModel(newPart);
            document.body.prepend(newView);
        }

        // Recursively deserialize any referenced
        // subpart ids in the deserialization object
        aPartJSON.subparts.forEach(subpartId => {
            let subpartJSON = fullJSON[subpartId];
            if(!subpartJSON){
                throw new Error(`Could not deserialize Part ${subpartId} -- not found in serialization!`);
            }
            this.deserializePart(subpartJSON, newPart.id, fullJSON);
        });
    },


    /** Navigation of Current World **/
    goToNextStack: function(){
        let worldView = document.querySelector(
            'st-world'
        );
        if(!worldView || worldView == undefined){
            throw new Error(`Could not locate the world view!`);
        }
        return worldView.goToNextStack();
    },

    goToPrevStack: function(){
        let worldView = document.querySelector(
            'st-world'
        );
        if(!worldView || worldView == undefined){
            throw new Error(`Could not locate the world view!`);
        }
        return worldView.goToPrevStack();
    },

    goToStackById: function(stackId){
        let worldView = document.querySelector(
            'st-world'
        );
        if(!worldView || worldView == undefined){
            throw new Error(`Could not locate the world view!`);
        }
        return worldView.goToStackById(stackId);
    },

    /** Navigation of Current Stack **/
    goToNextCard: function(){
        let currentStackView = document.querySelector(
            'st-stack.current-stack'
        );
        if(!currentStackView || currentStackView == undefined){
            throw new Error(`Could not locate an active current stack!`);
        }
        return currentStackView.goToNextCard();
    },

    goToPrevCard: function(){
        let currentStackView = document.querySelector(
            'st-stack.current-stack'
        );
        if(!currentStackView || currentStackView == undefined){
            throw new Error(`Could not locate an active current stack!`);
        }
        return currentStackView.goToPrevCard();
    },

    goToCardById: function(cardId){
        let currentStackView = document.querySelector(
            'st-stack.current-stack'
        );
        if(!currentStackView || currentStackView == undefined){
            throw new Error(`Could not locate an active current stack!`);
        }
        return currentStackView.goToCardById(cardId);
    },

    openEditorForPart: function(partType, partId){
        // if there is already and editor open for this part do nothing
        let editor = document.querySelector(`st-${partType}-editor[target-id="${partId}"]`);
        if(editor){
            return;
        }
        let currentCard = this.getCurrentCardModel();
        let currentCardView = this.findViewById(currentCard.id);
        if(partType === 'button'){
            // Create the new view instance,
            // append to parent, and set the target 
            editor = document.createElement(
                "st-button-editor"
            );
        }
        currentCardView.appendChild(editor);
        editor.setTarget(partId);
    },

    closeEditorForPart: function(partType, partId){
        let editor = document.querySelector(`st-${partType}-editor[target-id="${partId}"]`);
        editor.parentNode.removeChild(editor);
    }
};

/** Add Default System Command Handlers **/
//System._commandHandlers['deleteModel'] = System.deleteModel;
System._commandHandlers['deleteModel'] = function(senders, ...rest){
    System.deleteModel(...rest);
};
//System._commandHandlers['newModel'] = System.newModel;
System._commandHandlers['newModel'] = function(senders, ...rest){
    System.newModel(...rest);
    this.serialize();
};
//System._commandHandlers['copyModel'] = System.copyModel;
System._commandHandlers['copyModel'] = function(senders, ...rest){
    System.copyModel(...rest);
};
//System._commandHandlers['newView'] = System.newView;
System._commandHandlers['newView'] = function(senders, ...rest){
    System.newView(...rest);
};
System._commandHandlers['setProperty'] = System.setProperty;

System._commandHandlers['ask'] = function(senders, question){
    // Use the native JS prompt function to ask the question
    // and return its value.
    // By returning here, we expect the implicit variable
    // "it" to be set inside any calling script
    return prompt(question);
};

System._commandHandlers['putInto'] = function(senders, value, variableName, global){
    if(global){
        System.executionStack.setGlobal(variableName, value);
        return;
    }
    // Because we push all handlers onto the execution stack,
    // the putInto handler is currently at the top of the stack.
    // In order to modify the caller's variables, we need to
    // find the context that is one previous on the stack
    if(System.executionStack.previous){
        System.executionStack.previous.setLocal(variableName, value);
    } else {
        throw new Error(`ExecutionStack Error: #putInto on top of empty stack!`);
    }
};

System._commandHandlers['answer'] = function(senders, value){
    alert(value.toString());
};

System._commandHandlers['go to direction'] = function(senders, directive, objectName){
    switch(objectName) {
        case 'card':
            switch(directive){
                case 'next':
                    this.goToNextCard();
                    break;

                case 'previous':
                    this.goToPrevCard();
                    break;
            }
            break;

        case 'stack':
            switch(directive){
                case 'next':
                    this.goToNextStack();
                    break;

                case 'previous':
                    this.goToPrevStack();
                    break;
            }
            break;

        default:
            alert(`"go to" not implemented for ${objectName}`);

    }
};

System._commandHandlers['go to reference'] = function(senders, objectName, referenceId){
    switch(objectName) {
        case 'card':
            this.goToCardById(referenceId);
            break;

        case 'stack':
            this.goToStackById(referenceId);
            break;

        default:
            alert(`"go to" not implemented for ${objectName}`);

    }
};

// Opens a basic tool window on the Part of the given
// id. If no ID is given, we assume the tool window
// is for the current stack.
System._commandHandlers['openToolbox'] = function(senders, targetId){
    let targetPart;
    if(!targetId){
        targetId = Object.keys(this.partsById).find(key => {
            return this.partsById[key].type == 'stack';
        });
        targetPart = this.partsById[targetId];
    } else {
        targetPart = this.partsById[targetId];
    }

    if(!targetPart || targetPart == undefined){
        throw new Error(`Could not locate current Stack or Part with id ${targetId}`);
    }

    let windowModel = this.newModel('window', targetPart.id);
    let windowStack = this.newModel('stack', windowModel.id);
    windowModel.partProperties.setPropertyNamed(
        windowModel,
        'title',
        'Toolbox'
    );

    // Get the current card on the window stack etc
    let windowStackView = this.findViewById(windowStack.id);
    let windowCurrentCardModel = windowStackView.querySelector('.current-card').model;

    // Set the current card of the window to have a list layout,
    // which defaults to a column listDirection
    windowCurrentCardModel.partProperties.setPropertyNamed(
        windowCurrentCardModel,
        'layout',
        'list'
    );
    windowCurrentCardModel.partProperties.setPropertyNamed(
        windowCurrentCardModel,
        'listDirection',
        'column' //TODO sort out this bug!
    );

    // Do more toolbox configuration here
    // like making the buttons with their
    // scripts, etc
    windowStackView.classList.add('window-stack');
    let addBtnBtn = this.newModel('button', windowCurrentCardModel.id);
    addBtnBtn.partProperties.setPropertyNamed(
        addBtnBtn,
        'name',
        'Add Button to Card'
    );

    let addBtnScript = 'on click\n    add button to current card\nend click';
    addBtnBtn.partProperties.setPropertyNamed(
        addBtnBtn,
        'script',
        addBtnScript
    );
    System.sendMessage(
        {type: "compile", codeString: addBtnScript, targetId: addBtnBtn.id},
        System,
        System
    );

    // Add a button to add a new Container
    let addContainerBtn = this.newModel('button', windowCurrentCardModel.id);
    addContainerBtn.partProperties.setPropertyNamed(
        addContainerBtn,
        'name',
        'Add Container to Card'
    );
    let addContainerScript = 'on click\n    add container to current card\nend click';
    addContainerBtn.partProperties.setPropertyNamed(
        addContainerBtn,
        'script',
        addContainerScript
    );
    System.sendMessage(
        {type: "compile", codeString: addContainerScript, targetId: addContainerBtn.id},
        System,
        System
    );

    let addBtnToStackBtn = this.newModel('button', windowCurrentCardModel.id);
    addBtnToStackBtn.partProperties.setPropertyNamed(
        addBtnToStackBtn,
        'name',
        'Add Button to Stack'
    );
    let addBtnToStackScript = 'on click\n    add button to current stack\nend click';
    addBtnToStackBtn.partProperties.setPropertyNamed(
        addBtnToStackBtn,
        'script',
        addBtnToStackScript
    );
    System.sendMessage(
        {type: "compile", codeString: addBtnToStackScript, targetId: addBtnToStackBtn.id},
        System,
        System
    );

    let addBtnToToolboxBtn = this.newModel('button', windowCurrentCardModel.id);
    addBtnToToolboxBtn.partProperties.setPropertyNamed(
        addBtnToToolboxBtn,
        'name',
        'Add Button to Toolbox'
    );
    let addBtnToToolboxScript = 'on click\n    add button "New Button" to this card\nend click';
    addBtnToToolboxBtn.partProperties.setPropertyNamed(
        addBtnToToolboxBtn,
        'script',
        addBtnToToolboxScript
    );
    System.sendMessage(
        {type: "compile", codeString: addBtnToToolboxScript, targetId: addBtnToToolboxBtn.id},
        System,
        System
    );

    // Add a button to add a Drawing
    let addDrawingBtn = this.newModel('button', windowCurrentCardModel.id);
    addDrawingBtn.partProperties.setPropertyNamed(
        addDrawingBtn,
        'name',
        'Add Drawing to Card'
    );
    addDrawingBtn._commandHandlers['click'] = function(){
        let currentCardView = document.querySelector('.current-stack > .current-card');
        let cardModel = currentCardView.model;
        let newDrawing = System.newModel('drawing', cardModel.id);
        newDrawing.partProperties.setPropertyNamed(
            newDrawing,
            'name',
            `Drawing ${newDrawing.id}`
        );

        // By default, we open the drawing in
        // drawing mode, so user can immediately
        // begin to paint
        newDrawing.partProperties.setPropertyNamed(
            newDrawing,
            'mode',
            'drawing'
        );
    };

    // Add a button to add a Image
    let addImageBtn = this.newModel('button', windowCurrentCardModel.id);
    addImageBtn.partProperties.setPropertyNamed(
        addImageBtn,
        'name',
        'Add Image to Card'
    );
    let addImageBtnScript = 'on click\n    add image to current card\nend click';
    addImageBtn.partProperties.setPropertyNamed(
        addImageBtn,
        'script',
        addImageBtnScript
    );
    System.sendMessage(
        {type: "compile", codeString: addImageBtnScript, targetId: addImageBtn.id},
        System,
        System
    );

    // Add a button to add a Field
    let addFieldBtn = this.newModel('button', windowCurrentCardModel.id);
    addFieldBtn.partProperties.setPropertyNamed(
        addFieldBtn,
        'name',
        'Add Field to Card'
    );
    let addFieldBtnScript = 'on click\n    add field to current card\nend click';
    addFieldBtn.partProperties.setPropertyNamed(
        addFieldBtn,
        'script',
        addFieldBtnScript
    );
    System.sendMessage(
        {type: "compile", codeString: addFieldBtnScript, targetId: addFieldBtn.id},
        System,
        System
    );

};

System._commandHandlers['openWorldCatalog'] = function(senders, targetId){
    let targetPart;
    if(!targetId){
        targetPart = this.getCurrentStackModel();
    } else {
        targetPart = this.partsById[targetId];
    }

    if(!targetPart || targetPart == undefined){
        throw new Error(`Could not locate current Stack or Part with id ${targetId}`);
    }

    let windowModel = this.newModel('window', targetPart.id);
    let windowStack = this.newModel('stack', windowModel.id);
    windowModel.partProperties.setPropertyNamed(
        windowModel,
        'title',
        'World Catalog'
    );

    // Get the current card on the window stack etc
    let windowStackView = this.findViewById(windowStack.id);
    let windowCurrentCardModel = windowStackView.querySelector('.current-card').model;

    // Set the current card of the window to have a list layout,
    // which defaults to a column listDirection
    // NOTE!!! listDirection is not subscribed to, so it must come before layout
    // TODO!!!
    windowCurrentCardModel.partProperties.setPropertyNamed(
        windowCurrentCardModel,
        'listDirection',
        'column'
    );
    windowCurrentCardModel.partProperties.setPropertyNamed(
        windowCurrentCardModel,
        'layout',
        'list'
    );

    windowStackView.classList.add('window-stack');
    //TODO this should be updated as parts, views mature
    const ignoreParts = ["field", "field", "background", "world"];
    Object.keys(System.availableParts).forEach((partName) => {
        if (ignoreParts.indexOf(partName) === -1){
            let partModel;
            let script;
            if (partName === "stack"){
                script = 'on click\n    add  stack "new stack" to world \nend click';
                partModel = this.newModel(
                    "image",
                    windowCurrentCardModel.id,
                    '/images/stack.svg'
                );
            } else if (partName === "card"){
                script = 'on click\n    add card "new card" to current stack \nend click';
                partModel = this.newModel(
                    "image",
                    windowCurrentCardModel.id,
                    '/images/card.svg'
                );
            } else if (partName === "window"){
                script = 'on click\n    add window "new window" to current stack \nend click';
                partModel = this.newModel(
                    "image",
                    windowCurrentCardModel.id,
                    '/images/window.svg'
                );
            } else if (partName === "container"){
                script = 'on click\n    add container "new container" to current card \nend click';
                partModel = this.newModel(
                    "image",
                    windowCurrentCardModel.id,
                    '/images/container.svg'
                );
            } else if (partName === "button"){
                script = 'on click\n    add button "new button" to current card \nend click';
                partModel = this.newModel(partName, windowCurrentCardModel.id);
            } else if (partName === "drawing"){
                script = 'on click\n    add drawing "new drawing" to current card \nend click';
                partModel = this.newModel(
                    "image",
                    windowCurrentCardModel.id,
                    '/images/drawing.svg'
                );
            } else if (partName === "image"){
                script = 'on click\n    add image to current card \nend click';
                partModel = this.newModel("image", windowCurrentCardModel.id);
            }

            let view = this.findViewById(partModel.id);
            view.wantsHaloResize = false;
            partModel.partProperties.setPropertyNamed(
                partModel,
                'name',
                partName
            );
            partModel.partProperties.setPropertyNamed(
                partModel,
                'script',
                script
            );
            System.sendMessage(
                {type: "compile", codeString: script, targetId: partModel.id},
                System,
                System
            );
        }
    });
};

System._commandHandlers['openScriptEditor'] = function(senders, targetId){
    let targetPart = this.partsById[targetId];
    if(!targetPart){
        throw new Error(`No such part with id ${targetId}!`);
    }

    // The stack where the window will be inserted will
    // be the current stack
    let currentStackView = document.querySelector('.current-stack');
    let insertStack = currentStackView.model;


    if(!insertStack){
        throw new Error(`Could not find a Stack parent for ${targetPart.type}[${targetId}]`);
    }

    let winModel = this.newModel('window', insertStack.id);
    winModel.setTarget(targetPart);
    let targetName = targetPart.partProperties.getPropertyNamed(targetPart, "name");
    let winTitle = `Script: ${targetName}(${targetPart.type}[${targetId}])`;
    winModel.partProperties.setPropertyNamed(
        winModel,
        'title',
        winTitle
    );
    let winView = this.findViewById(winModel.id);
    let winStackModel = this.newModel('stack', winModel.id);
    let winStackView = this.findViewById(winStackModel.id);
    winStackView.classList.add('window-stack');
    let currentCardView = winView.querySelector('.current-stack .current-card');
    let currentCard = currentCardView.model;

    // Set the current card's layout to be a column list
    currentCard.partProperties.setPropertyNamed(
        currentCard,
        'layout',
        'list'
    );

    // Create the Field model and attach to current card
    // of the new window.
    let fieldModel = this.newModel('field', currentCard.id);
    let fieldView = this.findViewById(fieldModel.id);
    // Set the field's htmlContent to be the textToHtml converted
    // script of the given target part.
    let currentScript = targetPart.partProperties.getPropertyNamed(
        targetPart,
        'script'
    );

    let htmlContent = fieldView.textToHtml(currentScript);
    // set the inner html of the textarea with the proper htmlContent
    // NOTE: at the moment fieldView does not subscribe to htmlContent
    // change due to cursor focus and other issues
    let textArea = fieldView._shadowRoot.querySelector(".field-textarea");
    textArea.innerHTML = htmlContent;
    fieldModel.partProperties.setPropertyNamed(
        fieldModel,
        'htmlContent',
        htmlContent
    );

    let saveBtnModel = this.newModel('button', currentCard.id);
    saveBtnModel.partProperties.setPropertyNamed(
        saveBtnModel,
        'name',
        'Save Script'
    );

    let saveBtnView = this.findViewById(saveBtnModel.id);

    // Set the save button's action to be to save the script
    // on the part
    saveBtnModel._commandHandlers['click'] = function(){
        let textContent = fieldModel.partProperties.getPropertyNamed(
            fieldModel,
            'textContent'
        );
        targetPart.partProperties.setPropertyNamed(
            targetPart,
            'script',
            textContent
        );
    };
};

System._commandHandlers['openSimpletalkGrammar'] = function(senders, ruleName){
    // The stack where the window will be inserted will
    // be the current stack
    let currentStackView = document.querySelector('.current-stack');
    let insertStack = currentStackView.model;

    let winModel = this.newModel('window', insertStack.id);
    let winTitle = "Simpltetalk Grammar";
    winModel.partProperties.setPropertyNamed(
        winModel,
        'title',
        winTitle
    );
    let winView = this.findViewById(winModel.id);
    let winStackModel = this.newModel('stack', winModel.id);
    let winStackView = this.findViewById(winStackModel.id);
    winStackView.classList.add('window-stack');
    let currentCardView = winView.querySelector('.current-stack .current-card');
    let currentCard = currentCardView.model;

    // Set the current card's layout to be a column list
    currentCard.partProperties.setPropertyNamed(
        currentCard,
        'layout',
        'list'
    );

    // Create the Field model and attach to current card
    // of the new window.
    let fieldModel = this.newModel('field', currentCard.id);
    let fieldView = this.findViewById(fieldModel.id);
    // Set the field's htmlContent to be the textToHtml converted
    // Simpletalk grammar.
    let grammar = System.grammar.source.sourceString;

    let htmlContent = fieldView.textToHtml(grammar);
    // set the inner html of the textarea with the proper htmlContent
    // NOTE: at the moment fieldView does not subscribe to htmlContent
    // change due to cursor focus and other issues
    let textArea = fieldView._shadowRoot.querySelector(".field-textarea");
    textArea.innerHTML = htmlContent;
    fieldModel.partProperties.setPropertyNamed(
        fieldModel,
        'htmlContent',
        htmlContent
    );

    // if the ruleName has been provided, scroll that into view
    if(ruleName){
        let regex = `${ruleName}`;
        for(var i = 0; i < textArea.children.length; i++){
            let line = textArea.children[i];
            let text = line.textContent;
            if(text.match(regex)){
                try{
                    line.scrollIntoView();
                } catch (e) {
                    console.log("script editor does not support line.scrollInfoView()");
                };
            }
        };
    }
};

System._commandHandlers['openDebugger'] = function(senders, partId){
    let target = this.partsById[partId];
    // The stack where the window will be inserted will
    // be the current stack
    let currentStackView = document.querySelector('.current-stack');
    let insertStack = currentStackView.model;

    let winModel = this.newModel('window', insertStack.id);
    let winTitle = "Command Handlers";
    winModel.partProperties.setPropertyNamed(
        winModel,
        'title',
        winTitle
    );
    let winView = this.findViewById(winModel.id);
    let winStackModel = this.newModel('stack', winModel.id);
    let winStackView = this.findViewById(winStackModel.id);
    winStackView.classList.add('window-stack');
    let currentCardView = winView.querySelector('.current-stack .current-card');
    let currentCard = currentCardView.model;

    // Set the current card's layout to be a column list
    currentCard.partProperties.setPropertyNamed(
        currentCard,
        'layout',
        'list'
    );

    // Create the Field model and attach to current card
    // of the new window.
    let fieldModel = this.newModel('field', currentCard.id);
    let fieldView = this.findViewById(fieldModel.id);

    let textContent = "";
    Object.keys(target.commandHandlerRegistry).forEach((name) =>{
        let info = target.commandHandlerRegistry[name];
        textContent += `${name}: ${JSON.stringify(info)}\n`;
    });
    let htmlContent = fieldView.textToHtml(textContent);
    // set the inner html of the textarea with the proper htmlContent
    // NOTE: at the moment fieldView does not subscribe to htmlContent
    // change due to cursor focus and other issues
    let textArea = fieldView._shadowRoot.querySelector(".field-textarea");
    textArea.innerHTML = htmlContent;
    fieldModel.partProperties.setPropertyNamed(
        fieldModel,
        'htmlContent',
        htmlContent
    );
};

System._commandHandlers['saveHTML'] = function(senders){
    let clonedDocument = document.cloneNode(true);
    let world = clonedDocument.querySelector('st-world');
    if(world){
        world.remove();
    }
    
    let anchor = document.createElement('a');
    anchor.style.display = "none";
    document.body.append(anchor);

    let stamp = Date.now().toString();
    let serializedPage = new XMLSerializer().serializeToString(clonedDocument);
    let typeInfo = "data:text/plain;charset=utf-8";
    let url = `${typeInfo},${encodeURIComponent(serializedPage)}`;
    anchor.href = url;
    anchor.download = `SimpleTalkSnapshot_${stamp}.html`;
    anchor.click();
    window.URL.revokeObjectURL(url);
    anchor.parentElement.removeChild(anchor);
};

System._commandHandlers['tell'] = (senders, targetId, deferredMessage) => {
    let targetPart = System.partsById[targetId];
    if(!targetPart){
        throw new Error(`Attempted to tell part id ${targetId}: no such part!`);
    }
    targetPart.sendMessage(deferredMessage, targetPart);
};

System._commandHandlers['startVideo'] = () => {
    if (video.srcObject !== null) {
        return;
    }
    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
        video.srcObject = stream;
        video.play();
    });
};

System._commandHandlers['stopVideo'] = () => {
    if (video.srcObject === null) {
        return;
    }
    video.pause();
    const tracks = video.srcObject.getTracks();
    for (var i = 0; i < tracks.length; i++) {
        tracks[i].stop();
    }
    video.srcObject = null;
};

// https://aaronsmith.online/easily-load-an-external-script-using-javascript/
const loadScript = src => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.onload = resolve;
        script.onerror = reject;
        script.src = src;
        document.head.append(script);
    });
};

const loadHandDetectionModel = () => {
    if (handDetectionModel === null) {
        window.tf.loadFrozenModel(
            "https://cdn.jsdelivr.net/npm/handtrackjs/models/web/ssdlitemobilenetv2/tensorflowjs_model.pb",
            "https://cdn.jsdelivr.net/npm/handtrackjs/models/web/ssdlitemobilenetv2/weights_manifest.json"
        ).then(model => {
            console.log("hand detection model loaded");
            handDetectionModel = model;
        }).catch(err => {
            console.log("error loading hand detection model");
            console.log(err);
        });
    }
}

System._commandHandlers['startHandDetectionModel'] = () => {
    if (typeof window.tf === 'undefined') {
        loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@0.13.5/dist/tf.js").then(() => {
            loadHandDetectionModel();
        });
    } else {
        loadHandDetectionModel();
    }
};

const unloadHandDetectionModel = () => {
    console.log(handDetectionModel);
    handDetectionModel = null;
}

System._commandHandlers['stopHandDetectionModel'] = () => {
    unloadHandDetectionModel();
};

const scaleDim = (dim) => {
    const scale = 0.7;
    const stride = 16;
    const evenRes = dim * scale - 1;
    return evenRes - (evenRes % stride) + 1;
};

const detectHands = async (recipientId) => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const scaledWidth = scaleDim(canvas.width);
    const scaledHeight = scaleDim(canvas.height);
    const image = tf.fromPixels(canvas).resizeBilinear([scaledHeight, scaledWidth]).expandDims(0);
    const bboxes = await handDetectionModel.executeAsync(image).then(result => {
        const [scores, boxes] = result;
        const indices = tf.image.nonMaxSuppression(
            boxes.reshape([boxes.shape[1], boxes.shape[3]]),
            scores.reshape([scores.shape[1]]),
            20,
            0.5,
            0.80).dataSync();
        var bboxes = [];
        var idx;
        for (let i = 0; i < indices.length; i++) {
            idx = indices[i];
            var score = scores.get(0, idx, 0);
            // Original order is [minY, minX, maxY, maxX] so we reorder.
            var box = {
                upperLeft: [boxes.get(0, idx, 0, 1), boxes.get(0, idx, 0, 0)],
                lowerRight: [boxes.get(0, idx, 0, 3), boxes.get(0, idx, 0, 2)]
            };
            bboxes.push({score: score, box: box});
        }
        return bboxes;
    });
    if (recipientId === null) {
        console.log(bboxes);
    } else {
        let recipient = System.partsById[recipientId];
        let msg = {
            type: 'command',
            commandName: 'detectedHands',
            args: [JSON.stringify(bboxes, null, 4)]
        };
        System.sendMessage(msg, System, recipient);
    }
};

System._commandHandlers['detectHands'] = (senders, recipientId) => {
    if (handDetectionModel === null) {
        console.log("Error: no hand detection model loaded");
        return;
    }
    if (recipientId === undefined) {
        if (senders !== undefined && senders.length) {
            recipientId = senders[0].id;
        } else {
            recipientId = null;
        }
    }
    detectHands(recipientId);
};


/** Register the initial set of parts in the system **/
System.registerPart('card', Card);
System.registerPart('stack', Stack);
System.registerPart('field', Field);
System.registerPart('button', Button);
System.registerPart('world', WorldStack);
System.registerPart('window', Window);
System.registerPart('field', Field);
System.registerPart('container', Container);
System.registerPart('drawing', Drawing);
System.registerPart('image', Image);

/** Register the initial set of views in the system **/
System.registerView('button', ButtonView);
System.registerView('stack', StackView);
System.registerView('world', WorldView);
System.registerView('card', CardView);
System.registerView('window', WindowView);
System.registerView('field', FieldView);
System.registerView('container', ContainerView);
System.registerView('drawing', DrawingView);
System.registerView('image', ImageView);


// Convenience method for adding all of the
// available custom elements to the window object's
// customElements registry
System.registerCustomElements = function(){
    Object.keys(System.availableViews).forEach(partName => {
        let viewClass = System.availableViews[partName];
        let elementName = System.tagNameForViewNamed(partName);
        window.customElements.define(elementName, viewClass);
    });
};

// iniitalize the compiler and add it to the system
// Instantiate the grammar.
let languageGrammar;
if (window.grammar){
    // for testing it is sometimes convenient to load the grammar and add to window
    // see ./tests/preload.js for example
    languageGrammar = ohm.grammar(window.grammar);
} else {
    languageGrammar = ohm.grammarFromScriptElement();
}

System.grammar = languageGrammar;

// Set the exection stack on the
// System
System.executionStack = new ExecutionStack();

document.addEventListener('DOMContentLoaded', () => {
    // Add the System object to window so
    // that it is global on the page. We do this
    // for both debugging and testing.
    window.System = System;
    // Add the possible views as webcomponents
    // in the custom element registry
    System.registerCustomElements();

    // Add any other non-part view CustomElements,
    // like the halo
    window.customElements.define('st-halo', Halo);
    window.customElements.define('st-button-editor', ButtonEditorView);

    // Perform the initial setup of
    // the system
    System.initialLoad();
});

export {
    System,
    System as default
};
