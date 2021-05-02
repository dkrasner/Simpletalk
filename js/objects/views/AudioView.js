import PartView from './PartView.js';

const linkIcon = `
<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-link" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <path d="M10 14a3.5 3.5 0 0 0 5 0l4 -4a3.5 3.5 0 0 0 -5 -5l-.5 .5" />
  <path d="M14 10a3.5 3.5 0 0 0 -5 0l-4 4a3.5 3.5 0 0 0 5 5l.5 -.5" />
</svg>
`;

const templateString = `
<style>
:host {
    box-sizing: border-box;
    display: block;
    position: absolute;
    padding: 1px;
    user-select: none;
}

.wrapper{
    width: 100%;
    height: 100%;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
}
</style>
<div class="wrapper">
    <audio></audio>
    <span class="name"></span>
    <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-music" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <circle cx="6" cy="17" r="3"></circle>
    <circle cx="16" cy="17" r="3"></circle>
    <polyline points="9 17 9 4 19 4 19 17"></polyline>
    <line x1="9" y1="8" x2="19" y2="8"></line>
    </svg>
</div>
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
        this.onClick = this.onClick.bind(this);
        this.initCustomHaloButton = this.initCustomHaloButton.bind(this);
        this.updateAudioLink = this.updateAudioLink.bind(this);
        this.play = this.play.bind(this);
        this.pause = this.pause.bind(this);
    }

    afterConnected(){
        let audio = this._shadowRoot.querySelector("audio");
        audio.addEventListener('loadeddata', () => {
            let stateCode = audio.readyState;
            this.model.partProperties.setPropertyNamed(
                this.model,
                "readyState",
                mediaStates[stateCode]
            );
        });

        if(!this.haloButton){
            this.initCustomHaloButton();
        }
    }

    afterDisconnected(){
    }

    afterModelSet(){
        let nameSpan = this._shadowRoot.querySelector(".name");
        nameSpan.innerText = this.model.partProperties.getPropertyNamed(this.model, "name");
        this.model.partProperties.setPropertyNamed(
            this.model,
            "readyState",
           "HAVE_NOTHING" 
        );
        let audio = this._shadowRoot.querySelector("audio");
        let src = this.model.partProperties.getPropertyNamed(this.model, "src");
        if(src){
            audio.src = src;
        }
        // prop changes
        this.onPropChange("name", (value) => {
            nameSpan.innerText = value;
        });
        this.onPropChange("readyState", (value) => {
            let borderColor = "red";
            if(value == "HAVE_FUTURE_DATA" || value == "HAVE_ENOUGH_DATA"){
                borderColor = "green";
            };
            ["right", "left", "top", "bottom"].forEach((side) => {
                this.model.partProperties.setPropertyNamed(this.model, `border-${side}-color`, borderColor);
            });
        });
        this.onPropChange("play", (value) => {
            if(value === true){
                this.play();
            } else if (value === false){
                this.pause();
            }
        });
        this.onPropChange("stop", (value) => {
            if(value === true){
                audio.currentTime = 0;
            }
        });
        this.onPropChange("src", (url) => {
            try{
                // resource load is auto-loaded by the <audio> element
                audio.src = url;
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
        let readyState = this.model.partProperties.getPropertyNamed(this.model, "readyState");
        if(readyState == "HAVE_FUTURE_DATA" || readyState == "HAVE_ENOUGH_DATA"){
            audio.play();
        } else {
            alert(`audio is not ready; current state: ${readyState}`);
        }
    }

    pause(){
        this._shadowRoot.querySelector("audio").pause();
    }

    // re-loads the media, setting it back to the beggning
    stop(){
        this._shadowRoot.querySelector("audio").load();
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

    openHalo(){
        // Override default. Here we add a custom button
        // when showing.
        let foundHalo = this.shadowRoot.querySelector('st-halo');
        if(!foundHalo){
            foundHalo = document.createElement('st-halo');
            this.shadowRoot.appendChild(foundHalo);
        }
        foundHalo.append(this.haloButton);
    }

    initCustomHaloButton(){
        this.haloButton = document.createElement('div');
        this.haloButton.id = 'halo-audio-link';
        this.haloButton.classList.add('halo-button');
        this.haloButton.innerHTML = linkIcon;
        this.haloButton.style.marginTop = "6px";
        this.haloButton.setAttribute('slot', 'right-column');
        this.haloButton.setAttribute('title', 'Edit link for audio source');
        this.haloButton.addEventListener('click', this.updateAudioLink);
    }

    updateAudioLink(event){
        // Tells the model to update its
        // src link for the audio
        let currentSrc = this.model.partProperties.getPropertyNamed(
            this.model,
            'src'
        );
        let result = window.prompt("Edit URL for audio:", currentSrc);
        if(result && result !== '' && result !== currentSrc){
            this.sendMessage(
                {
                    type: 'command',
                    commandName: 'loadAudioFromSource',
                    args: [ result ]
                },
                this.model
            );
        }
    }


};

export {
    AudioView,
    AudioView as default
};
