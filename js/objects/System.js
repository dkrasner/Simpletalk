/**
 * System Object
 * -------------------------------------
 * I am an object representing the "top" of the
 * sytem. I am the point of communication between
 * Models and Views.
 */
import Card from './parts/Card.js';
import Stack from './parts/Stack.js';
import Background from './parts/Background.js';
import Button from './parts/Button.js';
import Field from './parts/Field.js';
import WorldStack from './parts/WorldStack.js';
import Window from './parts/Window.js';
import EricField from './parts/EricField.js';
import Container from './parts/Container.js';
import Drawing from './parts/Drawing.js';
import Svg from './parts/Svg.js';

import WorldView from './views/WorldView.js';
import StackView from './views/StackView.js';
import ButtonView from './views/ButtonView.js';
import PartView from './views/PartView.js';
import CardView from './views/CardView.js';
import BackgroundView from './views/BackgroundView.js';
import WindowView from './views/WindowView';
import EricFieldView from './views/EricFieldView.js';
import ContainerView from './views/ContainerView.js';
import DrawingView from './views/drawing/DrawingView.js';
import SvgView from './views/SvgView.js';

import Halo from './views/Halo.js';

import ohm from 'ohm-js';
import Compiler from './compiler.js';
import semantics from '../ohm/semantics.js';
// import grammar from '../ohm/grammar.js';


