import ColorWheelWidget from '../drawing/ColorWheelWidget.js';


const boldIcon = `
<svg  id="text-bold" xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-bold" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M7 5h6a3.5 3.5 0 0 1 0 7h-6z" />
    <path d="M13 12h1a3.5 3.5 0 0 1 0 7h-7v-7" />
</svg>
`;

const italicIcon = `
<svg id="text-italic"  xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-italic" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <line x1="11" y1="5" x2="17" y2="5" />
    <line x1="7" y1="19" x2="13" y2="19" />
    <line x1="14" y1="5" x2="10" y2="19" />
</svg>
`;


const justifyLeftIcon = `
<svg id="justifyleft"  xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-align-left" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="14" y2="12" />
    <line x1="4" y1="18" x2="18" y2="18" />
</svg>
`;

const justifyCenterIcon = `
<svg id="justifycenter" xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-align-center" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="6" y1="18" x2="18" y2="18" />
</svg>
`;

const justifyRightIcon = `
<svg id="justifyright"  xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-align-right" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="10" y1="12" x2="20" y2="12" />
    <line x1="6" y1="18" x2="20" y2="18" />
</svg>
`;

const textColorIcon = `
<svg id="text-color" xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-color-picker" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <line x1="11" y1="7" x2="17" y2="13" />
    <path d="M5 19v-4l9.7 -9.7a1 1 0 0 1 1.4 0l2.6 2.6a1 1 0 0 1 0 1.4l-9.7 9.7h-4" />
</svg>
`;

const backgroundColorIcon = `
<svg id="background-color" xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-color-swatch" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M19 3h-4a2 2 0 0 0 -2 2v12a4 4 0 0 0 8 0v-12a2 2 0 0 0 -2 -2" />
    <path d="M13 7.35l-2 -2a2 2 0 0 0 -2.828 0l-2.828 2.828a2 2 0 0 0 0 2.828l9 9" />
    <path d="M7.3 13h-2.3a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h12" />
    <line x1="17" y1="17" x2="17" y2="17.01" />
</svg>
`;


const scriptIcon = `
<svg id='script' xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-file-code" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
    <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
    <path d="M10 13l-1 2l1 2" />
    <path d="M14 13l1 2l-1 2" />
</svg>
`;

const templateString = `
<style>
    :host {
        position: absolute;
        box-sizing: border-box;
        border-style: inset;
        width: 16rem;
    }

    :host color-wheel{
        position: absolute;
    }

    .editor-bar {
        display: flex;
        flex-direction: row;
        width: 100%;
        height: 25px;
        background-color: rgb(218, 218, 218);
    }

    .editor-main {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        padding: 5px;
        justify-content: center;
        background-color: var(--palette-cornsik);
    }

    .editor-main > input.name,div.font,div.editor-icons {
        margin-top: 5px;
        margin-right: 1px;
        margin-left: 1px;
        width: 90%;
        text-align: center;
    }

    .editor-main > div.font {
        display: flex;
        justify-content: space-between;
    }

    .editor-main > div.font > select.text-font{
        width: 80%;
    }

    .editor-main > div.font > input.text-size{
        width: 15%;
        text-align: right;
    }

    .editor-bar-button {
        display: block;
        width: 12px;
        height: 12px;
        border-radius: 100%;
        background-color: rgba(255, 150, 150);
        margin-right: 4px;
        margin-left: 4px;
        align-self: center;
    }

    .close-button {
        background-color: rgba(255, 50, 50, 0.4);
    }

    .editor-title {
        align-self: center;
        margin-left: 10px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }

    .editor-icons > * {
        cursor: pointer;
    }

    svg * {
        pointer-events: none;
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
    <div class="font">
        <select class="text-font">
            <option>Crimson Pro</option>
            <option>Arial</option>>
            <option>Courier New</option>>
            <option>Georgia</option>>
            <option>Times New Roman</option>>
            <option>Trebuchet MS</option>>
            <option>Verdana</option>>
        </select>
        <input class="text-size"></input>
    </div>
    <div class="editor-icons">
        ${boldIcon}
        ${italicIcon}
        ${textColorIcon}
        ${backgroundColorIcon}
        ${justifyLeftIcon}
        ${justifyCenterIcon}
        ${justifyRightIcon}
        ${scriptIcon}
    </div>
</div>
`;


