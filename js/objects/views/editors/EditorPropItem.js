// PREAMBLE

const checkIcon = `
<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-circle-check" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#00b341" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <circle cx="12" cy="12" r="9" />
  <path d="M9 12l2 2l4 -4" />
</svg>
`;

const cancelIcon = `
<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-circle-x" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ff2825" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <circle cx="12" cy="12" r="9" />
  <path d="M10 10l4 4m0 -4l-4 4" />
</svg>
`;

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
        display:none;
    }

    button {
        outline: none;
        border: 1px solid transparent;
        background-color: transparent;
        opacity: 1.0;
        transition: opacity 0.1s linear;
    }

    button:disabled {
        opacity: 0.05;
        transition: opacity: 0.1s linear;
    }

    button:hover {
        cursor: pointer;
    }

    button.button-hidden {
        display: none;
    }

    label {
        font-family: monospace;
    }

    input {
        border: 1px solid transparent;
        border-bottom: 1px solid rgba(100, 100, 100, 0.5);
        outline: none;
    }
    
    input:focus {
        border: 1px solid rgba(100, 100, 100, 0.8);
    }
</style>
<li>
    <label for="prop-value"></label>
    <input id="prop-value" name="prop-value"/>
    <button id="accept" disabled>${checkIcon}</button>
    <button id="cancel" disabled>${cancelIcon}</button>
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
        this.onInputInput = this.onInputInput.bind(this);
        this.onAcceptClick = this.onAcceptClick.bind(this);
        this.onCancelClick = this.onCancelClick.bind(this);
        this.setupNumericInput = this.setupNumericInput.bind(this);
        this.enableButtons = this.enableButtons.bind(this);
        this.disableButtons = this.disableButtons.bind(this);
    }

    setProperty(aProperty, anOwner){
        // Remove any existing event handlers
        // TODO
        this.property = aProperty;
        this.owner = anOwner;

        // Update the element attributes
        this.setAttribute('name', this.property.name);
        this.setAttribute('owner-id', this.owner.id);

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
        this.inputElement.removeEventListener('input', this.onInputInput);
        this.inputElement.removeEventListener('change', this.onInputChange);
        this.acceptButton.removeEventListener('click', this.onAcceptClick);
        this.cancelButton.removeEventListener('click', this.onCancelClick);

        // Add new events
        this.inputElement.addEventListener('input', this.onInputInput);
        this.inputElement.addEventListener('change', this.onInputChange);
        this.acceptButton.addEventListener('click', this.onAcceptClick);
        this.cancelButton.addEventListener('click', this.onCancelClick);
        
        this.labelElement.textContent = `${this.property.name}:`;
        let currentVal = this.property.getValue(this.owner);
        if(currentVal == null || currentVal == undefined){
            // Do something different here
        } else if(typeof(currentVal) == 'number'){
            this.setupNumericInput();
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

    setupNumericInput(){
        if(this.property.name.endsWith('-transparency')){
            this.inputElement.setAttribute('type', 'range');
            this.inputElement.setAttribute('step', '0.05');
            this.inputElement.setAttribute('min', '0.0');
            this.inputElement.setAttribute('max', '1.0');
        } else {
            this.inputElement.setAttribute('type', 'number');
        }
    }

    onInputChange(event){
        if(event.target.type == "checkbox"){
            this.owner.partProperties.setPropertyNamed(
                this.owner,
                this.property.name,
                event.target.checked
            );
        }
    }

    onInputInput(event){
        let inputType = event.target.getAttribute('type');
        if(inputType == 'range'){
            return this.onAcceptClick();
        }
        if(event.target.value !== this.property.getValue(this.owner)){
            this.enableButtons();
        } else {
            this.disableButtons();
        }
    }

    enableButtons(){
        this.acceptButton.removeAttribute('disabled');
        this.cancelButton.removeAttribute('disabled');
    }

    disableButtons(){
        this.acceptButton.setAttribute('disabled', true);
        this.cancelButton.setAttribute('disabled', true);
    }

    onAcceptClick(event){
        let value = this.inputElement.value;
        if(this.inputElement.type == 'number' || this.inputElement.type == 'range'){
            value = parseFloat(value);
        } else if(this.inputElement.type == 'checkbox'){
            value = this.inputElement.checked;
        }
        this.owner.partProperties.setPropertyNamed(
            this.owner,
            this.property.name,
            value
        );
        this.disableButtons();
    }

    onCancelClick(event){
        this.inputElement.value = this.owner.partProperties.getPropertyNamed(
            this.owner,
            this.property.name
        );
        this.disableButtons();
    }
};

export {
    EditorPropItem,
    EditorPropItem as default
};
