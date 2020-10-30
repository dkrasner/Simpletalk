/**
 * DrawingView
 * Experimental.
 * This is still a pure webcomponent and is not
 * linked at all to SimpleTalk yet.
 *
 */
import {PartView} from '../PartView.js';
import {PencilTool} from './PencilTool.js';
import {EraserTool} from './EraserTool.js';
import {ColorPickerTool} from './ColorPickerTool.js';

const haloButtonSVG = `
<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-tool" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <path d="M7 10h3v-3l-3.5 -3.5a6 6 0 0 1 8 8l6 6a2 2 0 0 1 -3 3l-6-6a6 6 0 0 1 -8 -8l3.5 3.5" />
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
    :host([mode="viewing"]) {
        border: 1px solid transparent;
    }
    :host(:not([mode="drawing"])) > #tool-buttons {
        display: none;
    }
</style>
<canvas width="500" height="300"></canvas >
<div id="tool-buttons">
<slot></slot>
</div>
`;

class DrawingView extends PartView {
    constructor(){
        super();

        // Setup shadow dom
        this.template = document.createElement('template');
        this.template.innerHTML = templateString;
        this.shadow = this.attachShadow({mode: 'open'});
        this.shadow.append(
            this.template.content.cloneNode(true)
        );

        this.isCurrentlyDrawing = false;

        // Bind component methods
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.onHaloResize = this.onHaloResize.bind(this);
        this.onClick = this.onClick.bind(this);
        this.initCustomHaloButton = this.initCustomHaloButton.bind(this);
        this.toggleMode = this.toggleMode.bind(this);
        this.afterDrawAction = this.afterDrawAction.bind(this);
        this.restoreImageFromModel = this.restoreImageFromModel.bind(this);
        this.setupPropHandlers = this.setupPropHandlers.bind(this);
        this.modeChanged = this.modeChanged.bind(this);

        // Setup prop handlers
        this.setupPropHandlers();
    }

    setupPropHandlers(){
        this.onPropChange('mode', this.modeChanged);
    }

    modeChanged(value){
        this.setAttribute('mode', value);
    }

    afterConnected(){
        this.canvas = this.shadow.querySelector('canvas');
        this.canvas.addEventListener('mouseup', this.onMouseUp);
        this.canvas.addEventListener('mousedown', this.onMouseDown);
        this.addEventListener('click', this.onClick);

        // Set and store the drawing context
        this.drawingContext = this.canvas.getContext('2d');

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

        let colorPickerChild = this.querySelector('color-picker-tool');
        if(!colorPickerChild){
            let newColorPicker = document.createElement('color-picker-tool');
            this.append(newColorPicker);
        }

        if(!this.haloButton){
            this.initCustomHaloButton();
        }
    }

    afterDisconnected(){
        this.canvas.removeEventListener('mouseup', this.onMouseUp);
        this.canvas.removeEventListener('mousedown', this.onMouseDown);
        this.removeEventListener('click', this.onClick);
    }

    onMouseDown(event){
        if(event.shiftKey || !this.inDrawingMode){
            return;
        }
        this.activeTool = this.querySelector('[role="tool"][active="true"]');
        if(!this.activeTool){
            return;
        }
        this.isCurrentlyDrawing = true;
        let canvas = this.shadow.querySelector('canvas');
        canvas.addEventListener('mousemove', this.onMouseMove);
        canvas.addEventListener('mouseleave', this.onMouseLeave);
        this.activeTool.start(event.offsetX, event.offsetY);
    }

    onMouseMove(event){
        if(event.shiftKey){
            return;
        }
        if(this.activeTool && this.inDrawingMode){
            this.activeTool.onMove(
                event.offsetX,
                event.offsetY
            );
        }
    }

    onMouseUp(event){
        if(event.shiftKey){
            return;
        }
        if(this.activeTool && this.inDrawingMode && this.isCurrentlyDrawing){
            this.activeTool.end(event.offsetX, event.offsetY);
            this.afterDrawAction();
        }
        this.isCurrentlyDrawing = false;
        let canvas = this.shadow.querySelector('canvas');
        canvas.removeEventListener('mousemove', this.onMouseMove);
        canvas.removeEventListener('mouseleave', this.onMouseLeave);
    }


