import EditorTab from './EditorTab.js';
import EditorPropList from './EditorPropList.js';
import EditorMessenger from './EditorMessenger.js';

// PREAMBLE

// Add editor tab element
window.customElements.define('editor-tab', EditorTab);
window.customElements.define('editor-props-list', EditorPropList);
window.customElements.define('editor-messenger', EditorMessenger);

let partIcons = {};

partIcons.world = `
<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-world" width="44" height="44" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2c3e50" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <circle cx="12" cy="12" r="9" />
  <line x1="3.6" y1="9" x2="20.4" y2="9" />
  <line x1="3.6" y1="15" x2="20.4" y2="15" />
  <path d="M11.5 3a17 17 0 0 0 0 18" />
  <path d="M12.5 3a17 17 0 0 1 0 18" />
</svg>
`;

partIcons.stack = `
<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-stack" width="44" height="44" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2c3e50" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <polyline points="12 4 4 8 12 12 20 8 12 4" />
  <polyline points="4 12 12 16 20 12" />
  <polyline points="4 16 12 20 20 16" />
</svg>
`;

partIcons.card = `
<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-square" width="44" height="44" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2c3e50" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <rect x="4" y="4" width="16" height="16" rx="2" />
</svg>
`;

partIcons.button = `
<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-hand-finger" width="44" height="44" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2c3e50" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <path d="M8 13v-8.5a1.5 1.5 0 0 1 3 0v7.5" />
  <path d="M11 11.5v-2a1.5 1.5 0 1 1 3 0v2.5" />
  <path d="M14 10.5a1.5 1.5 0 0 1 3 0v1.5" />
  <path d="M17 11.5a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1 -6 6h-2h.208a6 6 0 0 1 -5.012 -2.7a69.74 69.74 0 0 1 -.196 -.3c-.312 -.479 -1.407 -2.388 -3.286 -5.728a1.5 1.5 0 0 1 .536 -2.022a1.867 1.867 0 0 1 2.28 .28l1.47 1.47" />
</svg>
`;

partIcons.generic = `
<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-puzzle" width="44" height="44" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2c3e50" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <path d="M4 7h3a1 1 0 0 0 1 -1v-1a2 2 0 0 1 4 0v1a1 1 0 0 0 1 1h3a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h1a2 2 0 0 1 0 4h-1a1 1 0 0 0 -1 1v3a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-1a2 2 0 0 0 -4 0v1a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h1a2 2 0 0 0 0 -4h-1a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1" />
</svg>
`;

const templateString = `
<style>
    :host {
        display: flex;
        flex-direction: column;
        position: absolute;
        transform: translateX(-105%);
        transition: transform 150ms linear;
        min-width: 400px;
        height: 100%;
        background-color: white;
        padding: 8px;
    }
    
    :host(.open){
        transform: translateX(0%);
        transition: transform 150ms linear;
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
        box-shadow: 0px 0px 2px 3px rgba(100, 100, 100, 0.6);
    }

    ::slotted(editor-props-list:not(.show-pane)),
    ::slotted(editor-messenger:not(.show-pane)){
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
        font-family: 'Helvetica', sans-serif;
        margin-bottom: 20px;
    }

    #display-area {
        display: flex;
        align-items: center;
        margin-bottom: 30px;
        margin-top: 20px;
    }

    #header-area h3 {
        display: inline-block;
        margin: 0;
        margin-right: 8px;
        margin-left: 5px;
        font-size: 1.7rem;
    }

    #header-area > input {
        display: inline-block;
        padding: 4px;
        outline: none;
        border: 1px solid transparent;
        border-bottom: 1px solid rgba(100, 100, 100, 0.8);
        font-size: 1.1rem;
    }
    
    #header-area span {
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
</style>
<div id="header-area">
    <div id="display-area">
        <div id="icon-display-area"></div>
        <h3></h3><span></span>
    </div>
    <input type="text" id="part-name-input"/>
</div>
<div id="tab-area">
    <editor-tab active="true" name="properties">Properties</editor-tab>
    <editor-tab name=messenger>Messenger</editor-tab>
    <editor-tab>Subparts</editor-tab>
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
        this.render = this.render.bind(this);
        this.updateHeader = this.updateHeader.bind(this);
        this.receiveMessage = this.receiveMessage.bind(this);
        this.onTabActivated = this.onTabActivated.bind(this);
        this.onNameInputChange = this.onNameInputChange.bind(this);
    }

    connectedCallback(){
        if(this.isConnected){
            this._shadowRoot.addEventListener('tab-activated', this.onTabActivated);

            // Events
            let nameInput = this._shadowRoot.getElementById('part-name-input');
            nameInput.addEventListener('change', this.onNameInputChange);
        }
    }

    disconnectedCallback(){
        this._shadowRoot.removeEventListener('tab-activated', this.onTabActivated);
        // Events
        let nameInput = this._shadowRoot.getElementById('part-name-input');
        nameInput.removeEventListener('change', this.onNameInputChange);
    }

    toggle(){
        if(this.classList.contains('open')){
            this.classList.remove('open');
        } else {
            this.classList.add('open');
        }
    }

    render(aModel){
        if(this.model){
            this.model.removePropertySubscriber(this);
        }
        this.model = aModel;
        this.model.addPropertySubscriber(this);
        
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
    }

    updateHeader(){
        let nameInput = this._shadowRoot.querySelector('#header-area > input');
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
};

export {
    CompEditor,
    CompEditor as default
};
