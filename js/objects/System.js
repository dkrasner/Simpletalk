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

import WorldView from './views/WorldView.js';
import StackView from './views/StackView.js';
import ButtonView from './views/ButtonView.js';
import PartView from './views/PartView.js';
import CardView from './views/CardView.js';
import BackgroundView from './views/BackgroundView.js';
import WindowView from './views/WindowView';
import EricFieldView from './views/EricFieldView.js';

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
            let part = new partClass(aModel, subSerialization.properties.name);
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

    sendMessage: function(aMessage, source, target){
        if(!target || target == undefined){
            throw new Error('Messages must be sent with target receivers specified!');
        }

        let messageData = [
            aMessage,
            [source.name, source.id],
            [target.name, target.id]
        ];

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
        target.receiveMessage(aMessage);
    },

    receiveMessage: function(aMessage){
        switch(aMessage.type){
            case 'newModel':
                return this.newModel(aMessage.modelType, aMessage.ownerId);
            case 'newView':
                return this.newView(
                    aMessage.viewType,
                    aMessage.modelId
                );
            case 'removeModel':
                return this.removeModel(aMessage.modelType, aMessage.modelId);
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
        throw new Error(`System does not understand message ${aMessage.type}`);
        console.error(aMessage);
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

    newModel(kind, ownerId){
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

    // Remove the model with the given ID from
    // the System's registry, as well as from the subparts
    // array of any owners
    removeModel: function(modelType, modelId){
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
            throw new Error('System does not know part ${partName}[${modelId}]');
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
        // removed from the System, via removeModel.
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
    }

};

/** Add Default System Command Handlers **/
System._commandHandlers['answer'] = function(text){
    alert(text);
};

System._commandHandlers['go to'] = function(directive, objectName){
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

        default:
            alert(`"go to" not implemented for ${object}`);

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

    // Do more toolbox configuration here
    // like making the buttons with their
    // scripts, etc
    let windowStackView = this.findViewById(windowStack.id);
    let windowCurrentCardModel = windowStackView.querySelector('.current-card').model;
    let addBtnBtn = this.newModel('button', windowCurrentCardModel.id);
    addBtnBtn.partProperties.setPropertyNamed(
        addBtnBtn,
        'name',
        'Add Button to Card'
    );
    // Because we can't yet compile the script needed to do this
    // (scripts don't yet know about "card" in context), we manually
    // bind the message handler
    addBtnBtn._commandHandlers['mouseUp'] = function(){
        // Find the current active card in the current
        // active stack and add a button to it
        let currentCardView = document.querySelector('.current-stack .current-card');
        let cardModel = currentCardView.model;
        /*let newButton = cardModel.sendMessage({
            type: 'newModel',
            modelType: 'button',
            owner: cardModel
            }, System);*/
        let newButton = System.newModel('button', cardModel.id);
        newButton.partProperties.setPropertyNamed(
            newButton,
            'name',
            `Button ${newButton.id}`
        );
    };
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
    let currentCardView = winView.querySelector('.current-stack .current-card');
    let currentCard = currentCardView.model;

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
    saveBtnModel._commandHandlers['mouseUp'] = function(){
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

/** Register the initial set of views in the system **/
System.registerView('button', ButtonView);
System.registerView('stack', StackView);
System.registerView('world', WorldView);
System.registerView('card', CardView);
System.registerView('background', BackgroundView);
System.registerView('window', WindowView);
System.registerView('eric-field', EricFieldView);


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