    onMouseLeave(event){
        // If this is triggered, we left the area
        // while drawing. So call the activeTool's
        // end method
        this.activeTool.end(
            event.offsetX,
            event.offsetY
        );
        this.isCurrentlyDrawing = false;
        this.afterDrawAction();
        this.canvas.removeEventListener('mouseleave', this.onMouseLeave);
        this.canvas.removeEventListener('mousemove', this.onMouseMove);
    }

    onClick(event){
        if(event.button == 0){
            // if the shift key is pressed we toggle the halo
            if(event.shiftKey){
                event.preventDefault();
                event.stopPropagation();
                if(this.hasOpenHalo){
                    this.closeHalo();
                } else {
                    this.openHalo();
                }
            }
        }
    }

    onHaloResize(movementX, movementY){
        let canvas = this.shadowRoot.querySelector('canvas');
        let currentImage = this.model.partProperties.getPropertyNamed(
            this.model,
            'image'
        );
        canvas.width = canvas.width + movementX;
        canvas.height = canvas.height + movementY;
        this.restoreImageFromModel(currentImage);
    }

    afterDrawAction(){
        // Encode canvas contents as base64 png
        // and set to model's image property
        let canvas = this.shadowRoot.querySelector('canvas');
        this.model.partProperties.setPropertyNamed(
            this.model,
            'image',
            canvas.toDataURL()
        );
        //this.setAttribute("mode", "");
    }

    restoreImageFromModel(base64ImageData){
        // Clear and draw the image to restore to
        // the canvas
        if(base64ImageData){
            let canvas = this.shadowRoot.querySelector('canvas');
            let context = canvas.getContext('2d');
            let img = new Image();
            img.onload = function(){
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(img, 0, 0);
            };
            img.src = base64ImageData;
        }
    }

    widthChanged(value, _){
        if(this.canvas.width != value){
            this.canvas.setAttribute('width', value);

            // Because we resized, we need to redraw the
            // underlying image cached in the model
            let modelImage = this.model.partProperties.getPropertyNamed(
                this.model,
                'image'
            );
            this.restoreImageFromModel(modelImage);
        }
    }

    heightChanged(value, partId){
        if(this.canvas.height != value){
            this.canvas.setAttribute('height', value);

            // Because we resized, we need to redraw the
            // underlying image cached in the model
            let modelImage = this.model.partProperties.getPropertyNamed(
                this.model,
                'image'
            );
            this.restoreImageFromModel(modelImage);
        }
    }

    initCustomHaloButton(){
        this.haloButton = document.createElement('div');
        this.haloButton.id = "halo-drawing-toggle-mode";
        this.haloButton.classList.add('halo-button');
        this.haloButton.innerHTML = haloButtonSVG;
        this.haloButton.style.marginRight = "6px";
        this.haloButton.setAttribute('slot', 'bottom-row');
        this.haloButton.setAttribute('title', 'Toggle drawing tools');
        this.haloButton.addEventListener('click', this.toggleMode);
    }

    openHalo(){
        // Override default. Here we add a custom button
        // when showing.
        let foundHalo = this.shadowRoot.querySelector('st-halo');
        if(!foundHalo){
            foundHalo = document.createElement('st-halo');
            this.shadowRoot.appendChild(foundHalo);
        }
        foundHalo.append(this.haloButton);
    }

    toggleMode(){
        let currentMode = this.getAttribute('mode');
        let nextMode = 'viewing'; // By default, set to viewing
        let isEmpty = (!currentMode || currentMode == undefined || currentMode == "");
        if(currentMode == 'viewing' || isEmpty){
            nextMode = 'drawing';
        }
        this.model.partProperties.setPropertyNamed(
            this.model,
            'mode',
            nextMode
        );
    }

    get inDrawingMode(){
        if(!this.model){
            return false;
        }
        let mode = this.getAttribute('mode');
        if(mode == 'drawing'){
            return true;
        }
        return false;
    }

    // attributeChangedCallback(name, oldVal, newVal){
    //     if(name == 'mode'){
    //         debugger;
    //     }
    // }

    // static get observedAttributes(){
    //     return [ 'mode' ];
    // }
};

export {
    DrawingView,
    DrawingView as default
};
