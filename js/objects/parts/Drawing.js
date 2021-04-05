/**
 * Basic User Drawing Part
 */
import {Part} from './Part.js';
import {
    addBasicStyleProps,
    addPositioningStyleProps
} from '../utils/styleProperties.js';

class Drawing extends Part {
    constructor(owner){
        super(owner);

        // Set new properties for this
        // part type
        this.partProperties.newBasicProp(
            'image',
            null
        );
        this.partProperties.newBasicProp(
            'mode',
            'drawing'
        );
        // Style
        addBasicStyleProps(this);
        addPositioningStyleProps(this);
        this.setupStyleProperties();
        // part specific default style properties
        this.partProperties.setPropertyNamed(
            this,
            'background-transparency',
            0
        );

        // We are using a distinct show-border
        // property to deal with being able to see
        // a drawing that is empty
        this.partProperties.newBasicProp(
            'show-border',
            true
        );

        // When drawing from a script/commands,
        // we will use this as the open canvas
        // whose image bytes will be set to the
        // image property
        this.activeCanvas = null;

        // Set up the drawing commands
        this.setupDrawingCommands();


        // Bind component methods
        this.setupDrawingCommands = this.setupDrawingCommands.bind(this);
        this.stroke = this.stroke.bind(this);
        this.moveTo = this.moveTo.bind(this);
        this.lineTo = this.lineTo.bind(this);
        this.beginDraw = this.beginDraw.bind(this);
        this.endDraw = this.endDraw.bind(this);
        this.clear = this.clear.bind(this);
        this.coordsFromString = this.coordsFromString.bind(this);
    }

    get type(){
        return 'drawing';
    }

    setupDrawingCommands(){
        this.setPrivateCommandHandler('lineTo', (senders, ...args) => {
            this.lineTo(...args);
        });
        this.setPrivateCommandHandler('moveTo', (senders, ...args) => {
            this.moveTo(...args);
        });
        this.setPrivateCommandHandler('beginDraw', (senders, ...args) => {
            this.beginDraw(...args);
        });
        this.setPrivateCommandHandler('finishDraw', (senders, ...args) => {
            this.endDraw(...args);
        });
        this.setPrivateCommandHandler('stroke', (senders, ...args) => {
            this.stroke(...args);
        });
        this.setPrivateCommandHandler('clear', (senders, ...args) => {
            this.clear(...args);
        });
    }

    /* Scriptable Drawing Commands */
    stroke(){
        if(this.isDrawing){
            // Hard-coded. Get from props
            // and link to views
            this.activeContext.strokeWidth = 10;
            this.activeContext.stroke();
        }
    }
    moveTo(x, y){
        if(this.isDrawing){
            //let coords = this.coordsFromString(coordPair);
            this.activeContext.moveTo(
                x,
                y
            );
        }
    }

    lineTo(x, y){
        if(this.isDrawing){
            //let coords = this.coordsFromString(coordPair);
            this.activeContext.lineTo(
                x,
                y
            );
        }
    }

    beginDraw(){
        if(this.isDrawing){
            return;
        }
        this.isDrawing = true;
        this.activeCanvas = document.createElement('canvas');
        this.activeCanvas.width = this.partProperties.getPropertyNamed(
            this,
            'width'
        );
        this.activeCanvas.height = this.partProperties.getPropertyNamed(
            this,
            'height'
        );
        this.activeContext = this.activeCanvas.getContext('2d');

        // If there is currently image data set to the
        // image part property, we need to draw that image
        // onto the canvas first.
        let currentImage = this.partProperties.getPropertyNamed(
            this,
            'image'
        );
        if(currentImage){
            let img = new Image();
            img.onload = () => {
                this.activeContext.drawImage(img, 0, 0);
            };
            img.src = currentImage;
        }

        // Begin a drawing path
        this.activeContext.beginPath();
    }

    endDraw(){
        if(this.isDrawing){
            this.activeContext.closePath();
            this.activeContext.stroke();

            // Update the image property to be the
            // serialized version of the current image.
            // This will update any subscribed views
            this.partProperties.setPropertyNamed(
                this,
                'image',
                this.activeCanvas.toDataURL()
            );
            this.activeCanvas = null;
            this.activeContext = null;
            this.isDrawing = false;
        }
    }

    clear(){
        if(this.isDrawing){
            return;
        }
        this.activeCanvas = document.createElement('canvas');
        this.activeCanvas.width = this.partProperties.getPropertyNamed(
            this,
            'width'
        );
        this.activeCanvas.height = this.partProperties.getPropertyNamed(
            this,
            'height'
        );
        this.activeContext = this.activeCanvas.getContext('2d');
        this.partProperties.setPropertyNamed(
            this,
            'image',
            this.activeCanvas.toDataURL()
        );
        this.activeCanvas = null;
        this.activeContext = null;
    }

    /* Utility Methods for Scriptable Drawing */
    coordsFromString(coordString){
        let pair = coordString.split(",");
        let x = parseInt(pair[0]);
        let y = parseInt(pair[1]);
        return {x, y};
    }
};

export {
    Drawing,
    Drawing as default
};
