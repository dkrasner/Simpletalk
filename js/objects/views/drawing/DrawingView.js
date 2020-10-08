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
    :host([mode="viewing"]) > #tool-buttons {
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

        // Bind component methods
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onHaloResize = this.onHaloResize.bind(this);
        this.onClick = this.onClick.bind(this);
        this.afterDrawAction = this.afterDrawAction.bind(this);
        this.restoreImageFromModel = this.restoreImageFromModel.bind(this);
        this.setPropsFromModel = this.setPropsFromModel.bind(this);
    }

    connectedCallback(){
        if(this.isConnected){
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

            if(this.model){
                this.setPropsFromModel();
            }
        }
    }

    disconnectedCallback(){
        this.canvas.removeEventListener('mouseup', this.onMouseUp);
        this.canvas.removeEventListener('mousedown', this.onMouseDown);
        this.removeEventListener('click', this.onClick);
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
            this.afterDrawAction();
        }
        let canvas = this.shadow.querySelector('canvas');
        canvas.removeEventListener('mousemove', this.onMouseMove);
    }

    onClick(event){
        if(event.button == 0 && event.shiftKey){
            event.preventDefault();
            event.stopPropagation();
            if(this.hasOpenHalo){
                this.closeHalo();
            } else {
                this.openHalo();
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

    receiveMessage(aMessage){
        if(aMessage.type == 'propertyChanged'){
            switch(aMessage.propertyName){
            case 'image':
                console.log('Image property changed in view');
                this.restoreImageFromModel(aMessage.value);
                break;
            }
        }
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

    setPropsFromModel(){
        let canvasChanged = false;
        let modelWidth = this.model.partProperties.getPropertyNamed(
            this.model,
            'width'
        );
        let modelHeight = this.model.partProperties.getPropertyNamed(
            this.model,
            'height'
        );
        if(this.canvas.width != modelWidth){
            this.canvas.setAttribute('width', modelWidth);
            canvasChanged = true;
        }
        if(this.canvas.height != modelHeight){
            this.canvas.setAttribute('height', modelHeight);
            canvasChanged = true;
        }
        let mode = this.model.partProperties.getPropertyNamed(
            this.model,
            'mode'
        );
        this.setAttribute('mode', mode);


        // If the canvas dimensions were adjusted, we need to
        // redraw the image to the canvas
        if(canvasChanged){
            let modelImage = this.model.partProperties.getPropertyNamed(
                this.model,
                'image'
            );
            this.restoreImageFromModel(modelImage);
        }
    }

    get inDrawingMode(){
        if(!this.model){
            return false;
        }
        let mode = this.model.partProperties.getPropertyNamed(
            this.model,
            'mode'
        );
        if(mode == 'drawing'){
            return true;
        }
        return false;
    }
};

export {
    DrawingView,
    DrawingView as default
};