const System = {
    name: "System",
    id: -1,
    isLoaded: false,
    partsById: {},
    compiler: null,
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

        // First, we look for an existing WorldView.
        // If there is one, we try to find its model
        // and corresponding state, recursively going
        // through the model's parts and either creating
        // or updating any existing views.
        let worldView = document.querySelector(
            this.tagNameForViewNamed('world')
        );
        if(worldView){
            this.loadFromWorldView(worldView);
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

        // Create an initial blank Stack in this
        // case
        this.newModel('stack', worldModel.id);
        document.querySelector('st-stack').classList.add('current-stack');

        this.updateSerialization(worldModel.id);
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
        })

        this.passDevToolMessage(aMessage, source, target);
        target.receiveMessage(aMessage);
    },

    receiveMessage: function(aMessage){
        switch(aMessage.type){
            case 'newView':
                return this.newView(
                    aMessage.viewType,
                    aMessage.modelId
                );
            case 'propertyChanged':
                return this.updateSerialization(
                    aMessage.partId
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
        console.error(aMessage);
        throw new Error(`System does not understand message ${aMessage.type}`);
    },

    compile: function(aMessage){
        let targetObject = this.partsById[aMessage.targetId];
        if(!targetObject || targetObject == undefined){
            throw new Error(`System could not compile target object ${aMessage.targetId}`);
        }
        this.compiler.compile(
            aMessage.codeString,
            targetObject
        );
        // Be sure to then update the
        // serialization for the target
        // part, thus adding the script to
        // its serialization
        this.updateSerialization(aMessage.targetId);
    },

    receiveCommand: function(aMessage){
        let handler = this._commandHandlers[aMessage.commandName];
        if(handler){
            let boundHandler = handler.bind(this);
            return boundHandler(...aMessage.args);
        } else {
            return this.doesNotUnderstand(aMessage);
        }
    },

    newModel(kind, ownerId, ownerKind, context, name){
        // TODO This is an exception to the general newModel
        // message and method structure; potentially should be
        // reworked
        if (!ownerId && ownerKind === "toolbox"){
            this.addToToolbox(kind, context, name);
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
            model.partProperties.setPropertyNamed(model, 'name', name);
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
            this.updateSerialization(ownerPart.id);
        }

        // Add the System as a property subscriber to
        // the new model. This will send a message to
        // this System object whenever any of this model's
        // properties have changed
        model.addPropertySubscriber(this);

        // Serialize the new model into the page
        this.updateSerialization(model.id);
        model.subparts.forEach(subpart => {
            this.updateSerialization(subpart.id);
        });

        // See if there is already a view for the model.
        // If not, create and attach it.
        let viewForModel = this.findViewById(model.id);
        if(!viewForModel){
            this.newView(model.type, model.id);
        }

        return model;
    },

    setProperty(property, value, ownerId){
        let ownerPart = this.partsById[ownerId];
        if(!ownerPart || ownerPart == undefined){
            throw new Error(`System could not locate owner part with id ${ownerId}`);
        }
        ownerPart.partProperties.setPropertyNamed(ownerPart, property, value);
        // for now stack properties propagate down to their direct card children
        // TODO this should be refactored within a better lifecycle model and potenitally
        // use dynamic props. A similar propagation should probably exist for world -> stacks,
        // window -> subpart etc
        if(ownerPart.type === "stack"){
            ownerPart.subparts.forEach((subpart) => {
                if(subpart.type === "card"){
                    subpart.partProperties.setPropertyNamed(subpart, property, value);
                }
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

    newView: function(partName, modelId){
        let model = this.partsById[modelId];
        if(!model || model == undefined){
            throw new Error(`System does not know part ${partName}[${modelId}]`);
        }

        // If there is alreay a view for this model,
        // simply return the instance of that view object
        let existingView = this.findViewById(modelId);
        if(existingView){
            return existingView;
        }

        // Find the parent model id. This will
        // help us find the parent view element for
        // appending the new element.
        let parentId = model._owner.id;
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

        // For all subparts of this model, call
        // the newView method recursively
        model.subparts.forEach(subpart => {
            this.newView(subpart.type, subpart.id);
        });

        return newView;
    },

    addToToolbox(kind, context, name){
        let toolboxModel = this.findToolbox();
        let model = this.newModel(kind, toolboxModel.id, "", context, name);
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

    /** Serialization / Deserialization **/
    fromSerialization: function(aString, recursive=true){
        let json = JSON.parse(aString);
        let newPartClass = this.availableParts[json.type];
        if(!newPartClass){
            throw new Error(`System could not deserialize Part of type "${json.type}"`);
        }
        let newPart = newPartClass.setFromDeserialized(json);
        this.partsById[newPart.id] = newPart;

        // If the deserialized object has a subparts
        // array with ids, attempt to deserialize and
        // instantiate models for those parts too,
        // recursively
        if(recursive){
            json.subparts.forEach(subpartId => {
                let serializationEl = document.querySelector('script[data-part-id="${subpartId}"]');
                if(serializationEl){
                    let content = serializationEl.innerHTML;
                    this.fromSerialization(content);
                }
            });
        }
    },

    updateSerialization: function(modelId){
        let model = this.partsById[modelId];
        if(!model){
            throw new Error(`System could not serialize unknown model [${modelId}]`);
        }
        let serializationEl = document.querySelector(`script[data-part-id="${modelId}"]`);
        if(!serializationEl){
            serializationEl = document.createElement('script');
            serializationEl.setAttribute('data-part-id', modelId);
            serializationEl.setAttribute('data-role', 'part-serialization');
            serializationEl.setAttribute('type', 'application/json');
        }

        serializationEl.innerHTML = model.serialize();
        this.serialScriptArea().appendChild(serializationEl);
    },

    removeSerializationFor: function(aPartId){
        // Remove the script tag serialization for the given
        // Part ID. This is usually done after a Part has been
        // removed from the System, via deleteModel.
        let element = document.querySelector(`script[data-part-id="${aPartId}"]`);
        if(element){
            element.parentElement.removeChild(element);
        }
    },

    getSerializationFor: function(aPartId){
        let element = document.querySelector(`script[data-part-id="${aPartId}"]`);
        if(element){
            return element.innerText;
        }
        return null;
    },

    serialScriptArea: function(){
        let area = document.getElementById('serialization-container');
        if(area){
            return area;
        } else {
            area = document.createElement('div');
            area.id = 'serialization-container';
            document.body.appendChild(area);
            return area;
        }
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
    }

};

/** Add Default System Command Handlers **/
System._commandHandlers['deleteModel'] = System.deleteModel;
System._commandHandlers['newModel'] = System.newModel;
System._commandHandlers['setProperty'] = System.setProperty;

System._commandHandlers['answer'] = function(text){
    alert(text);
};

System._commandHandlers['go to direction'] = function(directive, objectName){
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

System._commandHandlers['go to reference'] = function(objectName, referenceId){
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
System._commandHandlers['openToolbox'] = function(targetId){
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
        'row' //TODO sort out this bug!
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

    // Add a button to add a Svg
    let addSvgBtn = this.newModel('button', windowCurrentCardModel.id);
    addSvgBtn.partProperties.setPropertyNamed(
        addSvgBtn,
        'name',
        'Add Svg to Card'
    );
    addSvgBtn._commandHandlers['click'] = function(){
        let currentCardView = document.querySelector('.current-stack > .current-card');
        let cardModel = currentCardView.model;
        this.sendMessage({
            type: 'command',
            commandName: 'newSvg',
            args: [cardModel.id]
        }, cardModel);
    };
};

System._commandHandlers['newSvg'] = function(cardModelId){
    let newSvg = System.newModel('svg', cardModelId);
    newSvg.partProperties.setPropertyNamed(
        newSvg,
        'name',
        `Svg ${newSvg.id}`
    );
    newSvg.partProperties.setPropertyNamed(
        newSvg,
        "src",
        "https://thomasnyberg.com/TsxxJJ9/translate.svg"
    );
}

System._commandHandlers['openWorldCatalog'] = function(targetId){
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
        'World Catalog'
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
        'row'
    );

    // Do more toolbox configuration here
    // like making the buttons with their
    // scripts, etc
    windowStackView.classList.add('window-stack');
    let addBtnBtn = this.newModel('button', windowCurrentCardModel.id);
    addBtnBtn.partProperties.setPropertyNamed(
        addBtnBtn,
        'name',
        'Button'
    );

    let addBtnScript = 'on mouseUp\n    add button "Button" to toolbox \nend mouseUp';
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
};

System._commandHandlers['openScriptEditor'] = function(targetId){
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
    let winTitle = `Script: ${targetPart.type}[${targetId}]`;
    winModel.partProperties.setPropertyNamed(
        winModel,
        'name',
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

    // Create the EricField model and attach to current card
    // of the new window.
    let fieldModel = this.newModel('eric-field', currentCard.id);
    let saveBtnModel = this.newModel('button', currentCard.id);
    saveBtnModel.partProperties.setPropertyNamed(
        saveBtnModel,
        'name',
        'Save Script'
    );

    let fieldView = this.findViewById(fieldModel.id);
    let saveBtnView = this.findViewById(saveBtnModel.id);

    // Set the field's textContent to be the script of the given
    // target part.
    let currentScript = targetPart.partProperties.getPropertyNamed(
        targetPart,
        'script'
    );
    fieldModel.partProperties.setPropertyNamed(
        fieldModel,
        'textContent',
        currentScript
    );

    // Set the save button's action to be to save the script
    // on the part
    saveBtnModel._commandHandlers['click'] = function(){
        let editedText = fieldModel.partProperties.getPropertyNamed(
            fieldModel,
            'textContent'
        );
        targetPart.partProperties.setPropertyNamed(
            targetPart,
            'script',
            editedText
        );
    };
    // Manually set the style attributes for this stuff. Since we don't
    // have layout parts yet we need to do it here to make it look nice
    fieldView.style.flex = "1";
};

System._commandHandlers['saveHTML'] = function(){
    let anchor = document.createElement('a');
    anchor.style.display = "none";
    document.body.append(anchor);

    let stamp = Date.now().toString();
    let serializedPage = new XMLSerializer().serializeToString(document);
    let typeInfo = "data:text/plain;charset=utf-8";
    let url = `${typeInfo},${encodeURIComponent(serializedPage)}`;
    anchor.href = url;
    anchor.download = `SimpleTalkSnapshot_${stamp}.html`;
    anchor.click();
    window.URL.revokeObjectURL(url);
    anchor.parentElement.removeChild(anchor);
};

/** Register the initial set of parts in the system **/
System.registerPart('card', Card);
System.registerPart('stack', Stack);
System.registerPart('background', Background);
System.registerPart('field', Field);
System.registerPart('button', Button);
System.registerPart('world', WorldStack);
System.registerPart('window', Window);
System.registerPart('eric-field', EricField);
System.registerPart('container', Container);
System.registerPart('drawing', Drawing);
System.registerPart('svg', Svg);

/** Register the initial set of views in the system **/
System.registerView('button', ButtonView);
System.registerView('stack', StackView);
System.registerView('world', WorldView);
System.registerView('card', CardView);
System.registerView('background', BackgroundView);
System.registerView('window', WindowView);
System.registerView('eric-field', EricFieldView);
System.registerView('container', ContainerView);
System.registerView('drawing', DrawingView);
System.registerView('svg', SvgView);


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
let languageSemantics = languageGrammar.createSemantics().addOperation('parse', semantics);
System.compiler = new Compiler(languageGrammar, languageSemantics);

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

    // Perform the initial setup of
    // the system
    System.initialLoad();
});

export {
    System,
    System as default
};
