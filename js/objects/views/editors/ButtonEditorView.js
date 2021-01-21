import PartView from '../PartView.js';

const templateString = `
<style>
    :host {
        position: absolute;
        box-sizing: border-box;
        border-style: inset;
    }

    .editor-bar {
        display: flex;
        flex-direction: row;
        height: 25px;
        background-color: rgb(218, 218, 218);
        padding-left: 8px;
        padding-right: 8px;
        align-items: center;
    }

    .editor-main {
        display: flex;
        flex-direction: column;
        padding: 5px;
    }

    .editor-main > * {
        margin-top: 1px;
        margin-bottom: 1px;
        text-align: center;
    }

    .editor-bar-button {
        display: block;
        width: 12px;
        height: 12px;
        border-radius: 100%;
        background-color: rgba(255, 150, 150);
        margin-right: 4px;
    }
    .close-button {
        background-color: rgba(255, 50, 50, 0.4);
    }

    .button-editor {
        position:relative;
        height: 100%;
    }

    .events {
        display: flex;
        flex-direction: column
    }
</style>
<div class="editor-bar">
    <div class="editor-bar-button close-button"></div>
    <div class="editor-title">
        <span></span>
    </div>
</div>
<div class="editor-main">
    <input class="name"></input>
    <button class="script">Script</button>
    <button class="background-color">Background Color</button>
    <button class="font-color">Font Color</button>
    <div class="events">
        <input type="checkbox" id="click" name="click" checked>
        <label for="click">click</label>
        <input type="checkbox" id="mouseenter" name="mouseenter">
        <label for="mouseenter">mouseenter</label>
        <input type="checkbox" id="mouseover" name="mouseover">
        <label for="mouseenter">mouseover</label>
    </div>
</div>
`;

class ButtonEditorView extends HTMLElement {
    constructor(){
        super();

        // Configure the Shadow DOM and template
        this.template = document.createElement('template');
        this.template.innerHTML = templateString;
        this._shadowRoot = this.attachShadow({mode: 'open'});
        this._shadowRoot.appendChild(
            this.template.content.cloneNode(true)
        );

        this.target = null;
        this.mouseDownInBar = false;

        // bind methods
        this.setTarget = this.setTarget.bind(this);
        this.setupChangeHandlers = this.setupChangeHandlers.bind(this);
        this.setupOptions = this.setupOptions.bind(this);
        this.setupClickAndDrag = this.setupClickAndDrag.bind(this);
        // this.setupBarButtons = this.setupBarButtons.bind(this);
        // this.setupExpanderAreas = this.setupExpanderAreas.bind(this);
        this.onMouseDownInBar = this.onMouseDownInBar.bind(this);
        this.onMouseUpAfterDrag = this.onMouseUpAfterDrag.bind(this);
        this.onMouseMoveInBar = this.onMouseMoveInBar.bind(this);
        this.onScriptButtonClick = this.onScriptButtonClick.bind(this);

    }


    connectedCallback(){
        if(this.isConnected){
            // this.setupBarButtons();
            // this.setupExpanderAreas();
            this.style.top = "200px";
            this.style.left = "200px";
            this.setupClickAndDrag();
            this.setupChangeHandlers();
        }
    }

    disconnectedCallback(){
        let scriptButton = this._shadowRoot.querySelector('button.script');
        scriptButton.removeEventListener('click', this.onScriptButtonClick);
    }

    setTarget(partId){
        this.setAttribute("target-id", partId);
        this.target = window.System.partsById[partId];
        this.setupOptions();
    }

    /*
      I set up various options vased on the button partPrperties, such
      as default name, events etc
    */
    setupOptions(){
        // set the default as the current button name in the name field and the window bar
        let name = this.target.partProperties.getPropertyNamed(this.target, 'name');
        let titleSpan = this._shadowRoot.querySelector('.editor-title > span');
        let nameInput = this._shadowRoot.querySelector('input.name');
        titleSpan.textContent = name;
        nameInput.defaultValue = name;
    }

    /*
      I add all necessary event listeners for the various inputs, selectors
      and buttons
    */
    setupChangeHandlers(){
        // scripting
        let scriptButton = this._shadowRoot.querySelector('button.script');
        scriptButton.addEventListener('click', this.onScriptButtonClick);
    }

    onScriptButtonClick(){
        this.target.sendMessage({
            type: "command",
            commandName: "openScriptEditor",
            args: [this.target.id]
        }, this.target);
    }

    setupClickAndDrag(){
        let bar = this._shadowRoot.querySelector('.editor-bar');
        bar.addEventListener('mousedown', this.onMouseDownInBar);
    }

    onMouseDownInBar(event){
        this.mouseDownInBar = true;
        let bar = event.target;
        document.addEventListener('mousemove', this.onMouseMoveInBar);
        document.addEventListener('mouseup', this.onMouseUpAfterDrag);
    }

    onMouseUpAfterDrag(event){
        this.mouseDownInBar = false;
        let bar = event.target;
        document.removeEventListener('mouseup', this.onMouseUpAfterDrag);
        document.removeEventListener('mousemove', this.onMouseMoveInBar);
    }

    onMouseMoveInBar(event){
        let currentTop = parseInt(this.style.top);
        let currentLeft = parseInt(this.style.left);
        let newTop = `${currentTop + event.movementY}px`;
        let newLeft = `${currentLeft + event.movementX}px`;
        this.style.top = newTop;
        this.style.left = newLeft;
    }

};

export {
    ButtonEditorView,
    ButtonEditorView as default
};
