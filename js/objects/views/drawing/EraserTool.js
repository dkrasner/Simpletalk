/**
 * EraserTool
 * -----------------------------------
 * I provide eraser-like functionality on
 * my parent element's shadow canvas.
 * I am specifically designed for use as a
 * child of DrawingView
 */
const eraserSVG = `
<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-eraser" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <path d="M19 19h-11l-4 -4a1 1 0 0 1 0 -1.41l10 -10a1 1 0 0 1 1.41 0l5 5a1 1 0 0 1 0 1.41l-9 9" />
  <line x1="18" y1="12.3" x2="11.7" y2="6" />
</svg>
`;

const eraserToolTemplateString = `
<style>
    :host {
        display: flex;
        position: relative;
        margin-bottom: 6px;
    }
    #tool-button {
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
    }
    :host([active="true"]) > #tool-button {
        border-color: var(--active-color);
        color: var(--active-color);
    }
    #brushes-container {
        position: relative;
        margin-left: 6px;
        display: none;
    }
    #brush-adjuster {
        position: relative;
        display: flex;
        margin-left: 6px;
        box-sizing: border-box;
        border-width: 1px;
        border-style: solid;
        border-color: var(--active-color);
    }
    #brush-slider,
    #brush-number {
        box-sizing: border-box;
    }
    #brush-number {
        max-width: 3rem;
    }
    :host([active="true"]) > #brushes-container {
        display: flex;
    }
</style>
<div id="tool-button">
  ${eraserSVG}
</div>
<div id="brushes-container">
  <div id="brush-adjuster">
    <input id="brush-slider" type="range" min="1" max="100" step="1">
    <input id="brush-number" type="number">
  </div>
</div>
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
        this.handleBrushSliderChange = this.handleBrushSliderChange.bind(this);
        this.handleBrushNumberInputChange = this.handleBrushNumberInputChange.bind(this);
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
            this.button = this.shadowRoot.getElementById('tool-button');
            this.button.addEventListener('click', this.toggleActive);
            this.brushSlider = this.shadowRoot.getElementById('brush-slider');
            this.brushSlider.addEventListener('input', this.handleBrushSliderChange);
            this.brushNumberInput = this.shadowRoot.getElementById('brush-number');
            this.brushNumberInput.addEventListener('input', this.handleBrushNumberInputChange);

            // If there are is currently a width set,
            // update the slider and number input accordingly
            let currentWidth = this.getAttribute('width');
            if(currentWidth){
                this.brushSlider.value = parseInt(currentWidth);
                this.brushNumberInput.value = parseInt(currentWidth);
            }
        }
    }

    disconnectedCallback(){
        this.ctx = null;
        this.button.removeEventListener('click', this.toggleActive);
        this.brushSlider.removeEventListener('input', this.handleBrushSliderChange);
        this.brushNumberInput.removeEventListener('input', this.handleBrushNumberInputChange);
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

    attributeChangedCallback(name, oldVal, newVal){
        if(name == 'width'){
            if(this.brushSlider){
                this.brushSlider.value = parseInt(newVal);
            }
            if(this.brushNumberInput){
                this.brushNumberInput.value = parseInt(newVal);
            }
        }
    }

    handleBrushSliderChange(event){
        this.setAttribute('width', event.target.value);
    }

    handleBrushNumberInputChange(event){
        this.setAttribute('width', event.target.value);
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
window.customElements.define('eraser-tool', EraserTool);

export {
    EraserTool,
    EraserTool as default
};
