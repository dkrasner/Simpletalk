import ColorWheelWidget from '../drawing/ColorWheelWidget.js';

const closeIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-square-x" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><rect x="4" y="4" width="16" height="16" rx="2"></rect><path d="M10 10l4 4m0 -4l-4 4"></path></svg>`;

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
    <button class="background-color" name="background-color">Background Color</button>
    <button class="font-color" name="font-color">Font Color</button>
    <div class="events-display">
        <input class="events"></input>
        <div class="event-list"></div>
    </div>
</div>
`;

const SVGParser = new DOMParser();

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
        this.onMouseDownInBar = this.onMouseDownInBar.bind(this);
        this.onMouseUpAfterDrag = this.onMouseUpAfterDrag.bind(this);
        this.onMouseMoveInBar = this.onMouseMoveInBar.bind(this);
        this.onScriptButtonClick = this.onScriptButtonClick.bind(this);
        this.onCloseButtonClick = this.onCloseButtonClick.bind(this);
        this.onNameInput = this.onNameInput.bind(this);
        this.onIgnoreEvent = this.onIgnoreEvent.bind(this);
        this.onEventInputKeydown = this.onEventInputKeydown.bind(this);
        this.respondToEvent = this.respondToEvent.bind(this);
        this._displayEvent = this._displayEvent.bind(this);
        this._removeEvent = this._removeEvent.bind(this);
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
        let colorButton = this._shadowRoot.querySelector('button.font-color');
        let eventsDiv = this._shadowRoot.querySelector('.editor-main > div.events-display');
        let eventsInput = eventsDiv.querySelector('input.events');
        eventsInput.removeEventListener('keydown', this.onEventInputKeydown);
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
        nameInput.defaultValue = name;
        // set up events editing interface
        let currentEvents = this.target.partProperties.getPropertyNamed(this.target, "events");
        let eventsDiv = this._shadowRoot.querySelector('.editor-main > div.events-display');
        let eventsInput = eventsDiv.querySelector('input.events');
        eventsInput.placeholder = "Add event name";
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
        let colorButton = this._shadowRoot.querySelector('button.font-color');
        colorButton.addEventListener('click', this.openColorWheelWidget);
        let eventsDiv = this._shadowRoot.querySelector('.editor-main > div.events-display');
        let eventsInput = eventsDiv.querySelector('input.events');
        eventsInput.addEventListener('keydown', this.onEventInputKeydown);
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
        let colorWheelWidget = new ColorWheelWidget(event.target.name);
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

    onIgnoreEvent(event){
        this.target.sendMessage({
            type: "command",
            commandName: "setProperty",
            args: ["eventIgnore", event.target.name]
        }, this.target);
        this._removeEvent(event.target.name);
    }

    onEventInputKeydown(event){
        if(event.code === "Enter"){
            this.respondToEvent(event.target.value);
        }
    }

    respondToEvent(eventName){
        this.target.sendMessage({
            type: "command",
            commandName: "setProperty",
            args: ["eventRespond", eventName]
        }, this.target);
        this._displayEvent(eventName);
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
        let eventEl = document.createElement("div");
        let eventSpan = document.createElement("span");
        let xmlDocument = SVGParser.parseFromString(closeIcon, 'application/xml');
        let closeSvgEl = xmlDocument.documentElement;
        closeSvgEl.name = eventName;
        eventEl.id = eventName;
        closeSvgEl.addEventListener('click', this.onIgnoreEvent);
        eventSpan.textContent = eventName;
        eventEl.appendChild(closeSvgEl);
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
