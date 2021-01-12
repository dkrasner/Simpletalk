import PartView from '../PartView.js';

const templateString = `
<style>
    :host {
        position: absolute;
        box-sizing: border-box;
        top: 200px;
        left: 200px;
        min-width: 300px;
        min-height: 200px;
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

    :st-field{
        position: relative;
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
        <st-field></st-field>
    </div>
</div>
`;

class ButtonEditorView extends PartView {
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
        this.setupClickAndDrag = this.setupClickAndDrag.bind(this);
        // this.setupBarButtons = this.setupBarButtons.bind(this);
        // this.setupExpanderAreas = this.setupExpanderAreas.bind(this);
        this.onMouseMoveInBar = this.onMouseMoveInBar.bind(this);
        this.onMouseDownInBar = this.onMouseDownInBar.bind(this);
        this.onMouseUpAfterDrag = this.onMouseUpAfterDrag.bind(this);
    }

    afterModelSet() {
    }

    afterConnected(){
        this.setupClickAndDrag();
        // this.setupBarButtons();
        // this.setupExpanderAreas();
        this.style.top = "50px";
        this.style.left = "50px";
    }

    afterDisconnected(){
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
