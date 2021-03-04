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


        // Private command handlers
        this.setPrivateCommandHandler("loadAudioFromSource", this.loadAudioFromSource);

        // Bind component methods
        this.loadAudioFromSource = this.loadAudioFromSource.bind(this);

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
};

export {
    Audio,
    Audio as default
};
