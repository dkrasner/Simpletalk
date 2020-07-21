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

import WorldView from './views/WorldView.js';
import StackView from './views/StackView.js';
import ButtonView from './views/ButtonView.js';
import PartView from './views/PartView.js';
import CardView from './views/CardView.js';

import Halo from './views/Halo.js';

const System = {
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

    loadFromWorldView(aWorldView){
        let worldSerialization = this.getSerializationFor(aWorldView.id);
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
            this.attachSubParts(worldModel);
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
        this.updateSerialization(worldModel.id);
    },

    // Recursively go through the

    receiveMessage: function(aMessage){
        switch(aMessage.type){
        case 'newModel':
            return this.newModel(aMessage.modelType, aMessage.owner);
        case 'newView':
            return this.newView(
                aMessage.viewType,
                aMessage.model
            );
        case 'propertyChanged':
            return this.updateSerialization(
                aMessage.partId
            );
        case 'command':
            return this.receiveCommand(aMessage);
        default:
            return this.doesNotUnderstand(aMessage);
        }
    },

    doesNotUnderstand: function(aMessage){
        throw new Error(`System does not understand message ${aMessage.type}`);
        console.error(aMessage);
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

    newModel(kind, owner){
        if(this.partsById[owner.id]){
            let model;
            switch(kind){
            case 'card':
                model = new Card(owner);
                break;
            case 'stack':
                model = new Stack(owner);
                break;
            case 'background':
                model = new Background(owner);
                break;
            case 'button':
                model = new Button(owner);
                break;
            case 'field':
                model = new Field(owner);
                break;
            default:
                throw new Error(`Cannot create unknown part type: ${kind}`);
            }

            this.partsById[model.id] = model;
            model.addPropertySubscriber(this);
            this.updateSerialization(model.id);

            // See if there is already a view for the model.
            // If not, create and attach it.
            let viewForModel = document.getElementById(model.id);
            if(!viewForModel){
                this.newView(model.type, model.id);
            }
        }
    },

    newView: function(partName, modelId){
        let model = this.partsById[modelId];
        if(!model || model == undefined){
            throw new Error('System does not know part ${partName}[${modelId}]');
        }

        // Find the parent model id. This will
        // help us find the parent view element for
        // appending the new element.
        let parentId = model._owner.id;
        let parentElement = document.getElementById(parentId);

        // Create the new view instance,
        // append to parent, and set the model
        let newView = document.createElement(
            this.tagNameForViewNamed(partName)
        );
        newView.setModel(model);
        parentElement.appendChild(newView);
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

    /** Serialization / Deserialization **/
    fromSerialization: function(aString, recursive=true){
        let json = JSON.parse(aString);
        let newPart = this.availableParts[json.type];
        if(!newPart){
            throw new Error(`System could not deserialize Part of type "${json.type}"`);
        }
        newPart.setFromDeserialized(json);
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
    }

};

/** Add Default System Command Handlers **/
System._commandHandlers['answer'] = function(text){
    alert(text);
};

System._commandHandlers['mouseUp'] = function(){
    // By default, this does nothing, which
    // prevents a DNU error from being thrown.
    // Like HyperCard, we want to swallow any
    // mouse events that are not trapped by other
    // parts.
    return;
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

/** Register the initial set of views in the system **/
System.registerView('button', ButtonView);
System.registerView('stack', StackView);
System.registerView('world', WorldView);
System.registerView('card', CardView);


document.addEventListener('DOMContentLoaded', () => {
    window.System = System;
    // Add the possible views as webcomponents
    // in the custom element registry
    Object.keys(System.availableViews).forEach(partName => {
        let viewClass = System.availableViews[partName];
        let elementName = System.tagNameForViewNamed(partName);
        window.customElements.define(elementName, viewClass);
    });

    // Add any other non-part view CustomElements,
    // like the halo
    window.customElements.define('st-halo', Halo);

    // Perform the initial setup of
    // the system
    System.initialLoad();
});
