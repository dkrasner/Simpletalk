import PartView from '../PartView.js';
import EditorTab from './EditorTab.js';
import EditorPropList from './EditorPropList.js';


// PREAMBLE

// Add editor tab element
window.customElements.define('editor-tab', EditorTab);
window.customElements.define('editor-props-list', EditorPropList);

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

    #tab-area {
        display: inline-flex;
        align-items: center;
        justify-content: space-around;
        width: 100%;
        
    }
    
    #pane-area {
        display: block;
        flex: 1;
    }

    #header-area {
        font-family: 'Helvetica', sans-serif;
    }

    #header-area h3 {
        display: inline-block;
        margin-right: 8px;
        margin-left: 5px;
        font-size: 1.3rem;
    }

    #header-area > input {
        display: inline-block;
        padding: 4px;
        outline: none;
        border: 1px solid transparent;
        border-bottom: 1px solid rgba(100, 100, 100, 0.8);
        font-size: 1.5rem;
    }
    
    #header-area span {
        font-family: monospace;
        font-size: 1.1rem;
    }
</style>
<div id="header-area">
    <input type="text" id="part-name-input"/>
    <div>
        <h3></h3><span></span>
    </div>
</div>
<div id="tab-area">
    <editor-tab active="true">One</editor-tab>
    <editor-tab>Two</editor-tab>
    <editor-tab>Three</editor-tab>
</div>
<div id="pane-area">
    <slot></slot>
</div>
`;

class CompEditor extends PartView {
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
        this.onTabActivated = this.onTabActivated.bind(this);
        this.onNameInputChange = this.onNameInputChange.bind(this);
    }

    afterConnected(){
        this._shadowRoot.addEventListener('tab-activated', this.onTabActivated);

        // Events
        let nameInput = this._shadowRoot.getElementById('part-name-input');
        nameInput.addEventListener('change', this.onNameInputChange);
        
    }

    afterDisconnected(){
        this._shadowRoot.removeEventListener('tab-activated', this.onTabActivated);
        // Events
        let nameInput = this._shadowRoot.getElementById('part-name-input');
        nameInput.removeEventListener('change', this.onNameInputChange);
    }

    afterModelSet(){
        this.render();
    }

    toggle(){
        if(this.classList.contains('open')){
            this.classList.remove('open');
        } else {
            this.classList.add('open');
        }
    }

    render(){
        this.updateHeader();

        // Clear slotted inner DOM
        this.innerHTML = "";

        // Add panes
        let propsPane = document.createElement('editor-props-list');
        this.appendChild(propsPane);
        propsPane.setModel(this.model);
    }

    updateHeader(){
        let nameInput = this._shadowRoot.querySelector('#header-area > input');
        let typeDisplay = this._shadowRoot.querySelector('#header-area > div > h3');
        let idDisplay = this._shadowRoot.querySelector('#header-area > div> span');

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
    }

    onTabActivated(event){
        Array.from(this._shadowRoot.querySelectorAll('editor-tab'))
            .filter(tabEl => {
                return tabEl !== event.target;
            }).forEach(tabEl => {
                tabEl.removeAttribute('active');
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
