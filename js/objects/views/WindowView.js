/**
 * WindowView
 * -------------------------------
 * I am the view of a Window Part.
 * Windows are wrappers for Stacks/StackViews that
 * appear as the subparts of other Stacks or Cards.
 * They are examples of how we can use stack and card
 * composition to create more complex UIs.
 */
import PartView from './PartView.js';

const template = document.createElement('template');
template.innerHTML = `
<style>
 * {
     box-sizing: border-box;
 }
 :host {
     box-sizing: border-box;
     display: flex;
     position: absolute;
     flex-direction: column;
     min-width: 150px;
     background-color: rgb(253, 253, 253);
     border: 1px solid rgba(100, 100, 100, 0.2);
     box-shadow: 3px 4px 4px 0px rgba(50, 50, 50, 0.3);
 }
 .st-window-bar {
     display: flex;
     flex-direction: row;
     width: 100%;
     min-height: 25px;
     background-color: rgb(218, 218, 218);
     padding-left: 8px;
     padding-right: 8px;
     align-items: center;
 }
 .st-window-button {
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
 .shade-button {
     background-color: rgba(255, 255, 0. 0.4);
 }
 .expand-button {
     background-color: rgba(150, 255, 0, 0.8);
 }
 .st-window-pane {
     display: block;
     position: relative;
     flex: 1;
 }
 .st-window-pane.shaded {
     display: none;
 }
 .st-window-gripper {
     display: block;
     position: absolute;
     top: calc(100% - 15px);
     width: 30px;
     height: 30px;
     border: 1px solid red;
 }
 .right-gripper {
     left: calc(100% - 15px);
 }
 .right-gripper:hover {
     cursor: nwse-resize;
 }
 .left-gripper {
     right: calc(100% - 15px);
 }
 .left-gripper:hover {
     cursor: nesw-resize;
 }
 .st-window-pane
</style>
<div class="st-window-bar">
    <div class="st-window-button close-button"></div>
    <div class="st-window-button shade-button"></div>
    <div class="st-window-button expand-button"></div>
</div>
<div class="st-window-pane">
    <slot></slot>
</div>
<div class="st-window-gripper right-gripper" data-grip-end="right"></div>
`;

class WindowView extends PartView {
    constructor(){
        super();

        var templateContent = template.content.cloneNode(true);
        this._shadowRoot = this.attachShadow({mode: 'open'});
        this._shadowRoot.appendChild(templateContent);

        this.mouseDownInBar = false;
        this.isShaded = false;
        this.isExpanded = false;
        this.expandCache = {};

        // Whether or not we are gripping the
        // bottom right corner for a resize
        this.isGripping = false;

        // Bound methods
        this.setupClickAndDrag = this.setupClickAndDrag.bind(this);
        this.setupBarButtons = this.setupBarButtons.bind(this);
        this.setupExpanderAreas = this.setupExpanderAreas.bind(this);
        this.onMouseMoveInBar = this.onMouseMoveInBar.bind(this);
        this.onMouseDownInBar = this.onMouseDownInBar.bind(this);
        this.onMouseUpInBar = this.onMouseUpInBar.bind(this);
        this.onClose = this.onClose.bind(this);
        this.onShade = this.onShade.bind(this);
        this.onExpand = this.onExpand.bind(this);
        this.onGripDown = this.onGripDown.bind(this);
        this.onGripUp = this.onGripUp.bind(this);
        this.onGripMove = this.onGripMove.bind(this);
    }

    connectedCallback(){
        if(this.isConnected){
            this.setupClickAndDrag();
            this.setupBarButtons();
            this.setupExpanderAreas();
            this.style.top = "50px";
            this.style.left = "50px";
        }
    }


    setupClickAndDrag(){
        let bar = this._shadowRoot.querySelector('.st-window-bar');
        bar.addEventListener('mousedown', this.onMouseDownInBar);
        bar.addEventListener('mouseup', this.onMouseUpInBar);
    }

    setupBarButtons(){
        let closeButton = this._shadowRoot.querySelector('.close-button');
        let shadeButton = this._shadowRoot.querySelector('.shade-button');
        let expandButton = this._shadowRoot.querySelector('.expand-button');

        closeButton.addEventListener('click', this.onClose);
        shadeButton.addEventListener('click', this.onShade);
        expandButton.addEventListener('click', this.onExpand);
    }

    setupExpanderAreas(){
        let lowerRight = this._shadowRoot.querySelector('.right-gripper');
        lowerRight.addEventListener('mousedown', this.onGripDown);
    }

    onExpand(event){
        if(this.isExpanded){
            this.style.width = this.expandCache.width;
            this.style.height = this.expandCache.height;
            this.style.top = this.expandCache.top;
            this.style.left = this.expandCache.left;
            this.isExpanded = false;
        } else {
            this.expandCache = {
                width: this.style.width,
                height: this.style.height,
                top: this.style.top,
                left: this.style.left
            };
            // Set new values based on window size
            this.style.top = "0px";
            this.style.left = "0px";
            this.style.width = "100vw";
            this.style.height = "100vh";
            this.isExpanded = true;
        }
    }

    onShade(event){
        let pane = this._shadowRoot.querySelector('.st-window-pane');
        if(this.isShaded){
            pane.classList.remove('shaded');
            this.isShaded = false;
        } else {
            pane.classList.add('shaded');
            this.isShaded = true;
        }
    }

    onClose(event){
        // Remove from the DOM
        this.parentNode.removeChild(this);
    }

    onMouseDownInBar(event){
        this.mouseDownInBar = true;
        let bar = event.target;
        document.addEventListener('mousemove', this.onMouseMoveInBar);
    }

    onMouseUpInBar(event){
        this.mouseDownInBar = false;
        let bar = event.target;
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

    onGripUp(event){
        this.isGripping = false;
        document.removeEventListener('mousemove', this.onGripMove);
        document.removeEventListener('mouseup', this.onGripUp);
    }

    onGripDown(event){
        this.isGripping = true;
        console.log(this.getBoundingClientRect());
        document.addEventListener('mousemove', this.onGripMove);
        document.addEventListener('mouseup', this.onGripUp);
    }

    onGripMove(event){
        if(this.isGripping){
            // Figure out the current width and height
            let box = this.getBoundingClientRect();
            let newWidth = Math.floor(box.width) + event.movementX;
            if(newWidth){
                this.style.width = `${newWidth}px`;
            }
            let newHeight = Math.floor(box.height) + event.movementY;
            if(newHeight){
                this.style.height = `${newHeight}px`;
            }
        }
    }

};

export {
    WindowView,
    WindowView as default
};
