/**
 * DrawingView
 * Experimental.
 * This is still a pure webcomponent and is not
 * linked at all to SimpleTalk yet.
 *
 */

/** Inline Image Resources **/
const pencilSVG = `
<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-pencil" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <path d="M4 20h4l10.5 -10.5a1.5 1.5 0 0 0 -4 -4l-10.5 10.5v4" />
  <line x1="13.5" y1="6.5" x2="17.5" y2="10.5" />
</svg>
`;

const eraserSVG = `
<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-eraser" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <path d="M19 19h-11l-4 -4a1 1 0 0 1 0 -1.41l10 -10a1 1 0 0 1 1.41 0l5 5a1 1 0 0 1 0 1.41l-9 9" />
  <line x1="18" y1="12.3" x2="11.7" y2="6" />
</svg>
`;

const templateString = `
<style>
    :host {
        display: inline-block;
        position: relative;
        box-sizing: border-box;
        border: 1px solid black;
    }
    #tool-buttons {
        position: absolute;
        left: calc(100% + 5px);
        top: 0px;
        display: flex;
        flex-direction: column;
    }
</style>
<canvas width="500" height="300"></canvas >
<div id="tool-buttons">
<slot></slot>
</div>
`;

class DrawingView extends HTMLElement {
    constructor(){
        super();

        // Setup shadow dom
        this.template = document.createElement('template');
        this.template.innerHTML = templateString;
        this.shadow = this.attachShadow({mode: 'open'});
        this.shadow.append(
            this.template.content.cloneNode(true)
        );

        // Bind component methods
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
    }

    connectedCallback(){
        if(this.isConnected){
            let canvas = this.shadow.querySelector('canvas');
            canvas.addEventListener('mouseup', this.onMouseUp);
            canvas.addEventListener('mousedown', this.onMouseDown);

            // Set and store the drawing context
            this.drawingContext = canvas.getContext('2d');

            // If I don't have the default tools, add
            // them as real dom children now
            let pencilChild = this.querySelector('pencil-tool');
            if(!pencilChild){
                let newPencil = document.createElement('pencil-tool');
                this.append(newPencil);
            }
            let eraserChild = this.querySelector('eraser-tool');
            if(!eraserChild){
                let newEraser = document.createElement('eraser-tool');
                this.append(newEraser);
            }
        }
    }

    disconnectedCallback(){
        let canvas = this.shadow.querySelector('canvas');
        canvas.removeEventListener('mouseup', this.onMouseUp);
        canvas.removeEventListener('mousedown', this.onMouseDown);
    }

    onMouseDown(event){
        if(event.shiftKey){
            return;
        }
        this.activeTool = this.querySelector('[role="tool"][active="true"]');
        if(!this.activeTool){
            return;
        }
        let canvas = this.shadow.querySelector('canvas');
        canvas.addEventListener('mousemove', this.onMouseMove);
        this.activeTool.start(event.offsetX, event.offsetY);
    }

    onMouseMove(event){
        if(this.activeTool){
            this.activeTool.onMove(
                event.offsetX,
                event.offsetY
            );
        }
    }

    onMouseUp(event){
        if(this.activeTool){
            this.activeTool.end(event.offsetX, event.offsetY);
        }
        let canvas = this.shadow.querySelector('canvas');
        canvas.removeEventListener('mousemove', this.onMouseMove);
    }
};
customElements.define('st-drawing', DrawingView);


const pencilTemplateString = `
<style>
    :host {
        --active-color: black;
        --inactive-color: rgb(170, 170, 170);
        --hover-color: rgb(140, 140, 140);
        display: block;
        width: 24px;
        height: 24px;
        border-width: 1px;
        border-style: solid;
        border-color: var(--inactive-color);
        color: var(--inactive-color);
        margin-bottom: 6px;
    }
    :host([active="true"]){
        border-color: var(--active-color);
        color: var(--active-color);
    }
</style>
${pencilSVG}
`;

class PencilTool extends HTMLElement {
    constructor(){
        super();

        // Set up shadow dom. This tool will
        // display itself as a button that can
        // be toggled.
        this.template = document.createElement('template');
        this.template.innerHTML = pencilTemplateString;
        this.shadow = this.attachShadow({mode: 'open'});
        this.shadow.append(
            this.template.content.cloneNode(true)
        );

        // Default drawing context
        // is null. This will be set
        // if and when this tool is
        // connected to a parent element
        // that has a context
        this.ctx = null;

        // Bind component methods
        this.start = this.start.bind(this);
        this.end = this.end.bind(this);
        this.onMove = this.onMove.bind(this);
        this.toggleActive = this.toggleActive.bind(this);
        this.setContextFromAttributes = this.setContextFromAttributes.bind(this);
    }

    connectedCallback(){
        if(this.isConnected){
            this.setAttribute('role', 'tool');
            this.setAttribute('active', false);
            if(!this.hasAttribute('width')){
                this.setAttribute('width', '6');
            }
            if(this.parentElement.drawingContext){
                this.ctx = this.parentElement.drawingContext;

                // If I am the only tool in my parent,
                // set myself to active
                let siblingTools = this.parentElement.querySelectorAll('[role="tool"]');
                if(siblingTools.length == 1){
                    this.setAttribute('active', true);
                }
            }

            // Attach event listeners
            this.addEventListener('click', this.toggleActive);
        }
    }

    disconnectedCallback(){
        this.ctx = null;
        this.removeEventListener('click', this.toggleActive);
    }

