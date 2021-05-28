import EditorTab from './EditorTab.js';
import EditorPropList from './EditorPropList.js';
import EditorMessenger from './EditorMessenger.js';
import EditorCustomList from './EditorCustomList.js';
import EditorSubpartsPane from './EditorSubpartsPane.js';
import partIcons from '../../utils/icons.js';
// PREAMBLE

// Add editor tab element
window.customElements.define('editor-tab', EditorTab);
window.customElements.define('editor-props-list', EditorPropList);
window.customElements.define('editor-custom-list', EditorCustomList);
window.customElements.define('editor-messenger', EditorMessenger);
window.customElements.define('editor-subparts', EditorSubpartsPane);

const closeButton = `
<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-x" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#9e9e9e" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <line x1="18" y1="6" x2="6" y2="18" />
  <line x1="6" y1="6" x2="18" y2="18" />
</svg>
`;

const scriptIcon = `
<svg id='script' xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-file-code" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
    <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
    <path d="M10 13l-1 2l1 2" />
    <path d="M14 13l1 2l-1 2" />
</svg>`;

const templateString = `
<style>
    :host {
        display: flex;
        flex-direction: column;
        position: absolute;
        transform: translateX(-105%);
        transition: transform 150ms linear;
        width: 400px;
        height: 100%;
        background-color: white;
        padding: 8px;
        border-right: 1px solid rgba(0, 0, 0, 0.5);
        box-shadow: 0px 1px 5px 10px rgba(200, 200, 200, 0.7);
    }
    
    :host(.open){
        transform: translateX(0%);
        transition: transform 150ms linear;
        z-index: 100;
    }

    :host(::after) {
        content: " ";
        height: 100%;
        width: 5px;
        background-color: black;
        display: block;
        position: absolute;
        top: 0;
        right: -10;
        box-shadow: 0px 0px 3px 10px rgba(100, 100, 100, 0.6);
    }

    ::slotted(editor-props-list:not(.show-pane)),
    ::slotted(editor-messenger:not(.show-pane)),
    ::slotted(editor-custom-list:not(.show-pane)),
    ::slotted(editor-subparts:not(.show-pane)){
        display: none;
    }

    #tab-area {
        display: inline-flex;
        align-items: center;
        justify-content: space-around;
        width: 100%;
        
    }
    
    #pane-area {
        display: block;
        flex: 1;
        margin-top: 20px;
        height: 80%;
    }

    #header-area {
        display: flex;
        font-family: 'Helvetica', sans-serif;
        margin-bottom: 20px;
    }

    .header-side {
        flex: 1;
        margin-top: 20px;
    }

    #display-area {
        display: flex;
        align-items: center;
        margin-bottom: 30px;
    }

    #header-area h3 {
        display: inline-block;
        margin: 0;
        margin-right: 8px;
        margin-left: 5px;
        font-size: 1.7rem;
    }

    #header-left > input {
        display: inline-block;
        padding: 4px;
        outline: none;
        border: 1px solid transparent;
        border-bottom: 1px solid rgba(100, 100, 100, 0.8);
        font-size: 1.1rem;
    }

    #header-right > button {
        width: 100%;
        background-color: transparent;
        border: 1px solid transparent;
        outline: none;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        font-size: 0.85em;
    }

    #header-right > button:hover {
        cursor: pointer;
        border: 1px solid rgba(150, 150, 150, 0.3);
    }

    #header-right > button:active {
        border: 1px solid rgba(150, 150, 150, 0.8);
        background-color: rgba(220, 220, 220);
    }

    #header-right > button > svg {
        height: 1.3em;
        width: auto;
        margin-right: 8px;
    }
    
    #header-left span {
        font-family: monospace;
        font-size: 1.1rem;
        color: rgba(0, 0, 0, 0.5);
    }

    #icon-display-area {
        width: 1.7rem;
        height: 1.7rem;
        margin-bottom: 5px;
    }
    #icon-display-area > svg {
        width: 100%;
        height: 100%;
    }

    #close-button {
        display: block;
        position: absolute;
        top: 5;
        right: 5;
    }
    #close-button:hover {
        cursor: pointer;
    }
</style>
<div id="close-button">${closeButton}</div>
<div id="header-area">
    <div id="header-left" class="header-side">
        <div id="display-area">
            <div id="icon-display-area"></div>
            <h3></h3><span></span>
        </div>
        <input type="text" id="part-name-input"/>
    </div>
    <div id="header-right" class="header-side">
        <button id="edit-script-button">
            ${scriptIcon}
            <span>Edit Script</span>
        </button>
    </div>
</div>
<div id="tab-area">
    <editor-tab active="true" name="properties">Properties</editor-tab>
    <editor-tab name="custom">Custom</editor-tab>
    <editor-tab name="messenger">Messenger</editor-tab>
    <editor-tab name="subparts">Subparts</editor-tab>
</div>
<div id="pane-area">
    <slot></slot>
</div>
`;

