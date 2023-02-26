import {Part} from './Part.js';
import {
    addBasicStyleProps,
    addPositioningStyleProps,
    addTextStyleProps
} from '../utils/styleProperties.js';

class Video extends Part {
    constructor(owner, src) {
        super(owner);

        // Properties
        this.partProperties.newBasicProp(
            "src",
            null
        );

        this.src = null;

        this.partProperties.newBasicProp(
            'readyState',
            "HAVE_NOTHING"
        );

        this.partProperties.newBasicProp(
            "play",
            false
        );

        this.partProperties.newBasicProp(
            "stop",
            null
        );

        this.partProperties.newBasicProp(
            "autoplay",
            false
        );

        this.partProperties.newBasicProp(
            "controls",
            true
        );

        // Private command handlers
        this.setPrivateCommandHandler("loadVideoFromSource", this.loadVideoFromSource);
        this.setPrivateCommandHandler("loadVideoFromFile", this.loadVideoFromFile);
        this.setPrivateCommandHandler("play", () => {this.play(true);});
        this.setPrivateCommandHandler("pause", () => {this.play(false);});
        this.setPrivateCommandHandler("stop", this.stop);

        // Bind component methods
        this.loadVideoFromSource = this.loadVideoFromSource.bind(this);
        this.loadVideoFromFile = this.loadVideoFromFile.bind(this);
        this.play = this.play.bind(this);
        this.stop = this.stop.bind(this);


        // load the src if provided
        if(src){
            this.partProperties.setPropertyNamed(this, "src", url);
        }
        // Style properties
        addBasicStyleProps(this);
        addPositioningStyleProps(this);
        addTextStyleProps(this);
        this.setupStyleProperties();
        this.partProperties.setPropertyNamed(
            this,
            'background-transparency',
            0,
            true, // notify
            true // set default
        );
        ["right", "left", "top", "bottom"].forEach((side) => {
            this.partProperties.setPropertyNamed(
                this,
                `border-${side}-width`,
                1,
                true, // notify
                true // set default
            );
        });
    }

    get type(){
        return 'video';
    }

    loadVideoFromSource(senders, sourceUrl){
        this.partProperties.setPropertyNamed(this, "src", sourceUrl);
    }

    loadVideoFromFile(senders){
        let filePicker = document.createElement('input');
        filePicker.type = 'file';
        filePicker.setAttribute('accept', 'video/*');
        filePicker.style.display = 'none';
        filePicker.addEventListener('change', (event) => {
            const URL = window.URL || window.webkitURL;
            const fileUrl = URL.createObjectURL(filePicker.files[0]);
            this.partProperties.setPropertyNamed(this, "src", fileUrl);
            filePicker.remove();
        });
        document.body.append(filePicker);
        filePicker.click();
    }

    play(value){
        this.partProperties.setPropertyNamed(this, "play", value);
        this.partProperties.setPropertyNamed(this, "stop", false);
    }

    stop(){
        this.partProperties.setPropertyNamed(this, "play", false);
        this.partProperties.setPropertyNamed(this, "stop", true);
    }
};

export {
    Video,
    Video as default
};
