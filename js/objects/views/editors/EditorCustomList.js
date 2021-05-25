

// PREAMBLE

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

    #new-prop-form {
        display: flex;
        flex-direction: column;
        width: 100%;
    }

    .row {
        display: flex;
        flex-direction: row;
        width: 100%;
        align-items: center;
    }
</style>
<div id="new-prop-area">
    <h4>Add New Property</h4>
    <div id="new-prop-form">
        <div class="row">
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
            <input type="text" id="default-value" placeholder="Default value" disabled/>
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
        this.onDefaultNewTypeChange = this.onDefaultNewTypeChange.bind(this);
        //this.onInput = this.onInput.bind(this);
        //this.onFilterClearClick = this.onFilterClearClick.bind(this);
    }

    connectedCallback(){
        if(this.isConnected){
            this.newPropTypeSelect = this._shadowRoot.getElementById('default-val-select');
            this.newPropNameInput = this._shadowRoot.getElementById('new-prop-name');
            this.newPropDefaultValue = this._shadowRoot.getElementById('default-value');
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
};

export {
    EditorCustomList,
    EditorCustomList as default
};
