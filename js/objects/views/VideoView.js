import PartView from './PartView.js';

const linkIcon = `
<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-link" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <path d="M10 14a3.5 3.5 0 0 0 5 0l4 -4a3.5 3.5 0 0 0 -5 -5l-.5 .5" />
  <path d="M14 10a3.5 3.5 0 0 0 -5 0l-4 4a3.5 3.5 0 0 0 5 5l.5 -.5" />
</svg>
`;

const fileIcon = `
<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-file-upload" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
   <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
   <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
   <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"></path>
   <path d="M12 11v6"></path>
   <path d="M9.5 13.5l2.5 -2.5l2.5 2.5"></path>
</svg>`;

const templateString = `
<style>
:host {
    box-sizing: border-box;
    display: block;
    position: absolute;
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

.hidden {
    display: none;
}

video {
    width: 100%;
    height: auto;
    display: block;
}

.currently-wrapped {
    width: 100%;
    height: 100%;
}

.name {
    font-size: 24px;
    font-weight: bold;
}

}
</style>
<div class="wrapper">
    <div id="wrapped-icon" class="currently-wrapped">
        <div class="name"></div>
        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-video" width="100" height="100" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <path d="M15 10l4.553 -2.276a1 1 0 0 1 1.447 .894v6.764a1 1 0 0 1 -1.447 .894l-4.553 -2.276v-4z"></path>
        <path d="M3 6m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z"></path>
        </svg>
    </div>
    <video id="wrapped-video" class="hidden currently-wrapped"></video>
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

class VideoView extends PartView {
    constructor(){
        super();

        this.customHaloButtons = [];

        // Setup template and shadow dom
        this.template = document.createElement('template');
        this.template.innerHTML = templateString;
        this._shadowRoot = this.attachShadow({mode: 'open'});
        this._shadowRoot.appendChild(this.template.content.cloneNode(true));

        // Bind component methods
        this.onClick = this.onClick.bind(this);
        this.initCustomHaloButtons = this.initCustomHaloButtons.bind(this);
        this.updateVideoLink = this.updateVideoLink.bind(this);
        this.play = this.play.bind(this);
        this.pause = this.pause.bind(this);
    }

    afterConnected(){
        let video = this._shadowRoot.querySelector("video");
        // make sure that lensed (nav) elements are not playing with sound!
        if(this.isLensed){
            video.muted = true;
        }
        video.addEventListener('loadeddata', () => {
            let stateCode = video.readyState;
            this.model.partProperties.setPropertyNamed(
                this.model,
                "readyState",
                mediaStates[stateCode]
            );
        });

        video.addEventListener('play', () => {
            this.model.partProperties.setPropertyNamed(
                this.model,
                "play",
                true,
            );
            this.model.partProperties.setPropertyNamed(
                this.model,
                "stop",
                false,
            );
        });

        video.addEventListener('pause', () => {
            this.model.partProperties.setPropertyNamed(
                this.model,
                "play",
                false,
            );
        });

        if (!this.customHaloButtons.length) {
            this.initCustomHaloButtons();
        }
    }

    afterDisconnected(){
    }

    afterModelSet(){
        // setup initial prop values
        const nameDiv = this._shadowRoot.querySelector(".name");
        nameDiv.innerText = this.model.partProperties.getPropertyNamed(this.model, "name");
        this.model.partProperties.setPropertyNamed(
            this.model,
            "readyState",
           "HAVE_NOTHING"
        );
        const video = this._shadowRoot.querySelector("video");
        const src = this.model.partProperties.getPropertyNamed(this.model, "src");
        if(src){
            video.src = src;
        }
        const autoplay = this.model.partProperties.getPropertyNamed(this.model, "autoplay");
        if (autoplay) {
            video.setAttribute("autoplay", "")
        }
        const controls = this.model.partProperties.getPropertyNamed(this.model, "controls");
        if (controls) {
            video.setAttribute("controls", "")
        }
        const loop = this.model.partProperties.getPropertyNamed(this.model, "loop");
        if (loop) {
            video.setAttribute("loop", "")
        }
        const muted = this.model.partProperties.getPropertyNamed(this.model, "muted");
        if (muted) {
            video.muted = true;
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
                // only play if paused, to avoid double-play
                if(video.paused){
                    this.play();
                }
            } else if (value === false){
                this.pause();
            }
        });
        this.onPropChange("stop", (value) => {
            if(value === true){
                video.currentTime = 0;
            }
        });
        this.onPropChange("autoplay", (value) => {
            if (value === true) {
                video.setAttribute("autoplay", "")
            } else if (value === false) {
                video.removeAttribute("autoplay")
            }
        });
        this.onPropChange("controls", (value) => {
            if (value === true) {
                video.setAttribute("controls", "")
            } else if (value === false) {
                video.removeAttribute("controls")
            }
        });
        this.onPropChange("loop", (value) => {
            if (value === true) {
                video.setAttribute("loop", "")
            } else if (value === false) {
                video.removeAttribute("loop")
            }
        });
        this.onPropChange("muted", (value) => {
            // lensed (nav) elements should never unmute
            if (!this.isLensed){
                if (value === true) {
                    video.muted = true;
                } else if (value === false) {
                    video.muted = false;
                }
            }
        });
        this.onPropChange("src", (url) => {
            const iconEl = this._shadowRoot.getElementById('wrapped-icon');
            const videoEl = this._shadowRoot.getElementById('wrapped-video');
            try{
                // resource load is auto-loaded by the <video> element
                video.src = url;
                iconEl.classList.add("hidden");
                videoEl.classList.remove("hidden");
            } catch(error){
                videoEl.classList.add("hidden");
                iconEl.classList.remove("hidden");
                let errorMsg = {
                    type: "error",
                    name: "ResourceNotFound",
                    resourceType: "video",
                    partId: this.model.id,
                    details: {source: url, type: "url"}

                };
                this.model.sendMessage({errorMsg}, this.model);
            }
        });
    }

    play(){
        // first make sure that the resource is ready
        let video = this._shadowRoot.querySelector("video");
        let readyState = this.model.partProperties.getPropertyNamed(this.model, "readyState");
        if(readyState == "HAVE_FUTURE_DATA" || readyState == "HAVE_ENOUGH_DATA"){
            video.play();
        } else {
            alert(`video is not ready; current state: ${readyState}`);
        }
    }

    pause(){
        this._shadowRoot.querySelector("video").pause();
    }

    // re-loads the media, setting it back to the beggning
    stop(){
        this._shadowRoot.querySelector("video").load();
    }

    onClick(event){
        if(event.button == 0){
            if(event.shiftKey){
                // prevent triggering the on click message
                event.preventDefault();
                if(this.hasOpenHalo){
                    this.model.partProperties.setPropertyNamed(this.model, "halo-open", false);
                } else {
                    this.model.partProperties.setPropertyNamed(this.model, "halo-open", true);
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
        this.customHaloButtons.forEach((b) => {
            foundHalo.append(b);
        })
    }

    initCustomHaloButtons(){
        const linkButton = document.createElement('div');
        linkButton.id = 'halo-video-link';
        linkButton.classList.add('halo-button');
        linkButton.innerHTML = linkIcon;
        linkButton.style.marginTop = "6px";
        linkButton.setAttribute('slot', 'right-column');
        linkButton.setAttribute('title', 'Edit link for video source');
        linkButton.addEventListener('click', this.updateVideoLink);
        const fileButton = document.createElement('div');
        fileButton.id = 'halo-video-file';
        fileButton.classList.add('halo-button');
        fileButton.innerHTML = fileIcon;
        fileButton.style.marginTop = "6px";
        fileButton.setAttribute('slot', 'right-column');
        fileButton.setAttribute('title', 'Load video file');
        fileButton.addEventListener('click', this.model.loadVideoFromFile);
        this.customHaloButtons.push(linkButton);
        this.customHaloButtons.push(fileButton);
    }

    updateVideoLink(event){
        // Tells the model to update its
        // src link for the video
        let currentSrc = this.model.partProperties.getPropertyNamed(
            this.model,
            'src'
        );
        let result = window.prompt("Edit URL for video:", currentSrc);
        if(result && result !== '' && result !== currentSrc){
            this.sendMessage(
                {
                    type: 'command',
                    commandName: 'loadVideoFromSource',
                    args: [ result ]
                },
                this.model
            );
        }
    }


};

export {
    VideoView,
    VideoView as default
};
