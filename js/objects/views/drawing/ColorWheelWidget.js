/**
 * ColorWheelWidget
 * I am a *generic use* webcomponent representing
 * a ColorWheel selection widget.
 * I operate as a floating modal window with a
 * circular color wheel as well as a list of
 * recently selected colors.
 * I am designed to be used by any parent element.
 * I will trigger an event called 'color-change' whenever
 * a new color has been selected from within me
 */

const colorWheelTemplate = `
<style>
  :host {
    display: flex;
    position: relative;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    background-color: white;
    border: 1px solid black;
  }

  #palette-bar {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    height: 20px;
    background-color: rgba(200, 200, 200);
    width: 100%;
    box-sizing: border-box;
  }

  #palette-title {
    width: 100%;
    text-align: center;
  }

  #close-button {
    display: block;
    width: 12px;
    height: 12px;
    margin-left: 8px;
    background-color: white;
    border: 1px solid black;
  }

  #palette-content {
    flex: 1;
    display: block;
    position: relative;
  }
  #hover-color {
    display: block;
    width: 100%;
    height: 25px;
  }

  #recent-colors {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;
    padding-left: 15px;
    padding-right: 15px;
    box-sizing: border-box;
    list-style: none;
  }
  .recent-color-item {
    display: block;
    width: 26px;
    height: 26px;
    box-sizing: border-box;
    border: 1px solid rgba(200, 200, 200, 0.8);
  }

  .recent-color-item.selected {
    border: 2px solid black;
  }

</style>
<div id="palette-wrapper">
  <div id="palette-bar"><div id="close-button"></div><span id="palette-title"></span></div>
  <div id="palette-content">
    <ul id="recent-colors">
      <li class="recent-color-item selected"></li>
      <li class="recent-color-item"></li>
      <li class="recent-color-item"></li>
    </ul>
    <canvas id="color-wheel" width="150" height="150"></canvas>
    <div id="hover-color"></div>
  </div>
</div>
`;

class ColorWheelWidget extends HTMLElement {
    constructor(name){
        super();

        this.name = name;

        // Setup shadow dom and template
        this.template = document.createElement('template');
        this.template.innerHTML = colorWheelTemplate;
        this.shadow = this.attachShadow({mode: 'open'});
        this.shadow.append(
            this.template.content.cloneNode(true)
        );

        // Bind local methods
        this.onWheelMouseEnter = this.onWheelMouseEnter.bind(this);
        this.onWheelMouseLeave = this.onWheelMouseLeave.bind(this);
        this.onWheelMouseMove = this.onWheelMouseMove.bind(this);
        this.onWheelClick = this.onWheelClick.bind(this);
        this.onItemClick = this.onItemClick.bind(this);
        this.onBarMouseDown = this.onBarMouseDown.bind(this);
        this.onBarMouseUp = this.onBarMouseUp.bind(this);
        this.onBarMouseMove = this.onBarMouseMove.bind(this);
        this.onClose = this.onClose.bind(this);
        this._drawWheel = this._drawWheel.bind(this);
    }

    connectedCallback(){
        if(this.isConnected){
            this.canvas = this.shadowRoot.querySelector('canvas');
            this.bar = this.shadowRoot.getElementById('palette-bar');
            // give the widget a title if provided
            if(this.name){
                this.shadowRoot.getElementById('palette-title').innerText = this.name;
            }

            // Set events
            this.canvas.addEventListener('click', this.onWheelClick);
            this.canvas.addEventListener('mouseenter', this.onWheelMouseEnter);
            this.bar.addEventListener('mousedown', this.onBarMouseDown);
            Array.from(this.shadowRoot.querySelectorAll('.recent-color-item')).forEach(el => {
                el.addEventListener('click', this.onItemClick);
            });

            // Draw the color wheel to the canvas
            this._drawWheel();
        }
    }

