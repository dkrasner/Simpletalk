import PartView from './PartView.js';


const templateString = `
<audio class="hidden">
<style>
.hidden {
    display: none;
}
</style>
`;

// HTMLMediaElementStates copied from
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState
const mediaStates = {
    0: "HAVE_NOTHING",
    1: "HAVE_METADATA",
    2: "HAVE_CURRENT_DATA",
    3: "HAVE_FUTURE_DATA",
    4: "HAVE_ENOUGH_DATA"
};

class AudioView extends PartView {
    constructor(){
        super();

        // Setup template and shadow dom
        this.template = document.createElement('template');
        this.template.innerHTML = templateString;
        this._shadowRoot = this.attachShadow({mode: 'open'});
        this._shadowRoot.appendChild(this.template.content.cloneNode(true));

        // Bind component methods
        this.play = this.play.bind(this);
        this.pause = this.pause.bind(this);
    }

    afterModelSet(){
        // prop changes
        this.onPropChange("play", (value) => {
            if(value === true){
                this.play();
            } else if (value === false){
                this.pause();
            }
        });
        this.onPropChange("load", (value) => {
            if(value === true){
                // audio.load() reloads to the beginning
                this._shadowRoot.querySelector("audio").load();
            }
        });
        this.onPropChange("src", (url) => {
            try{
                // resource load is auto-loaded by the <audio> element
                this._shadowRoot.querySelector("audio").src = url;
            } catch(error){
                let errorMsg = {
                    type: "error",
                    name: "ResourceNotFound",
                    resourceType: "audio",
                    partId: this.model.id,
                    details: {source: url, type: "url"}

                };
                this.sendMessage({msg}, this.model);
            }
        });
    }

    play(){
        // first make sure that the resource is ready
        let audio = this._shadowRoot.querySelector("audio");
        if(audio.readyState > 2){
            audio.play();
        } else {
            alert(`audio is not ready; current state: ${audio.readyState}, ${mediaStates[audio.readyState]}`);
        }
    }

    pause(){
        this._shadowRoot.querySelector("audio").pause();
    }

    // re-loads the media, setting it back to the beggning
    stop(){
        this._shadowRoot.querySelector("audio").load();
    }
    afterConnected(){
    }

    afterDisconnected(){
    }

};

export {
    AudioView,
    AudioView as default
};
