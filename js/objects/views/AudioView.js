import PartView from './PartView.js';


const templateString = `
<audio class="hidden">
<style>
.hidden {
    display: none;
}
</style>
`;

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
        this.onPropChange("src", (url) => {
            try{
                // resource load is auto-checked by the <audio> element
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
        this._shadowRoot.querySelector("audio").play();
    }

    pause(){
        this._shadowRoot.querySelector("audio").pause();
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