    disconnectedCallback(){
        this.canvas.removeEventListener('click', this.onWheelClick);
        this.canvas.removeEventListener('mouseenter', this.onWheelMouseEnter);
        this.bar.removeEventListener('mousedown', this.onBarMouseDown);
        Array.from(this.shadowRoot.querySelector('.recent-color-item')).forEach(el => {
            el.removeEventListener('click', this.onItemClick);
        });
    }


    onWheelMouseEnter(event){
        // Cache the image data for the whole canvas
        let ctx = this.canvas.getContext('2d');
        this._cachedImageData = ctx.getImageData(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
        // Bind subsequent events
        this.canvas.addEventListener('mousemove', this.onWheelMouseMove);
        this.canvas.addEventListener('mouseleave', this.onWheelMouseLeave);
    }

    onWheelMouseLeave(event){
        this.canvas.removeEventListener('mousemove', this.onWheelMouseMove);
        this.canvas.removeEventListener('mouseleave', this.onWheelMouseLeave);
        this._cachedImageData = null;
    }

    onWheelMouseMove(event){
        let position = getPositionFromEvent(event);
        let rgb = getRGBFromImageData(
            position.x,
            position.y,
            this.canvas.width,
            this._cachedImageData.data
        );
        let hoverColorArea = this.shadowRoot.getElementById('hover-color');
        let newStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${rgb[3]})`;
        hoverColorArea.style.backgroundColor = newStyle;
    }

    onWheelClick(event){
        let position = getPositionFromEvent(event);
        let rgb = getRGBFromImageData(
            position.x,
            position.y,
            this.canvas.width,
            this._cachedImageData.data
        );
        let colorInfo = {
            r: rgb[0],
            g: rgb[1],
            b: rgb[2],
            alpha: rgb[3]
        };
        let newEvent = new CustomEvent('color-selected', {
            detail: colorInfo
        });
        this.selectedColor = colorInfo;
        this.dispatchEvent(newEvent);

        // Update the recent color swatches
        let currentSwatchSelection = this.shadowRoot.querySelector('.recent-color-item.selected');
        if(currentSwatchSelection){
            currentSwatchSelection.style.backgroundColor = `rgba(${colorInfo.r}, ${colorInfo.g}, ${colorInfo.b}, ${colorInfo.alpha})`;
            currentSwatchSelection.selectedColor = colorInfo;
        }
    }

    onItemClick(event){
        // If this element is not the currently
        // selected recent item, find the one that is
        // and toggle the selection class, then toggle
        // this item's selection class.
        if(!event.target.classList.contains('selected')){
            Array.from(this.shadowRoot.querySelectorAll('.recent-color-item.selected')).forEach(el => {
                el.classList.remove('selected');
            });
            event.target.classList.add('selected');
        }

        if(event.target.selectedColor){
            let newEvent = new CustomEvent('color-selected', {
                detail: event.target.selectedColor
            });
            this.dispatchEvent(newEvent);
        }
    }

    onBarMouseDown(event){
        document.addEventListener('mousemove', this.onBarMouseMove);
        document.addEventListener('mouseup', this.onBarMouseUp);
    }

    onBarMouseUp(event){
        document.removeEventListener('mousemove', this.onBarMouseMove);
        document.removeEventListener('mouseup', this.onBarMouseUp);
    }

    onBarMouseMove(event){
        let newTop = this.offsetTop + event.movementY;
        let newLeft = this.offsetLeft + event.movementX;
        this.style.top = `${newTop}px`;
        this.style.left = `${newLeft}px`;
    }

    onClose(event){
        this.remove();
    }

    _drawWheel(){
        let ctx = this.canvas.getContext('2d');
        drawCircle(ctx, this.canvas.width / 2);
    }
};

window.customElements.define('color-wheel', ColorWheelWidget);

/** Utility Functions **/

// This function is adapted from
// https://medium.com/@bantic/hand-coding-a-color-wheel-with-canvas-78256c9d7d43
const drawCircle = (ctx, radius) => {
    let image = ctx.createImageData(2*radius, 2*radius);
    let data = image.data;

    for (let x = -radius; x < radius; x++) {
        for (let y = -radius; y < radius; y++) {

            let [r, phi] = xy2polar(x, y);

            if (r > radius) {
                // skip all (x,y) coordinates that are outside of the circle
                continue;
            }

            let deg = rad2deg(phi);

            // Figure out the starting index of this pixel in the image data array.
            let rowLength = 2*radius;
            let adjustedX = x + radius; // convert x from [-50, 50] to [0, 100] (the coordinates of the image data array)
            let adjustedY = y + radius; // convert y from [-50, 50] to [0, 100] (the coordinates of the image data array)
            let pixelWidth = 4; // each pixel requires 4 slots in the data array
            let index = (adjustedX + (adjustedY * rowLength)) * pixelWidth;

            let hue = deg;
            let saturation = r / radius;
            let value = 1.0;

            let [red, green, blue] = hsv2rgb(hue, saturation, value);
            let alpha = 255;

            data[index] = red;
            data[index+1] = green;
            data[index+2] = blue;
            data[index+3] = alpha;
        }
    }

    ctx.putImageData(image, 0, 0);
};

// This utility function is adapted from:
// https://medium.com/@bantic/hand-coding-a-color-wheel-with-canvas-78256c9d7d43
const xy2polar = (x, y) => {
    let r = Math.sqrt(x*x + y*y);
    let phi = Math.atan2(y, x);
    return [r, phi];
};

// This utility function is adapted from:
// https://medium.com/@bantic/hand-coding-a-color-wheel-with-canvas-78256c9d7d43s
const rad2deg = (rad) => {
    return ((rad + Math.PI) / (2 * Math.PI)) * 360;
};

// This utility function is adapted from:
// https://medium.com/@bantic/hand-coding-a-color-wheel-with-canvas-78256c9d7d43
const hsv2rgb = (hue, saturation, value) => {
    let chroma = value * saturation;
    let hue1 = hue / 60;
    let x = chroma * (1- Math.abs((hue1 % 2) - 1));
    let r1, g1, b1;
    if (hue1 >= 0 && hue1 <= 1) {
        ([r1, g1, b1] = [chroma, x, 0]);
    } else if (hue1 >= 1 && hue1 <= 2) {
        ([r1, g1, b1] = [x, chroma, 0]);
    } else if (hue1 >= 2 && hue1 <= 3) {
        ([r1, g1, b1] = [0, chroma, x]);
    } else if (hue1 >= 3 && hue1 <= 4) {
        ([r1, g1, b1] = [0, x, chroma]);
    } else if (hue1 >= 4 && hue1 <= 5) {
        ([r1, g1, b1] = [x, 0, chroma]);
    } else if (hue1 >= 5 && hue1 <= 6) {
        ([r1, g1, b1] = [chroma, 0, x]);
    }

    let m = value - chroma;
    let [r,g,b] = [r1+m, g1+m, b1+m];

    // Change r,g,b values from [0,1] to [0,255]
    return [255*r,255*g,255*b];
};

const getPositionFromEvent = (event) => {
    let target = event.target;
    let offsetX = target.offsetLeft;
    let offsetY = target.offsetTop;
    let check = target.offsetParent;
    while(check){
        offsetX += check.offsetLeft;
        offsetY += check.offsetTop;
        check = check.offsetParent;
    }
    let result = {
        x: event.clientX - offsetX,
        y: event.clientY - offsetY
    };
    return result;
};

const getRGBFromImageData = (x, y, width, data) => {
    let index = (y * width + x) * 4;
    return [
        data[index], // r
        data[index + 1], // g
        data[index + 2], // b
        data[index + 3] // alpha
    ];
};

export {
    ColorWheelWidget,
    ColorWheelWidget as default
};