class CompEditor extends HTMLElement {
    constructor(){
        super();

        // Setup template and shadow root
        const template = document.createElement('template');
        template.innerHTML = templateString;
        this._shadowRoot = this.attachShadow({mode: 'open'});
        this._shadowRoot.appendChild(
            template.content.cloneNode(true)
        );

        // Bound methods
        this.toggle = this.toggle.bind(this);
        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
        this.render = this.render.bind(this);
        this.centerOnElement = this.centerOnElement.bind(this);
        this.undoCenterOnElement = this.undoCenterOnElement.bind(this);
        this.updateHeader = this.updateHeader.bind(this);
        this.receiveMessage = this.receiveMessage.bind(this);
        this.onTabActivated = this.onTabActivated.bind(this);
        this.onNameInputChange = this.onNameInputChange.bind(this);
        this.onEditScriptClick = this.onEditScriptClick.bind(this);
    }

    connectedCallback(){
        if(this.isConnected){
            this._shadowRoot.addEventListener('tab-activated', this.onTabActivated);
            this._shadowRoot.getElementById('close-button').addEventListener(
                'click',
                this.close
            );

            // Events
            let nameInput = this._shadowRoot.getElementById('part-name-input');
            nameInput.addEventListener('change', this.onNameInputChange);

            let editScriptButton = this._shadowRoot.getElementById('edit-script-button');
            editScriptButton.addEventListener('click', this.onEditScriptClick);
        }
    }

    disconnectedCallback(){
        this._shadowRoot.removeEventListener('tab-activated', this.onTabActivated);
        this._shadowRoot.getElementById('close-button').removeEventListener(
            'click',
            this.close
        );
        
        // Events
        let nameInput = this._shadowRoot.getElementById('part-name-input');
        nameInput.removeEventListener('change', this.onNameInputChange);

        let editScriptButton = this._shadowRoot.getElementById('edit-script-button');
        editScriptButton.removeEventListener('click', this.onEditScriptClick);
    }

    toggle(){
        if(this.isOpen){
            this.close();
        } else {
            this.open();
        }
    }

    open(){
        this.classList.add('open');
        this.centerOnElement();
    }

    close(){
        this.classList.remove('open');
        this.undoCenterOnElement();
    }

    render(aModel){
        if(this.model){
            this.model.removePropertySubscriber(this);
        }
        this.model = aModel;
        this.model.addPropertySubscriber(this);

        // Close any open Halos.
        // If the new model wants a Halo,
        // open it on the View for that Model.
        Array.from(document.querySelectorAll(`.editing`)).forEach(el => {
            el.closeHalo();
        });
        let targetView = document.querySelector(`[part-id="${this.model.id}"]`);
        if(targetView && targetView.wantsHalo){
            targetView.openHalo();
        }
        
        this.updateHeader();

        // Clear slotted inner DOM
        this.innerHTML = "";

        // Add panes
        let propsPane = document.createElement('editor-props-list');
        propsPane.setAttribute('tab-name', 'properties');
        this.appendChild(propsPane);
        propsPane.render(this.model);

        let messengerPane = document.createElement('editor-messenger');
        messengerPane.setAttribute('tab-name', 'messenger');
        this.appendChild(messengerPane);
        messengerPane.render(this.model);

        let customPane = document.createElement('editor-custom-list');
        customPane.setAttribute('tab-name', 'custom');
        this.appendChild(customPane);
        customPane.render(this.model);

        let subpartsPane = document.createElement('editor-subparts');
        subpartsPane.setAttribute('tab-name', 'subparts');
        this.appendChild(subpartsPane);
        subpartsPane.render(this.model);

        // Find the active tab and show its corresponding pane
        let activeTab = this._shadowRoot.querySelector(`editor-tab[active="true"]`);
        if(activeTab){
            let activeName = activeTab.getAttribute('name');
            Array.from(this.querySelectorAll('[tab-name]')).forEach(pane => {
                let name = pane.getAttribute('tab-name');
                if(name == activeName){
                    pane.classList.add('show-pane');
                } else {
                    pane.classList.remove('show-pane');
                }
            });
        }

        // If this pane is already open, then center
        // on the primary view element for the model
        if(this.isOpen){
            this.centerOnElement();
        }
    }

