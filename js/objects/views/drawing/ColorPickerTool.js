/**
 * ColorPickerTool
 * I provide a color choorser capability
 * for the shadow canvas of my parent element.
 * Brushes on my parent Drawing canvas will use
 * whatever color I have currently selected.
 * I am explicitly designed for use with
 * DrawingView*/
import {ColorWheelWidget} from './ColorWheelWidget.js';
const colorPickerSVG = `
<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-color-swatch" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <path d="M19 3h-4a2 2 0 0 0 -2 2v12a4 4 0 0 0 8 0v-12a2 2 0 0 0 -2 -2" />
  <path d="M13 7.35l-2 -2a2 2 0 0 0 -2.828 0l-2.828 2.828a2 2 0 0 0 0 2.828l9 9" />
  <path d="M7.3 13h-2.3a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h12" />
  <line x1="17" y1="17" x2="17" y2="17.01" />
</svg>
`;

const colorPickerTemplateString = `
<style>
    :host {
        display: block;
        position: relative;
        margin-bottom: 6px;
    }

    #tool-button {
        --active-color: black;
        --inactive-color: rgb(170, 170, 170);
        --hover-color: rgb(140, 140, 140);
        display: block;
        position: relative;
        border-width: 1px;
        border-style: solid;
        border-color: var(--inactive-color);
        color: var(--inactive-color);
        width: 24px;
        height: 24px;
    }

    :host([active="true"]) > #tool-button {
        border-color: var(--active-color);
        color: var(--active-color);
    }
    color-wheel {
        display: none;
        position: absolute;
    }

    :host([active="true"]) > color-wheel {
        display: flex;
    }
</style>
<div id="tool-button">
${colorPickerSVG}
</div>
<color-wheel></color-wheel>
`;


class ColorPickerTool extends HTMLElement {
    constructor(){
        super();

        // Set up shadow dom. This tool will
        // display itself as a button that can be
        // toggled within its parent DrawingView.
        this.template = document.createElement('template');
        this.template.innerHTML = colorPickerTemplateString;
        this.shadow = this.attachShadow({mode: 'open'});
        this.shadow.append(
            this.template.content.cloneNode(true)
        );

        // Default drawing context is null.
        // This will be set if and when this tool
        // is connected to a parent element
        // that has a context
        this.ctx = null;

        // Bind component methods
        this.start = this.start.bind(this);
        this.end = this.end.bind(this);
        this.onMove = this.onMove.bind(this);
        this.toggleActive = this.toggleActive.bind(this);
        this.onColorSelected = this.onColorSelected.bind(this);
        this.setContextFromAttributes = this.setContextFromAttributes.bind(this);
    }

    connectedCallback(){
        if(this.isConnected){
            this.setAttribute('role', 'tool');
            this.setAttribute('active', false);
            if(!this.hasAttribute('current-color')){
                this.setAttribute('current-color', 'rgba(0, 0, 0, 0)');
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
            this.colorWheel = this.shadowRoot.querySelector('color-wheel');
            this.colorWheel.addEventListener('color-selected', this.onColorSelected);
        }
    }

    disconnectedCallback(){
        this.ctx = null;
        this.button.removeEventListener('click', this.toggleActive);
        this.colorWheel.removeEventListener('color-selected', this.onColorSelected);
    }

    start(x, y){
        // Does nothing in this tool
    }

    end(x, y){
        // Does nothing in this tool
    }

    onMove(x, y){
        // Does nothing in this tool
    }

    setContextFromAttributes(){
        // Does nothing in this tool
    }

    onColorSelected(event){
        let colorInfo = event.detail;
        let colorStr = `rgba(${colorInfo.r}, ${colorInfo.g}, ${colorInfo.b}, ${colorInfo.alpha})`;
        console.log(colorStr);
        this.ctx.strokeStyle = colorStr;
        this.ctx.fillStyle = colorStr;
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



customElements.define('color-picker-tool', ColorPickerTool);

export {
    ColorPickerTool,
    ColorPickerTool as default
};