class EditorView extends HTMLElement {
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
        this.setProperty = this.setProperty.bind(this);
        this.toggleProperty = this.toggleProperty.bind(this);
        this.setupChangeHandlers = this.setupChangeHandlers.bind(this);
        this.setupOptions = this.setupOptions.bind(this);
        this.setupClickAndDrag = this.setupClickAndDrag.bind(this);
        this.openColorWheelWidget = this.openColorWheelWidget.bind(this);
        this.onColorSelected = this.onColorSelected.bind(this);
        this.onTransparencyChanged = this.onTransparencyChanged.bind(this);
        this.onMouseDownInBar = this.onMouseDownInBar.bind(this);
        this.onMouseUpAfterDrag = this.onMouseUpAfterDrag.bind(this);
        this.onMouseMoveInBar = this.onMouseMoveInBar.bind(this);
        this.onScriptIconClick = this.onScriptIconClick.bind(this);
        this.onCloseButtonClick = this.onCloseButtonClick.bind(this);
        this.onNameInput = this.onNameInput.bind(this);
    }


    connectedCallback(){
        if(this.isConnected){
            this.style.top = "200px";
            this.style.left = "200px";
            this.setupClickAndDrag();
            this.setupChangeHandlers();
        }
    }

    disconnectedCallback(){
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
        titleSpan.textContent = `Editor [${name}]`;
        nameInput.placeholder = name;
        let sizeSelect = this._shadowRoot.querySelector('input.text-size');
        let size = this.target.partProperties.getPropertyNamed(this.target, 'text-size');
        sizeSelect.placeholder = size;
    }

    /*
      I add all necessary event listeners for the various inputs, selectors
      and buttons
    */
    setupChangeHandlers(){
        let closeButton = this._shadowRoot.querySelector('div.close-button');
        closeButton.addEventListener('click', this.onCloseButtonClick);
        let nameInput = this._shadowRoot.querySelector('input.name');
        nameInput.addEventListener('input', this.onNameInput);
        let fontSelect = this._shadowRoot.querySelector('select.text-font');
        fontSelect.addEventListener('input', (event) => {this.setProperty("text-font", event.target.value);});
        let sizeSelect = this._shadowRoot.querySelector('input.text-size');
        sizeSelect.addEventListener('input', (event) => {this.setProperty("text-size", event.target.value);});
        let icons = this._shadowRoot.querySelector('.editor-icons');
        icons.childNodes.forEach((icon) => {
            if(icon.id === "script"){
                icon.addEventListener('click', this.onScriptIconClick);
            } else if(icon.id === "background-color"){
                icon.addEventListener('click', this.openColorWheelWidget);
            } else if(icon.id === "text-color"){
                icon.addEventListener('click', this.openColorWheelWidget);
            } else if(icon.id === "text-bold"){
                icon.addEventListener('click', () => {this.toggleProperty("text-bold");});
            } else if(icon.id === "text-italic"){
                icon.addEventListener('click', () => {this.toggleProperty("text-italic");});
            } else if(icon.id === "justifyleft"){
                icon.addEventListener('click', () => {this.setProperty("text-align", "left");});
            } else if(icon.id === "justifycenter"){
                icon.addEventListener('click', () => {this.setProperty("text-align", "center");});
            } else if(icon.id === "justifyright"){
                icon.addEventListener('click', () => {this.setProperty("text-align", "right");});
            }
        });
    }

    toggleProperty(name){
        let value = !this.target.partProperties.getPropertyNamed(this.target, name);
        this.setProperty(name, value);
    }
    setProperty(name, value){
        this.target.sendMessage({
            type: "command",
            commandName: "setProperty",
            args: [name, value]
        }, this.target);
    }

    onNameInput(event){
        let titleSpan = this._shadowRoot.querySelector('.editor-title > span');
        titleSpan.textContent = `Editor [${event.target.value}]`;
        this.setProperty("name", event.target.value);
    }

    onCloseButtonClick(){
        this.target.sendMessage({
            type: "command",
            commandName: "closeEditor",
            args: [this.target.id]
        }, this.target);
    }


    onScriptIconClick(){
        this.target.sendMessage({
            type: "command",
            commandName: "openScriptEditor",
            args: [this.target.id]
        }, this.target);
    }

    openColorWheelWidget(event){
        // make sure the color wheel is not already open
        let colorWheelWidget = this._shadowRoot.querySelector(`color-wheel[selector-command="${event.target.id}"]`);
        if(colorWheelWidget){
            return;
        }
        colorWheelWidget = new ColorWheelWidget(event.target.id);
        // add an attribute describing the command
        colorWheelWidget.setAttribute("selector-command", event.target.id);
        // add a custom callback for the close button
        let closeButton = colorWheelWidget.shadowRoot.querySelector('#close-button');
        closeButton.addEventListener('click', () => {colorWheelWidget.remove();});
        // add the colorWheelWidget
        event.target.parentNode.after(colorWheelWidget);
        // add a color-selected event callback
        // colorWheelWidget event listener
        let colorWheel = this.shadowRoot.querySelector('color-wheel');
        colorWheel.addEventListener('color-selected', this.onColorSelected);
        colorWheel.addEventListener('transparency-changed', this.onTransparencyChanged);
    }

    onColorSelected(event){
        let command = event.target.getAttribute("selector-command");
        let colorInfo = event.detail;
        let colorStr = `rgb(${colorInfo.r}, ${colorInfo.g}, ${colorInfo.b})`;
        this.setProperty(command, colorStr);
    }

    onTransparencyChanged(event){
        this.setProperty(event.detail.propName, event.detail.value);
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
    EditorView,
    EditorView as default
};
