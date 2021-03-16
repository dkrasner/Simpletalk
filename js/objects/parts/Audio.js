import {Part} from './Part.js';

class Audio extends Part {
    constructor(owner, src, name) {
        super(owner);

        // Properties
        this.partProperties.newBasicProp(
            "src",
            null
        );

        this.src = null;
        let myName = name || `Audio ${this.id}`;
        this.partProperties.setPropertyNamed(
            this,
            'name',
            name
        );

        this.partProperties.newBasicProp(
            "play",
            false
        );

        this.partProperties.newBasicProp(
            "load",
            null
        );


        // Private command handlers
        this.setPrivateCommandHandler("loadAudioFromSource", this.loadAudioFromSource);
        this.setPrivateCommandHandler("play", () => {this.play(true);});
        this.setPrivateCommandHandler("pause", () => {this.play(false);});
        this.setPrivateCommandHandler("stop", this.stop);

        // Bind component methods
        this.loadAudioFromSource = this.loadAudioFromSource.bind(this);
        this.play = this.play.bind(this);
        this.stop = this.stop.bind(this);


        // load the src if provided
        if(src){
            this.partProperties.setPropertyNamed(this, "src", url);
        }
    }

    get type(){
        return 'audio';
    }

    loadAudioFromSource(senders, sourceUrl){
        this.partProperties.setPropertyNamed(this, "src", sourceUrl);
    }

    play(value){
        this.partProperties.setPropertyNamed(this, "play", value);
    }

    stop(){
        this.partProperties.setPropertyNamed(this, "load", true);
        this.partProperties.setPropertyNamed(this, "play", false);
    }
};

export {
    Audio,
    Audio as default
};
