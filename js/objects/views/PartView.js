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
class PartView extends HTMLElement {
    constructor(){
        super();
        this.model = null;
        this.isPartView = true;
        this.name = this.constructor.name;

        // Halo settings. All are on by default
        this.wantsHaloResize = true;
        this.wantsHaloScriptEdit = true;
        this.wantsHaloDelete = true;
        // Note: see getter for wantsHaloMove

        // Bind component methods
        this.setModel = this.setModel.bind(this);
        this.unsetModel = this.unsetModel.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.openHalo = this.openHalo.bind(this);
        this.closeHalo = this.closeHalo.bind(this);
        this.openToolbox = this.openToolbox.bind(this);
        this.onHaloDelete = this.onHaloDelete.bind(this);
        this.onHaloOpenEditor = this.onHaloOpenEditor.bind(this);
    }

    modelPropertyChanged(){
        throw new Error(`Should be implemented in subclass!`);
    }

    setModel(aModel){
        this.model = aModel;
        aModel.addPropertySubscriber(this);
        this.setAttribute('part-id', aModel.id);
    }

    unsetModel(aModel){
        this.model = null;
        aModel.removePropertySubscriber(this);
        this.setAttribute('part-id', "");
    }

    sendMessage(aMessage, target){
        window.System.sendMessage(aMessage, this, target);
    }

    receiveMessage(aMessage){
        // Do nothing here.
        // subclasses should implement
        // their own handling of received
        // messages
    }

    openToolbox(){
        // Check to see if there's a toolbox in
        // the component's shadow root already
        let foundToolbox = false;
        // TODO this is an awkward way to see if an element is there!
        document.querySelectorAll('st-window').forEach((stWindow) => {
            let windowId = stWindow.getAttribute("part-id");
            let part = window.System.partsById[windowId];
            let titleProperty = part.partProperties.findPropertyNamed("title");
            if(titleProperty.getValue() === "Toolbox"){
                foundToolbox = true;
            };
        })
        if(!foundToolbox){
            this.sendMessage({
                type: 'command',
                commandName: 'openToolbox',
                args: []
            }, window.System);
        }
    }

    openHalo(){
        // Check to see if there's a halo in
        // the component's shadow root already
        let foundHalo = this.shadowRoot.querySelector('st-halo');
        if(!foundHalo){
            let newHalo = document.createElement('st-halo');
            this.shadowRoot.appendChild(newHalo);
        }
    }

    closeHalo(){
        let foundHalo = this.shadowRoot.querySelector('st-halo');
        if(foundHalo){
            foundHalo.remove();
        }
    }

    toggleAntsBorder(){
        if(this.classList.contains('marching-ants')){
            this.classList.remove('marching-ants');
        } else {
            this.classList.add('marching-ants');
        }
    }

    onHaloDelete(){
        // What to do when the user clicks the
        // delete button on a halo for this partview.
        // The default implementation is to send a message
        // to the System to delete the corresponding
        // model and *all* views referencing that
        // model.
        this.sendMessage({
            type: 'command',
            commandName: 'deleteModel',
            args: [this.model.id]
        }, window.System);
    }

    onHaloOpenEditor(){
        // Send the message to open a script editor
        // with this view's model as the target
        this.model.sendMessage({
            type: 'command',
            commandName: 'openScriptEditor',
            args: [this.model.id]
        }, this.model);
    }

    get wantsHaloMove(){
        if(!this.parentElement || !this.isConnected){
            return false;
        }
        let parentModel = this.parentElement.model;
        if(!parentModel){
            return true;
        }

        let parentLayout = parentModel.partProperties.getPropertyNamed(
            parentModel,
            'layout'
        );
        if(!parentLayout || parentLayout == ""){
            return true;
        }

        return false;
    }


};

export {
    PartView,
    PartView as default
};
