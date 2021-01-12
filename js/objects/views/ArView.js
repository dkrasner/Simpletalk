import PartView from './PartView.js';

const templateString = `
    <video id="video" width="640" height="480" autoplay>
    </video>
`;

class ArView extends PartView {
    constructor(){
        super();
        this.defaultWidth = "640px";
        this.defaultHeight = "480px";

        this.template = document.createElement('template');
        this.template.innerHTML = templateString;
        this._shadowRoot = this.attachShadow({mode: 'open'});
        this._shadowRoot.appendChild(this.template.content.cloneNode(true));

        // State
        this.state = {
            "moving": false
        };
        // Click stuff
        this.onClick = this.onClick.bind(this);
        this.onDragstart = this.onDragstart.bind(this);
        this.onDragstart = this.onDragstart.bind(this);
        this.onHaloResize = this.onHaloResize.bind(this);
        this.startVideo = this.startVideo.bind(this);
    }

    afterModelSet() {
        // prop changes
        this.onPropChange("src", (svgUri) => {
            this.updateSrc(svgUri);
        });
        this.onPropChange("draggable", (value) => {
            this.setAttribute('draggable', value);
        });
    }

    afterConnected(){
        //Atributes
        this.setAttribute('draggable', true);
        // Events
        this['onclick'] = this.onClick;
        this['ondragstart'] = this.onDragstart;
        // Start the video
        this.startVideo();
    }

    afterDisconnected(){
        this['onclick'] = null;
        this['ondragstart'] = null;
    }

    onClick(event){
        if(event.button == 0){
            if(event.shiftKey){
                // prevent triggering the on click message
                event.preventDefault();
                if(this.hasOpenHalo){
                    this.closeHalo();
                } else {
                    this.openHalo();
                }
            } else if(!this.hasOpenHalo){
                // Send the click command message to self
                this.model.sendMessage({
                    type: 'command',
                    commandName: 'click',
                    args: [],
                    shouldIgnore: true // Should ignore if System DNU
                }, this.model);
            }
        }
    }

    onDragstart(event){
        if(this.hasOpenHalo){
            event.stopPropagation();
            event.preventDefault();
        }
        // TODO this is janky; should we convert the svg to
        // image/png? or have a png copy of every svg
        let img = new Image()
        img.src = '../../../images/svg.png';
        event.dataTransfer.setDragImage(img, 10, 10);
        event.dataTransfer.setData("text/plain", this.model.id);
        event.dataTransfer.dropEffect = "copy";
    };

    onHaloResize(movementX, movementY){
        let svg = this.shadowRoot.children[0];
        let rect = svg.getBoundingClientRect();
        let newWidth = event.movementX + rect.width;
        let newHeight = event.movementY + rect.height;
        svg.style.width = `${newWidth}px`;
        svg.style.height = `${newHeight}px`;
    }

    startVideo(){
        let video = this._shadowRoot.querySelector('video');
        if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
                video.srcObject = stream;
                video.play();
            });
        }
    }
};

export {
    ArView,
    ArView as default
};