    start(x, y){
        this.setContextFromAttributes();
        this.ctx.moveTo(x, y);
        this.ctx.beginPath();
    }

    onMove(x, y){
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    }

    end(x, y){
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        this.ctx.closePath();
    }

    setContextFromAttributes(){
        // line cap
        let lineCap = this.getAttribute('line-cap');
        if(lineCap){
            this.ctx.lineCap = lineCap;
        } else {
            this.ctx.lineCap = "round"; // default
        }

        // line join
        let lineJoin = this.getAttribute('line-join');
        if(lineJoin){
            this.ctx.lineJoin = lineJoin;
        } else {
            this.ctx.lineJoin = "round";
        }

        // line width
        let lineWidth = this.getAttribute('width');
        if(lineWidth){
            this.ctx.lineWidth = parseInt(lineWidth);
        } else {
            this.ctx.lineWidth = 6;
        }
    }

    static get observedAttributes(){
        return [
            'width',
            'line-join',
            'line-cap'
        ];
    }

    toggleActive(event){
        let isActive = this.getAttribute('active');
        if(isActive == "true"){
            this.setAttribute('active', 'false');
        } else {
            // First, find any other tools in my parent
            // element and deactivate them.
            Array.from(this.parentElement.querySelectorAll('[role="tool"]'))
                .filter(el => {
                    return el.getAttribute('active') == 'true';
                })
                .forEach(el => {
                    el.setAttribute('active', 'false');
                });

            // Set this tool to be active
            this.setAttribute('active', 'true');
        }
    }
}
customElements.define('pencil-tool', PencilTool);


const eraserToolTemplateString = `
<style>
    :host {
        --active-color: black;
        --inactive-color: rgb(170, 170, 170);
        --hover-color: rgb(140, 140, 140);
        display: block;
        width: 24px;
        height: 24px;
        border-width: 1px;
        border-style: solid;
        border-color: var(--inactive-color);
        color: var(--inactive-color);
        margin-bottom: 6px;
    }
    :host([active="true"]){
        border-color: var(--active-color);
        color: var(--active-color);
    }
</style>
${eraserSVG}
`;

class EraserTool extends HTMLElement {
    constructor(){
        super();

        // Setup shadow dom. This tool will
        // display itself as a button that can
        // be toggled.
        this.template = document.createElement('template');
        this.template.innerHTML = eraserToolTemplateString;
        this.shadow = this.attachShadow({mode: 'open'});
        this.shadow.append(
            this.template.content.cloneNode(true)
        );

        // Default drawing context is null.
        // This will be set if and when this tool is
        // connected to a parent element that has a context
        this.ctx = null;

        // Bind component methods
        this.start = this.start.bind(this);
        this.end = this.end.bind(this);
        this.onMove = this.onMove.bind(this);
        this.toggleActive = this.toggleActive.bind(this);
        this.setContextFromAttributes = this.setContextFromAttributes.bind(this);
    }

    connectedCallback(){
        if(this.isConnected){
            this.setAttribute('role', 'tool');
            this.setAttribute('active', false);
            if(!this.hasAttribute('width')){
                this.setAttribute('width', '6');
            }
            if(this.parentElement.drawingContext){
                this.ctx = this.parentElement.drawingContext;

                // If I am the only tool in my parent,
                // set myself to active
                let siblingTools = this.parentElement.querySelectorAll('[role="tool"]');
                if(siblingTools.length == 1){
                    this.setAttribute('active', true);
                }
            }

            // Attach event listeners
            this.addEventListener('click', this.toggleActive);
        }
    }

    disconnectedCallback(){
        this.ctx = null;
        this.removeEventListener('click', this.toggleActive);
    }

    start(x, y){
        this.setContextFromAttributes();
        this.cachedStrokeStyle = this.ctx.strokeStyle;
        this.ctx.strokeStyle = 'red';
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.moveTo(x, y);
        this.ctx.beginPath();
    }

    onMove(x, y){
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    }

    end(x, y){
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.strokeStyle = this.cachedStrokeStyle;
    }

    setContextFromAttributes(){
        // line cap
        let lineCap = this.getAttribute('line-cap');
        if(lineCap){
            this.ctx.lineCap = lineCap;
        } else {
            this.ctx.lineCap = "round"; // default
        }

        // line join
        let lineJoin = this.getAttribute('line-join');
        if(lineJoin){
            this.ctx.lineJoin = lineJoin;
        } else {
            this.ctx.lineJoin = "round";
        }

        // line width
        let lineWidth = this.getAttribute('width');
        if(lineWidth){
            this.ctx.lineWidth = parseInt(lineWidth);
        } else {
            this.ctx.lineWidth = 6;
        }
    }

    static get observedAttributes(){
        return [
            'width',
            'line-join',
            'line-cap'
        ];
    }

    toggleActive(event){
        let isActive = this.getAttribute('active');
        if(isActive == "true"){
            this.setAttribute('active', 'false');
        } else {
            // First, find any other tools in my parent
            // element and deactivate them.
            Array.from(this.parentElement.querySelectorAll('[role="tool"]'))
                .filter(el => {
                    return el.getAttribute('active') == 'true';
                })
                .forEach(el => {
                    el.setAttribute('active', 'false');
                });

            // Set this tool to be active
            this.setAttribute('active', 'true');
        }
    }
};
customElements.define('eraser-tool', EraserTool);
