import PartView from '../PartView.js';
import Field from '../../parts/Field.js';

const templateString = `
<style>
    :host {
        position: absolute;
        box-sizing: border-box;
        top: 200px;
        left: 200px;
        border-style: inset;
        min-width: 300px;
        min-height: 300px;
    }

    .st-field-bar {
        display: flex;
        flex-direction: row;
        height: 25px;
        background-color: rgb(218, 218, 218);
        padding-left: 8px;
        padding-right: 8px;
        align-items: center;
    }

    .st-field-main {
        display: flex;
        flex-direction: row;
        min-height: 200px;
    }

    .st-field-main > * {
        width: 50%;
    }

    .st-field-pain-general > st-field {
        position: relative!important;
        height: 100%;
    }

    .st-field-pain-editor > * {
        position: relative;
        height: 100%;
    }

    .st-field-button {
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
</style>
<div class="st-field-bar">
    <div class="st-field-button close-button"></div>
    <div class="st-field-title">
        <span></span>
    </div>
</div>
<div class="st-field-main">
    <div class="st-field-pane-general">
        <slot></slot>
    </div>
    <div class="st-field-pane-editor">
        <slot></slot>
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

        this.mouseDownInBar = false;

        // bind methods
        this.setTarget = this.setTarget.bind(this);
        this.setupClickAndDrag = this.setupClickAndDrag.bind(this);
        this.setupField = this.setupField.bind(this);
        // this.setupBarButtons = this.setupBarButtons.bind(this);
        // this.setupExpanderAreas = this.setupExpanderAreas.bind(this);
        this.onMouseDownInBar = this.onMouseDownInBar.bind(this);
        this.onMouseUpAfterDrag = this.onMouseUpAfterDrag.bind(this);
    }


    connectedCallback(){
        if(this.isConnected){
            this.setupClickAndDrag();
            // this.setupBarButtons();
            // this.setupExpanderAreas();
            this.style.top = "50px";
            this.style.left = "50px";
        }
    }

    disconnectedCallback(){
    }

    setTarget(partId){
        this.setAttribute("target-id", partId);
    }

    setupField(){
        let targetId = this.getAttribute("target-id");
        console.log(targetId);
        let targetPart = window.System.partsById[targetId];
        let fieldModel = window.System.newModel('field', this.model.id);

        // setup cusotm editor css classes
        let fieldView = window.System.findViewById(fieldModel.id);
        fieldView.classList.add("button-editor");
        // Set the field's htmlContent to be the textToHtml converted
        // script of the given target part.
        let currentScript = targetPart.partProperties.getPropertyNamed(
            targetPart,
            'script'
        );

        let htmlContent = fieldView.textToHtml(currentScript);
        // set the inner html of the textarea with the proper htmlContent
        // NOTE: at the moment fieldView does not subscribe to htmlContent
        // change due to cursor focus and other issues
        let textArea = fieldView._shadowRoot.querySelector(".field-textarea");
        textArea.innerHTML = htmlContent;
        fieldModel.partProperties.setPropertyNamed(
            fieldModel,
            'htmlContent',
            htmlContent
        );


    }

    setupClickAndDrag(){
        let bar = this._shadowRoot.querySelector('.st-field-bar');
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
