// PREAMBLE

const templateString = `
<style>
    li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px;
        padding-left: 8px;
        padding-right: 8px;
        margin-top: 6px;
    }
   
    li > label {
        flex: 1;
    }

    :host {
        width: 100%;
    }

    :host(.item-hidden) {
        display: none;
    }

    button.button-hidden {
        display: none;
    }
    label {
        font-family: monospace;
    }
</style>
<li>
    <label for="prop-value"></label>
    <input id="prop-value" name="prop-value"/>
    <button id="cancel">X</button>
    <button id="accept">S</button>
</li>
`;

class EditorPropItem extends HTMLElement {
    constructor(){
        super();

        // Setup template and shadow root
        const template = document.createElement('template');
        template.innerHTML = templateString;
        this._shadowRoot = this.attachShadow({mode: 'open'});
        this._shadowRoot.appendChild(
            template.content.cloneNode(true)
        );

        // By default, there is no property
        this.property = null;
        this.owner = null;

        // Bound methods
        this.render = this.render.bind(this);
        this.onInputChange = this.onInputChange.bind(this);
        this.onAcceptClick = this.onAcceptClick.bind(this);
        this.onCancelClick = this.onCancelClick.bind(this);
    }

    setProperty(aProperty, anOwner){
        // Remove any existing event handlers
        // TODO
        this.property = aProperty;
        this.owner = anOwner;

        // Add new event handlers

        // Render
        this.render();
        
    }

    render(){
        this.labelElement = this._shadowRoot.querySelector('label');
        this.inputElement = this._shadowRoot.querySelector('input');
        this.acceptButton = this._shadowRoot.getElementById('accept');
        this.cancelButton = this._shadowRoot.getElementById('cancel');

        // Remove any hide classes
        this.acceptButton.classList.remove('button-hidden');
        this.cancelButton.classList.remove('button-hidden');
        
        // Remove any bound events
        this.inputElement.removeEventListener('change', this.onInputChange);
        this.acceptButton.removeEventListener('click', this.onAcceptClick);
        this.cancelButton.removeEventListener('click', this.onCancelClick);
        
        this.labelElement.textContent = `${this.property.name}:`;
        let currentVal = this.property.getValue(this.owner);
        if(currentVal == null || currentVal == undefined){
            // Do something different here
        } else if(typeof(currentVal) == 'number'){
            this.inputElement.setAttribute('type', 'number');
            
        } else if(typeof(currentVal) == 'boolean'){
            this.inputElement.setAttribute('type', 'checkbox');
            this.inputElement.checked = currentVal;
            this.acceptButton.classList.add('button-hidden');
            this.cancelButton.classList.add('button-hidden');
        } else {
            this.inputElement.setAttribute('type', 'text');
        }

        this.inputElement.setAttribute('placeholder', currentVal);
        this.inputElement.value = currentVal;
    }

    onInputChange(event){
        
    }

    onAcceptClick(event){
        
    }

    onCancelClick(event){
        
    }
};

export {
    EditorPropItem,
    EditorPropItem as default
};
