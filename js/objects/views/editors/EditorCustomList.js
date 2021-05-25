

// PREAMBLE

const caretDownIcon = `
<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-caret-down" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000000" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <path d="M18 15l-6 -6l-6 6h12" transform="rotate(180 12 12)" />
</svg>
`;

const caretRightIcon = `
<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-caret-right" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000000" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <path d="M18 15l-6 -6l-6 6h12" transform="rotate(90 12 12)" />
</svg>
`;

const templateString = `
<style>
    :host {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        font-family: 'Helvetica', sans-serif;
        font-size: 0.8rem;
    }
    
    #new-prop-area {
        display: flex;
        flex-direction: column;
        width: 100%;
    }

    #new-prop-area.open > #new-prop-form {
        display:flex;
    }

    #new-prop-form {
        display: none;
        flex-direction: column;
        width: 100%;
    }

    .row {
        display: flex;
        flex-direction: row;
        width: 100%;
        align-items: center;
        margin-bottom: 1em;
    }

    h3 {
        padding: 0px;
        margin-bottom: 1em;
    }

    #new-prop-form > .row > * {
        margin-right: 16px;
        padding-left: 8px;
        padding-right: 8px;
    }
    #new-prop-form input {
        outline: none;
        border: 1px solid transparent;
        border-bottom: 1px solid rgba(100, 100, 100, 0.7);
        font-family: monospace;
        padding: 6px;
    }
    select {
        font-size: 1em;
    }
    #add-prop-dropdown-control {
        align-items: center;
        user-select: none;
    }

    #add-prop-dropdown-control:hover {
        cursor: pointer;
    }

    #caret-button {
        position: relative;
        width: 1.5em;
        height: 1.5em;
        transform: rotate(0deg);
        transition: transform 0.1s linear;
    }

    #caret-button > svg {
        width: 100%;
        height: 100%;
    }
    #new-prop-area.open #caret-button {
        transform: rotate(90deg);
        transition: transform 0.1s linear;
    }

</style>
<div id="new-prop-area">
    <div class="row" id="add-prop-dropdown-control">
        <h3><label for="caret-button">Add New Property</label></h3>
        <div id="caret-button">${caretRightIcon}</div>
    </div>
    <div id="new-prop-form">
        <div class="row">
            <label for="new-prop-name">Property Name </label>
            <input type="text" id="new-prop-name" placeholder="property-name"/>
        </div>
        <div class="row">
            <label for="default-val-select">Default value type</label>
            <select id="default-val-select">
                <option value="" selected>None</option>
                <option value="string">Text</option>
                <option value="number">Number</option>
                <option value="boolean">True or False</option>
            </select>
        </div>
        <div class="row">
            <label for="default-value">Default value </label>
            <input type="text" id="default-value" placeholder="Default value" disabled/>
        </div>
        <div class="row" id="submit-control">
            <button id="submit-prop">Create</button>
        </div>
    </div>
</div>
<div id="filter-area">
    <input type="text" id="filter-input" name="filter-input" placeholder="Filter..."/>
    <button id="clear">Clear</button>
</div>
<ul id="props-list">
    <slot></slot>
</ul>
`;

class EditorCustomList extends HTMLElement {
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
        this.render = this.render.bind(this);
        this.resetForm = this.resetForm.bind(this);
        this.onDefaultNewTypeChange = this.onDefaultNewTypeChange.bind(this);
        this.onCaretClick = this.onCaretClick.bind(this);
        this.onCreateSubmit = this.onCreateSubmit.bind(this);
        //this.onInput = this.onInput.bind(this);
        //this.onFilterClearClick = this.onFilterClearClick.bind(this);
    }

    connectedCallback(){
        if(this.isConnected){
            this.newPropTypeSelect = this._shadowRoot.getElementById('default-val-select');
            this.newPropNameInput = this._shadowRoot.getElementById('new-prop-name');
            this.newPropDefaultValue = this._shadowRoot.getElementById('default-value');
            this.addPropControl = this._shadowRoot.getElementById('add-prop-dropdown-control');
            this.newPropForm = this._shadowRoot.getElementById('new-prop-form');
            this.createButton = this._shadowRoot.getElementById('submit-prop');

            // Add listeners
            this.addPropControl.addEventListener('click', this.onCaretClick);
            this.createButton.addEventListener('click', this.onCreateSubmit);
        }
    }

    render(aModel){
        this.model = aModel;

        // Clear any main dom children
        this.innerHTML = "";

        // Set up event listeners
        this.newPropTypeSelect.removeEventListener('change', this.onDefaultNewTypeChange);
        this.newPropTypeSelect.addEventListener('change', this.onDefaultNewTypeChange);
    }

    onDefaultNewTypeChange(event){
        let option = event.target.selectedOptions[0];
        switch(option.value){
        case 'string':
            this.newPropDefaultValue.setAttribute('type', 'text');
            this.newPropDefaultValue.setAttribute('value', "");
            break;
        case 'number':
            this.newPropDefaultValue.setAttribute('type', 'number');
            this.newPropDefaultValue.setAttribute('value', 0);
            break;
        case 'boolean':
            this.newPropDefaultValue.setAttribute('type', 'checkbox');
            break;
        default:
            this.newPropDefaultValue.setAttribute('type', 'text');
        }

        if(option.value == ""){
            this.newPropDefaultValue.setAttribute('disabled', true);
        } else {
            this.newPropDefaultValue.removeAttribute('disabled');
        }
    }

    onCaretClick(event){
        let newPropArea = this._shadowRoot.getElementById('new-prop-area');
        newPropArea.classList.toggle('open');
    }

    onCreateSubmit(event){
        if(this.model){
            let propName = this.newPropNameInput.value;
            let defaultValue = this.newPropDefaultValue.value;
            if(this.newPropDefaultValue.type == 'checkbox'){
                defaultValue = this.newPropDefaultValue.checked;
            }

            // Send the property create message
            this.model.sendMessage({
                type: 'command',
                commandName: 'newProperty',
                args: [
                    propName,
                    this.model.id
                ]
            }, this.model);

            // Set the created prop to the default
            // value
            this.model.partProperties.setPropertyNamed(
                this.model,
                propName,
                defaultValue
            );
        }
    }

    resetForm(){
        // Nothing for now
    }
};

export {
    EditorCustomList,
    EditorCustomList as default
};
