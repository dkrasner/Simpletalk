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
    <span class="name"></span>
    <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-building-bridge-2" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M6 7h12a2 2 0 0 1 2 2v9a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-2a4 4 0 0 0 -8 0v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-9a2 2 0 0 1 2 -2"></path>
    </svg>
</div>
`;

class ResourceView extends PartView {
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
        this.updateResourceLink = this.updateResourceLink.bind(this);
        this.indicateReadyState = this.indicateReadyState.bind(this);
    }

    afterConnected(){
        if(!this.haloButton){
            this.initCustomHaloButton();
        }
    }

    afterDisconnected(){
    }

    afterModelSet(){
        // if the resourceName property is set then make sure it is loaded
        // TODO: i don't like this view asking the model to load!
        let resourceName = this.model.partProperties.getPropertyNamed(this.model, "resourceName");
        if(resourceName){
            this.model.loadResource([this], resourceName);
        }
        let src = this.model.partProperties.getPropertyNamed(this.model, "src");
        if(src){
            this.model.setSourceTo([this], src);
        }
        let nameSpan = this._shadowRoot.querySelector(".name");
        nameSpan.innerText = this.model.partProperties.getPropertyNamed(this.model, "name");
        let state = this.model.partProperties.getPropertyNamed(
            this.model,
            "readyState",
        );
        this.indicateReadyState(state);
        // prop changes
        this.onPropChange("name", (value) => {
            nameSpan.innerText = value;
        });
        this.onPropChange("readyState", this.indicateReadyState);
        this.onPropChange("src", (url) => {
        });
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

    indicateReadyState(value){
        let borderColor = "red";
        if(value == "fetching"){
            borderColor = "yellow";
        } else if(value == "ready"){
            borderColor = "green";
        };
        ["right", "left", "top", "bottom"].forEach((side) => {
            this.model.partProperties.setPropertyNamed(this.model, `border-${side}-color`, borderColor);
        });
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
        this.haloButton.id = 'halo-resource-link';
        this.haloButton.classList.add('halo-button');
        this.haloButton.innerHTML = linkIcon;
        this.haloButton.style.marginTop = "6px";
        this.haloButton.setAttribute('slot', 'right-column');
        this.haloButton.setAttribute('title', 'Edit link for resource');
        this.haloButton.addEventListener('click', this.updateResourceLink);
    }

    updateResourceLink(event){
        // Tells the model to update its
        // src link for the resource
        let currentSrc = this.model.partProperties.getPropertyNamed(
            this.model,
            'src'
        );
        let result = window.prompt("Edit URL for resource:", currentSrc);
        if(result && result !== '' && result !== currentSrc){
            this.sendMessage(
                {
                    type: 'command',
                    commandName: 'loadResource',
                    args: [ result ]
                },
                this.model
            );
        }
    }


};

export {
    ResourceView,
    ResourceView as default
};
