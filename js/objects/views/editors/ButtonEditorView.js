import ColorWheelWidget from '../drawing/ColorWheelWidget.js';

const templateString = `
<style>
    :host {
        position: absolute;
        box-sizing: border-box;
        border-style: inset;
    }

:host > color-wheel{
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
    }

    .editor-main > * {
        margin-top: 5px;
        margin-right: 1px;
        margin-left: 1px;
    }

    .editor-main input {
        width: 80%;
        text-align: center;
    }

    .editor-main > button {
        background-color: var(--palette-yellow);
        padding: 5px;
        border-radius: 5px;
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
    }
    .button-editor {
        position:relative;
        height: 100%;
    }

    .events-display {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .events-display > * {
        width: 80%;
        text-align: center;
        margin-top: 2px;
    }

    .event-list {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
    }

    .event-list > div {
        background-color: #4da5c6;
        border-style: solid;
        border-radius: 5px;
        margin-right: 2px;
        margin-left: 2px;
        margin-top: 2px;
        border-width: 1px;
        padding: 1px;
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
    <div class="events-display">
        <div class="event-list"></div>
    </div>
    <button class="script">Script</button>
    <button class="background-color" name="background-color">Background Color</button>
    <button class="text-color" name="text-color">Font Color</button>
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
        this.openColorWheelWidget = this.openColorWheelWidget.bind(this);
        this.onColorSelected = this.onColorSelected.bind(this);
        this.onVisibleChecked = this.onVisibleChecked.bind(this);
        this.onTransparentChecked = this.onTransparentChecked.bind(this);
        this.onMouseDownInBar = this.onMouseDownInBar.bind(this);
        this.onMouseUpAfterDrag = this.onMouseUpAfterDrag.bind(this);
        this.onMouseMoveInBar = this.onMouseMoveInBar.bind(this);
        this.onScriptButtonClick = this.onScriptButtonClick.bind(this);
        this.onCloseButtonClick = this.onCloseButtonClick.bind(this);
        this.onNameInput = this.onNameInput.bind(this);
        this._displayEvent = this._displayEvent.bind(this);
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
        let closeButton = this._shadowRoot.querySelector('div.close-button');
        closeButton.removeEventListener('click', this.onCloseButtonClick);
        let scriptButton = this._shadowRoot.querySelector('button.script');
        scriptButton.removeEventListener('click', this.onScriptButtonClick);
        let nameInput = this._shadowRoot.querySelector('input.name');
        nameInput.removeEventListener('input', this.onNameInput);
        let backgroundButton = this._shadowRoot.querySelector('button.background-color');
        backgroundButton.removeEventListener('click', this.openColorWheelWidget);
        let colorButton = this._shadowRoot.querySelector('button.text-color');
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
        titleSpan.textContent = `Button Editor [${name}]`;
        nameInput.placeholder = name;
        // set up events editing interface
        let currentEvents = this.target.partProperties.getPropertyNamed(this.target, "events");
        let eventsDiv = this._shadowRoot.querySelector('.editor-main > div.events-display');
        currentEvents.forEach((e) => {
            this._displayEvent(e);
        });
    }

    /*
      I add all necessary event listeners for the various inputs, selectors
      and buttons
    */
    setupChangeHandlers(){
        // scripting
        let closeButton = this._shadowRoot.querySelector('div.close-button');
        closeButton.addEventListener('click', this.onCloseButtonClick);
        let scriptButton = this._shadowRoot.querySelector('button.script');
        scriptButton.addEventListener('click', this.onScriptButtonClick);
        let nameInput = this._shadowRoot.querySelector('input.name');
        nameInput.addEventListener('input', this.onNameInput);
        let backgroundButton = this._shadowRoot.querySelector('button.background-color');
        backgroundButton.addEventListener('click', this.openColorWheelWidget);
        let colorButton = this._shadowRoot.querySelector('button.text-color');
        colorButton.addEventListener('click', this.openColorWheelWidget);
    }

    onNameInput(event){
        let titleSpan = this._shadowRoot.querySelector('.editor-title > span');
        titleSpan.textContent = `Button Editor [${event.target.value}]`;
        this.target.sendMessage({
            type: "command",
            commandName: "setProperty",
            args: ["name", event.target.value]
        }, this.target);
    }

    onCloseButtonClick(){
        this.target.sendMessage({
            type: "command",
            commandName: "closeEditor",
            args: [this.target.id]
        }, this.target);
    }


    onScriptButtonClick(){
        this.target.sendMessage({
            type: "command",
            commandName: "openScriptEditor",
            args: [this.target.id]
        }, this.target);
    }

    openColorWheelWidget(event){
        // make sure the color wheel is not already open
        let colorWheelWidget = this._shadowRoot.querySelector(`color-wheel[selector-command="${event.target.name}"]`);
        if(colorWheelWidget){
            return;
        }
        colorWheelWidget = new ColorWheelWidget(event.target.name);
        // add an attribute describing the command
        colorWheelWidget.setAttribute("selector-command", event.target.name);
        // add a custom callback for the close button
        let closeButton = colorWheelWidget.shadowRoot.querySelector('#close-button');
        closeButton.addEventListener('click', () => {colorWheelWidget.remove();});
        // add the colorWheelWidget
        event.target.parentNode.after(colorWheelWidget);
        // add a color-selected event callback
        // colorWheelWidget event listener
        let colorWheel = this.shadowRoot.querySelector('color-wheel');
        colorWheel.addEventListener('color-selected', this.onColorSelected);
        colorWheel.addEventListener('visible-checked', this.onVisibleChecked);
        colorWheel.addEventListener('transparent-checked', this.onTransparentChecked);
    }

    onColorSelected(event){
        let command = event.target.getAttribute("selector-command");
        let colorInfo = event.detail;
        let colorStr = `rgba(${colorInfo.r}, ${colorInfo.g}, ${colorInfo.b}, ${colorInfo.alpha})`;
        this.target.sendMessage({
            type: "command",
            commandName: "setProperty",
            args: [command, colorStr]
        }, this.target);
    }

    onVisibleChecked(event){
        this.target.sendMessage({
            type: "command",
            commandName: "setProperty",
            args: ["visible", event.detail]
        }, this.target);
    }

    onTransparentChecked(event){
        this.target.sendMessage({
            type: "command",
            commandName: "setProperty",
            args: ["transparent", event.detail]
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

    _displayEvent(eventName){
        let eventListDiv = this._shadowRoot.querySelector('div.event-list');
        // if the event is already listed do nothing
        // TODO: this is a hack b/c the editor is not properly responsive at the moment
        let eventEl = eventListDiv.querySelector(`#${eventName}`);
        if(eventEl){
            return;
        }
        eventEl = document.createElement("div");
        let eventSpan = document.createElement("span");
        eventEl.id = eventName;
        eventSpan.textContent = eventName;
        eventEl.appendChild(eventSpan);
        eventListDiv.appendChild(eventEl);
    }

    _removeEvent(eventName){
        let eventListDiv = this._shadowRoot.querySelector('div.event-list');
        let eventEl = eventListDiv.querySelector(`#${eventName}`);
        eventListDiv.removeChild(eventEl);
    }
};

export {
    ButtonEditorView,
    ButtonEditorView as default
};
