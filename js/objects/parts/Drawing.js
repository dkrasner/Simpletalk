/**
 * Basic User Drawing Part
 */
import {Part} from './Part.js';

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

        // Adjust any properties as needed
        this.partProperties.setPropertyNamed(
            this,
            'width',
            250
        );
        this.partProperties.setPropertyNamed(
            this,
            'height',
            250
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
    moveTo(coordPair){
        console.log(this.activeContext, coordPair);
        if(this.isDrawing){
            let coords = this.coordsFromString(coordPair);
            this.activeContext.moveTo(
                coords.x,
                coords.y
            );
        }
    }

    lineTo(coordPair){
        if(this.isDrawing){
            let coords = this.coordsFromString(coordPair);
            this.activeContext.lineTo(
                coords.x,
                coords.y
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
