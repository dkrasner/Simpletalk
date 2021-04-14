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
import Drawing from './parts/Drawing.js';
import Audio from './parts/Audio.js';
import Image from './parts/Image.js';
import Area from './parts/Area.js';

import WorldView from './views/WorldView.js';
import StackView from './views/StackView.js';
import ButtonView from './views/ButtonView.js';

import CardView from './views/CardView.js';
import WindowView from './views/WindowView';
import FieldView from './views/FieldView.js';
import DrawingView from './views/drawing/DrawingView.js';
import ImageView from './views/ImageView.js';
import AreaView from './views/AreaView.js';
import AudioView from './views/AudioView.js';


import Halo from './views/Halo.js';
import EditorView from './views/editors/EditorView.js';
import STNavigator from './views/navigator/Navigator.js';

import ohm from 'ohm-js';
import interpreterSemantics from '../ohm/interpreter-semantics.js';
import {ExecutionStack, ActivationContext} from './ExecutionStack.js';

import idMaker from './utils/id.js';
import STClipboard from './utils/clipboard.js';

import handInterface from './utils/handInterface.js';

import {STDeserializer, STSerializer} from './utils/serialization.js';

const DOMparser = new DOMParser();



const System = {
    name: "System",
    id: -1,
    isLoaded: false,
    partsById: {},
    _commandHandlers: {},
    _functionHandlers: {},

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
        if(serializationEl && serializationEl.text != ""){
            this.deserialize()
                .then(() => {
                    this.sendInitialOpenMessages();
                    System.navigator.setModel(
                        System.partsById['world']
                    );
                });
        } else {
            this.loadFromEmpty();
            System.navigator.setModel(
                System.partsById['world']
            );
            this.sendInitialOpenMessages();
        }

        // Attach a new clipboard instance
        this.clipboard = new STClipboard(this);

        // By this point we should have a WorldView with
        // a model attached.
        this.isLoaded = true;
    },


    loadFromEmpty: function(){
        let worldModel = new this.availableParts['world']();
        this.partsById[worldModel.id] = worldModel;
        let worldView = document.createElement(
            this.tagNameForViewNamed('world')
        );
        worldView.setModel(worldModel);
        document.body.appendChild(worldView);

        // Create initial stack model
        let initStack = this.newModel('stack', worldModel.id);

        // Create initial card model for that stack
        let initCard = this.newModel('card', initStack.id);

        // Update current stack and card values
        worldModel.partProperties.setPropertyNamed(
            worldModel,
            'current',
            0
        );
        initStack.partProperties.setPropertyNamed(
            initStack,
            'current',
            0
        );
        // Update serialization
        this.serialize();
    },

    sendInitialOpenMessages: function(){
        // Send the openWorld message to the WorldStack
        let world = this.partsById['world'];
        world.sendMessage({
            type: 'command',
            commandName: 'openWorld',
            args: [],
            shouldIgnore: true
        }, world);
        world.sendMessage({
            type: 'command',
            commandName: 'openStack',
            args: [],
            shouldIgnore: true
        }, world.currentStack);
        world.currentStack.sendMessage({
            type: 'command',
            commandName: 'openCard',
            args: [],
            shouldIgnore: true
        }, world.currentStack.currentCard);
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

        // this.passDevToolMessage(aMessage, source, target);
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
        if(aMessage.serialize){
            this.serialize();
        }
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

        // Make sure to stop all stepping
        // on the Part, otherwise stepping
        // intervals will error infinitely
        foundModel.stopStepping();

        let ownerModel = foundModel._owner;
        if(ownerModel){
            ownerModel.removePart(foundModel);
        }

        // close all open editors, otherwise they will
        // be orphaned in the view
        foundModel.partProperties.setPropertyNamed(foundModel, "editorOpen", false);

        delete this.partsById[modelId];
        this.removeViews(modelId);

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
        let lenses = this.findLensViewsById(modelId);
        lenses.forEach(lensView => {
            lensView.parentElement.removeChild(lensView);
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
        // if the new model is a Card we make sure add it after the last card
        // on the stack
        if(newView.name === 'CardView' && parentElement.childNodes.length){
            let lastCard;
            parentElement.childNodes.forEach((child) => {
                if(child.name === "CardView"){
                    lastCard = child;
                }
                lastCard.after(newView);
            });
        } else {
            parentElement.appendChild(newView);
        }

        // Dispatch a CustomEvent on the parentElement
        // indicating that this part has been created, and
        // any view utilities that care can be notified.
        let event = new CustomEvent('st-view-added', {
            detail: {
                partType: model.type,
                partId: model.id,
                ownerId: model._owner.id || null
            } 
        });
        parentElement.dispatchEvent(event);

        // See if there are lens views and update
        // those as well
        let lensViews = this.findLensViewsById(parentId);
        lensViews.forEach(lensView => {
            let newLensView = document.createElement(
                this.tagNameForViewNamed(partName)
            );
            newLensView.setModel(model);
            newLensView.removeAttribute('part-id');
            newLensView.setAttribute('lens-part-id', modelId);
            newLensView.setAttribute('role', 'lens');
            lensView.appendChild(newLensView);
        });

        // TODO do we want to allow the possibiliy of a view on an
        // element but no subpart of that view on the element?

        // For all subparts of this model, call
        // the newView method recursively
        model.subparts.forEach(subpart => {
            this.newView(subpart.type, subpart.id);
        });

        return newView;
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

    findLensViewsById: function(id){
        return Array.from(document.querySelectorAll(`[lens-part-id="${id}"]`));
    },

    // Find all matching view elements with
    // the given part id
    findViewsById: function(id){
        return document.querySelectorAll(`[part-id="${id}"]`);
    },

    // return the model corresponding to the current stack
    getCurrentStackModel: function(){
        let world = this.getWorldStackModel();
        return world.currentStack;
    },

    // return the model corresponding to the current card
    getCurrentCardModel: function(){
        let currentStack = this.getCurrentStackModel();
        return currentStack.currentCard;
    },

    // return the model corresponding to the world stack
    getWorldStackModel: function(){
        return this.partsById['world'];
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
        let world = this.partsById['world'];
        if(!world){
            throw new Error(`No world found!`);
        }
        let serializer = new STSerializer(this);
        let serialString = serializer.serialize(this.partsById['world'], false);

        // If there is not a script tag in the
        // body for the serialization, create it
        let serializationScriptEl = document.getElementById('serialization');
        if(!serializationScriptEl){
            serializationScriptEl = document.createElement('script');
            serializationScriptEl.id = 'serialization';
            serializationScriptEl.type = 'application/json';
            document.body.append(serializationScriptEl);
        }
        serializationScriptEl.textContent = serialString;
    },

    deserialize: function(){
        let serializationEl = document.getElementById('serialization');
        if(!serializationEl){
            throw new Error(`No serialization found for this page`);
        }
        let deserializer = new STDeserializer(this);
        deserializer.useOriginalIds = true;
        return deserializer.deserialize(serializationEl.textContent);
    },

    // Return a *complete* HTML
    // representation of the current application
    // that can later be saved to a file
    getFullHTMLString: function(){
        let clonedDocument = document.cloneNode(true);
        let world = clonedDocument.querySelector('st-world');
        if(world){
            world.remove();
        }
        return clonedDocument.documentElement.outerHTML;
    },


    /** Navigation of Current World **/
    goToNextStack: function(){
        let world = this.partsById['world'];
        return world.goToNextStack();
    },

    goToPrevStack: function(){
        let world = this.partsById['world'];
        return world.goToPrevStack();
    },

    goToStackById: function(stackId){
        let world = this.partsById['world'];
        return world.goToStackById(stackId);
    },

    /** Navigation of Current Stack **/
    goToNextCard: function(){
        let currentStack = this.getCurrentStackModel(); 
        return currentStack.goToNextCard();
    },

    goToPrevCard: function(){
        let currentStack = this.getCurrentStackModel();
        return currentStack.goToPrevCard();
    },

    goToCardById: function(cardId){
        let currentStack = this.getCurrentStackModel();
        return currentStack.goToCardById(cardId);
    },

    openEditorForPart: function(partId){
        // if there is already and editor open for this part do nothing
        let editor = document.querySelector(`st-editor[target-id="${partId}"]`);
        if(editor){
            return;
        }
        let currentCard = this.getCurrentCardModel();
        let currentCardView = this.findViewById(currentCard.id);
        editor = document.createElement(
            "st-editor"
        );
        currentCardView.appendChild(editor);
        editor.setTarget(partId);
    },

    closeEditorForPart: function(partId){
        let editor = document.querySelector(`st-editor[target-id="${partId}"]`);
        if(editor){
            editor.parentNode.removeChild(editor);
        }
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

//Import a world, i.e. its stacks from another source
System._commandHandlers['importWorld'] = function(sender, sourceUrl){
    if(!sourceUrl){
        sourceUrl = window.prompt("Choose World location");
    }
    fetch(sourceUrl)
        .then(response => {
            let contentType = response.headers.get('content-type');
            if(!contentType.startsWith('text/html')){
                throw new Error(`Invalid content type: ${contentType}`);
            }
            return response.blob().then(blob => {
                let reader = new FileReader();
                reader.readAsText(blob);
                reader.onloadend = () => {
                    let parsedDocument = DOMparser.parseFromString(reader.result, "text/html");
                    // there is no .getElementById() for a node HTML parsed document!
                    let serializationEl = parsedDocument.querySelector('#serialization');
                    if(!serializationEl){
                        throw new Error(`No serialization found for this page`);
                    }
                    let deserializer = new STDeserializer(this);
                    deserializer.targetId = 'world'; // We will insert the stacks into the world
                    return deserializer.importFromSerialization(
                        serializationEl.textContent,
                        (part) => {
                            // Return only Stacks that are direct subparts
                            // of the world.
                            let isStack = part.type == 'stack';
                            let isWorldSubpart = part._owner && part._owner.type == 'world';
                            return isStack && isWorldSubpart;
                        }
                    ).then(() => {
                        // Tell the world to update current, in case
                        // a new StackView was attached with current set.
                        document.querySelector('st-world').updateCurrentStack();
                    });
                };
            });
        })
        .then(() => {
            // Manually set the _src.
            // This ensures that we don't infinitely
            // call the load operation
            this._src = sourceUrl;
        })
        .catch(err => {
            console.error(err);
        });
};

System._commandHandlers['openScriptEditor'] = function(senders, targetId){
    let target = this.partsById[targetId];
    let currentCard = this.getCurrentCardModel();
    let window = this.newModel('window', currentCard.id);
    let stack = this.newModel('stack', window.id);
    let card = this.newModel('card', stack.id);
    let scriptField = this.newModel('field', card.id);
    let saveButton = this.newModel('button', card.id);

    let targetName = target.partProperties.getPropertyNamed(target, "name");
    if(targetName){
        targetName = `"${targetName}"`;
    }
    let name = `Script For ${target.name} ${targetName} id ${target.id}`;

    // setup the window and stack properties
    window.setTarget(target);
    window.partProperties.setPropertyNamed(window, "title", name);
    stack.partProperties.setPropertyNamed(stack, "current", 0);

    card.partProperties.setPropertyNamed(card, "layout", "list");
    card.partProperties.setPropertyNamed(card, "list-direction", "column");

    // script field
    let targetScript = target.partProperties.getPropertyNamed(target, "script");
    scriptField.partProperties.setPropertyNamed(scriptField, "text", targetScript);
    scriptField.partProperties.setPropertyNamed(scriptField, "horizontal-resizing", "space-fill");
    scriptField.partProperties.setPropertyNamed(scriptField, "vertical-resizing", "space-fill");

    // setup up the save button properties
    saveButton.partProperties.setPropertyNamed(saveButton, "name", "Save Script");
    saveButton.partProperties.setPropertyNamed(saveButton, "text-size", 20);
    saveButton.partProperties.setPropertyNamed(saveButton, "target", `part id ${target.id}`);

    saveButton.partProperties.setPropertyNamed(saveButton, "target", `part id ${target.id}`);
    // TODO sort out why compiling a script on this button goes into an infinite recursion loop
    // saveButton.partProperties.setPropertyNamed(saveButton, "script", saveScript, false);
    saveButton._commandHandlers['click'] = function(){
        let newScript = scriptField.partProperties.getPropertyNamed(scriptField, "text");
        target.partProperties.setPropertyNamed(target, "script", newScript);
    };
};

System._commandHandlers['SimpleTalk'] = function(senders){
    return System.grammar.source.sourceString;
}

System._commandHandlers['openDebugger'] = function(senders, partId){
    let target = this.partsById[partId];
    // Create the Field model and attach to current card
    let currentCard = this.getCurrentCardModel();
    let fieldModel = this.newModel('field', currentCard.id);
    let text = `Available Commands for ${target.name} (id ${target.id})\n\n`;
    Object.keys(target.commandHandlerRegistry).forEach((name) =>{
        let info = target.commandHandlerRegistry[name];
        text += `${name}: ${JSON.stringify(info)}\n`;
    });
    fieldModel.partProperties.setPropertyNamed(
        fieldModel,
        'text',
        text
    );
    fieldModel.partProperties.setPropertyNamed(
        fieldModel,
        'editable',
        false
    );
};

System._commandHandlers['saveHTML'] = function(senders){
    this.serialize();

    let stamp = Date.now().toString();
    let serializedPage = this.getFullHTMLString();
    let typeInfo = "data:text/plain;charset=utf-8";
    let url = `${typeInfo},${encodeURIComponent(serializedPage)}`;

    let anchor = document.createElement('a');
    anchor.style.display = "none";
    document.body.append(anchor);
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

System._commandHandlers['toggleHandDetection'] = () => {
    if (handInterface.handDetectionModel === null) {
        handInterface.start();
    } else {
        handInterface.stop();
    }
};

System._commandHandlers['globalInterrupt'] = () => {
    // cycle through all the parts and set the "stepping" property to false
    Object.values(System.partsById).forEach((part) => {
        if(part.isStepping){
            part.partProperties.setPropertyNamed(part, "stepping", false);
        }
    });
};

/** Register the initial set of parts in the system **/
System.registerPart('card', Card);
System.registerPart('stack', Stack);
System.registerPart('field', Field);
System.registerPart('button', Button);
System.registerPart('world', WorldStack);
System.registerPart('window', Window);
System.registerPart('field', Field);
System.registerPart('drawing', Drawing);
System.registerPart('image', Image);
System.registerPart('area', Area);
System.registerPart('audio', Audio);

/** Register the initial set of views in the system **/
System.registerView('button', ButtonView);
System.registerView('stack', StackView);
System.registerView('world', WorldView);
System.registerView('card', CardView);
System.registerView('window', WindowView);
System.registerView('field', FieldView);
System.registerView('drawing', DrawingView);
System.registerView('image', ImageView);
System.registerView('area', AreaView);
System.registerView('audio', AudioView);


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

// Add a dynamic getter for the World for convenience
Object.defineProperty(System, 'world', {
    get: function(){
        return this.partsById['world'];
    }
});

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
    window.customElements.define('st-editor', EditorView);
    window.customElements.define('st-navigator', STNavigator);

    System.navigator = document.createElement('st-navigator');
    document.body.appendChild(System.navigator);

    // Perform the initial setup of
    // the system
    System.initialLoad();
});

// global interrupt
document.addEventListener('keydown', (event) => {
    if(event.ctrlKey && event.key == 'c'){
        System.sendMessage({
            type: "command",
            commandName: "globalInterrupt",
            args: []
        }, System, System);
    }
});


export {
    System,
    System as default
};
