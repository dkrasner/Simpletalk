/**
 * PartView
 * ----------------------------------------
 * I am an *abstract* webcompoent CustomElement
 * that serves as the generic view for any Part
 * models.
 * I should not be instantiated directly, nor should
 * I be added to any web page's registry of CustomElements.
 * I am indended to be extended (subclassed) by the actual
 * views for each Part kind, and therefore I contain all
 * of the common behavior, including lifecycle methods,
 * for these.
 */
import Part from '../parts/Part.js';
import WorldStack from '../parts/WorldStack.js';

/**
 * A Note on Serialization/Deserialization
 * On loading into page, the steps for a Part view are:
 * 1. Check to see if I have a data-part-id set. If so, go to 2.
      If not, go to 3.
 * 2. Check to see if there is a serialization state stored in
 *    the script tag area. If so, load a model from its content
 *    and set it to my current model. If not, go to 3.
 * 3. If here, there was no id or no serialized model. Create
 *    instead a new Part of the correct type and set it to
 *    be my model. Also add it to the partCollection of my
 *    parent view's parent model, if there is one
 * 4. If creating a new model at read time, create the
 *    script tag and fill it with the default serialization
 *    for the new model. Also set the data-part-id for this
 *    view.
**/

class PartView extends HTMLElement {
    constructor(){
        super();
        this.model = null;

        // Bind component methods
        this.setModel = this.setModel.bind(this);
        this.unsetModel = this.unsetModel.bind(this);
        this.getModelFromSerialized = this.getModelFromSerialized.bind(this);
        this.createNewModel = this.createNewModel.bind(this);
        this.registerInParentView = this.registerInParentView.bind(this);
        this.initSerializedElement = this.initSerializedElement.bind(this);
        this.findOrCreateScriptArea = this.findOrCreateScriptArea.bind(this);
        this.updateSerializationScript = this.updateSerializationScript.bind(this);
        this.receiveMessage = this.receiveMessage.bind(this);
        this.afterConnected = this.afterConnected.bind(this);
    }

    /**
     * The following will be handled for all PartViews
     */
    connectedCallback(){
        if(this.isConnected){
            console.log('Generic Part connected');
            this.getModelFromSerialized();

            // If no model loaded, we create a new
            // one of the Part type that corresponds
            // to this view.
            let model = this.createNewModel();
            this.setModel(model);

            // Call the afterConnected internal
            // lifecycle method.
            this.afterConnected();
        }
    }

    afterConnected(){
        // Do nothing here.
        // subclasses override
    }

    createNewModel(){
        // All subclasses should override
        // in order to create the correct model
        // objects.
        return new Part();
    }

    setModel(newModel){
        if(this.model){
            this.unsetModel(this.model);
        }
        this.model = newModel;

        // Add this view to the list of the model's
        // property subscribers, so we can react to
        // property changes as needed
        newModel.addPropertySubscriber(this);

        // Set my data-part-id attribute to
        // be the same as the incoming model
        this.setAttribute('data-part-id', newModel.id);

        // Set the content of the script
        // serialization element to be the
        // serialized state of the new model
        this.initSerializedElement();

        // Ensure that the incoming model's
        // owner is set to the model of the parent
        // view, if present.
        this.registerInParentView();
    }

    unsetModel(aModel){
        // Just in case, remove this View
        // from the model's propertySubscribers
        aModel.removePropertySubscriber(this);
        this.model = null;

        // Unset the data-part-id
        this.setAttribute('data-part-id', "");

        // Clear the script element containing
        // the serialized state of the model
        this.serializationScriptEl.innerHTML = "";
    }

    /**
     * like Parts, Views can receive messages.
     * Here we check to see if a message concerns
     * a change in a value of one of the model's
     * properties
     */
    receiveMessage(aMessage){
        switch(aMessage.type){
        case 'propertyChanged':
            this.updateSerializationScript();
            if(this.onPropertyChanged){
                this.onPropertyChanged(
                    aMessage.propertyName,
                    aMessage.newValue
                );
            }
            return;
        default:
            return;
        }
    }


    /**
     * Designed to be used in any connectedCallback.
     * Will attempt to add the model of the incoming
     * view to this view model's partsCollection.
     */
    registerInParentView(){
        if(this.parentElement.isPartView && this.parentElement.model){
            this.parentElement.model.partCollection.addPart(this.model);
        }
    }

    /**
     * This method will read a child <script> tag (if present)
     * and create a Part model from the contained JSON of its
     * serialized state.
     * The script tag has to be of type application/json
     * and should be a *basic* serialization of the Part model
     * without any PartCollection information. The child Parts will
     * be deduced from any nested views, which will also call this
     * method on themselves
     */
    getModelFromSerialized(){
        if(!this.id || this.id == undefined){
            return;
        }
        let scriptArea = this.findOrCreateScriptArea();
        let jsonScriptElement = scriptArea.querySelector(`[data-part-id="${this.id}"]`);
        if(jsonScriptElement){
            let newModel = WorldStack.fromSerialization(jsonScriptElement.innerHTML);
            this.setModel(newModel);
        }
    }

    /**
     * Ensure that there is a child <script> element present that
     * can be used to store serialization information. We update the
     * JSON contents of this script whenever one of the props or
     * other values changes in the Part.
     * If it is already present, then we are loading or have loaded
     * from a deserialization, so all we need to do is set it as
     * a JS property
     */
    initSerializedElement(){
        // If there is no model set yet,
        // then we pass
        if(!this.model || this.model == undefined){
            return;
        }

        // First, we need to get a script area container to
        // query.
        let scriptArea = this.findOrCreateScriptArea();
        let found = scriptArea.querySelector(`[data-part-id="${this.model.id}"]`);
        if(found){
            this.serializationScriptEl = found;
        } else {
            this.serializationScriptEl = document.createElement('script');
            this.serializationScriptEl.setAttribute('data-role', 'part-serialization');
            this.serializationScriptEl.setAttribute('data-part-id', this.model.id);
            this.serializationScriptEl.setAttribute('type', 'application/json');
        }
        this.updateSerializationScript();

        // If the element is not one of this element's
        // children yet, append it.
        scriptArea.append(this.serializationScriptEl);
    }

    /**
     * Returns the instance of the Element that holds the
     * various script serializations for all parts in the system.
     * If no container is found, it creates one and appends it to
     * the end of the body
     */
    findOrCreateScriptArea(){
        let scriptArea = document.getElementById('serialization-container');
        if(scriptArea){
            return scriptArea;
        }
        // If we get here, there is no matching script area container
        // so we need to create and append it.
        scriptArea = document.createElement('div');
        scriptArea.id = 'serialization-container';
        document.body.append(scriptArea);
        return scriptArea;
    }

    /**
     * Update the text contents of the serialization script
     * element. Here we simply serialize the model and then
     * replace all of the text content in the script tag
     */
    updateSerializationScript(){
        if(this.model){
            let content = this.model.serialize();
            this.serializationScriptEl.innerHTML = content;
        }
    }
};

export {
    PartView,
    PartView as default
};