    centerOnElement(){
        // Use CSS transforms of the whole World to center on
        // the primary view element of the Part being edited,
        // if set. If not set, do nothing.
        if(this.model){
            // If we are editing a Card, Stack, or World, then
            // we uncenter and return
            let isCardStackOrWorld = ['card', 'stack', 'world'].includes(this.model.type);
            if(isCardStackOrWorld){
                return this.undoCenterOnElement();
            }
            
            let partView = window.System.findViewById(this.model.id);
            let worldView = window.System.findViewById('world');
            let current = worldView.getAttribute('centered-on');
            if(current == this.model.id.toString()){
                return;
            }

            let menuRect = this.getBoundingClientRect();
            let partRect = partView.getBoundingClientRect();

            // Get the actual viewable width, plus the editor menu
            let viewWidth = window.innerWidth + menuRect.width;
            let viewHeight = window.innerWidth - menuRect.height;

            // Calculate X translation
            let targetX = (viewWidth - partRect.width) / 2;
            let newX;
            if(targetX < partRect.left){
                newX = (partRect.left - targetX) * -1;
            } else {
                newX = targetX - partRect.left;
            }

            // Calculate Y translation
            let targetY = (viewHeight - partRect.height) / 2;
            let newY;
            if(targetY < partRect.top){
                newY = (partRect.top - targetY) * -1;
            } else {
                newY = targetY - partRect.top;
            }

            worldView.setAttribute('centered-on', this.model.id);
            
            // Set transform and transition
            worldView.style.transition = "transform 0.3s ease-out";
            worldView.style.transform = `translate(${newX}px, ${newY}px)`;
        }
    }

    undoCenterOnElement(){
        let worldView = window.System.findViewById('world');
        worldView.removeAttribute('centered-on');
        worldView.style.removeProperty('transform');
    }

    updateHeader(){
        let nameInput = this._shadowRoot.querySelector('#header-left > input');
        let typeDisplay = this._shadowRoot.querySelector('#display-area > h3');
        let idDisplay = this._shadowRoot.querySelector('#display-area > span');
        let iconDisplay = this._shadowRoot.getElementById('icon-display-area');

        let partName = this.model.partProperties.getPropertyNamed(
            this.model,
            'name'
        );

        if(partName && partName !== ""){
            nameInput.value = partName;
        } else {
            nameInput.value = "(Unnamed)";
        }

        typeDisplay.textContent = this.model.type.charAt(0).toUpperCase() + this.model.type.slice(1);
        idDisplay.textContent = `(${this.model.id})`;

        if(Object.keys(partIcons).includes(this.model.type)){
            iconDisplay.innerHTML = partIcons[this.model.type];
        } else {
            iconDisplay.innerHTML = partIcons.generic;
        }
    }

    receiveMessage(aMessage){
        switch(aMessage.type){
        case 'propertyChanged':
            // Find any nested editor-prop-item elements
            // and re-render, so they display the correct
            // values in the editor
            let queryString = `editor-prop-item[name="${aMessage.propertyName}"][owner-id="${aMessage.partId}"]`;
            Array.from(this.querySelectorAll(queryString)).forEach(el => {
                if(el.property.value !== aMessage.value){
                    el.render();
                }
            });
            break;
        }
    }

    onTabActivated(event){
        Array.from(this._shadowRoot.querySelectorAll('editor-tab'))
            .filter(tabEl => {
                return tabEl !== event.target;
            }).forEach(tabEl => {
                tabEl.removeAttribute('active');
            });

        // Get the name of the activated tab
        let targetName = event.target.getAttribute('name');
        Array.from(this.querySelectorAll('[tab-name]')).forEach(pane => {
            let name = pane.getAttribute('tab-name');
            if(name == targetName){
                pane.classList.add('show-pane');
            } else {
                pane.classList.remove('show-pane');
            }
        });
    }

    onNameInputChange(event){
        if(this.model){
            let newName = event.target.value;
            this.model.partProperties.setPropertyNamed(
                this.model,
                'name',
                newName
            );
        }
    }

    onEditScriptClick(event){
        if(this.model){
            this.model.sendMessage({
                type: 'command',
                commandName: 'openScriptEditor',
                args: [
                    this.model.id
                ]
            }, this.model);
        }
    }

    get isOpen(){
        return this.classList.contains('open');
    }
};

export {
    CompEditor,
    CompEditor as default
};
