// PREAMBLE
import EditorLocationInfo from './EditorLocationInfo.js';
import partIcons from '../../utils/icons.js';

window.customElements.define('editor-location-info', EditorLocationInfo);

const clipboardIcon = `
<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-clipboard" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000000" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" />
  <rect x="9" y="3" width="6" height="4" rx="2" />
</svg>
`;

const templateString = `
<style>
    :host {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        font-family: 'Helvetica', sans-serif;
        font-size: 0.8rem;
    }

    :host() > li {
        background-color: red;
    }

    .id-link,
    .location-link {
        display: inline-flex;
        align-items: center;
        outline: none;
        border: none;
        border-bottom: 1px solid rgba(150, 150, 150, 0.3);
        transition: border 0.2s ease-out;
        vertical-alignment: center;
        background-color: transparent;
        padding: 0px;
        font-size: 1em;
    }

    .id-link:hover,
    .location-link:hover {
        cursor: pointer;
        border-bottom: 1px solid rgba(150, 150, 150, 0.7);
        transition: border 0.2s ease-out;
    }

    .id-link > svg,
    .location-link > svg {
        margin-left: 8px;
        opacity: 0.7;
        transform: translateX(0px);
        transition: transform 0.2s ease-out, opacity 0.2s ease-out;
    }

    .id-link:hover > svg,
    .location-link:hover > svg {
        opacity: 1.0;
        transform: translateX(-5px);
        transition: transform 0.2s ease-out, opacity 0.2s ease-out;
    }

    section {
        display: flex;
        flex-direction: column;
        margin: 6px;
    }

    #button-area {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;'
    }

    #subparts-list-wrapper {
        flex: 1;
        overflow-y: hidden;
    }

    .hidden {
        display: none;
    }

    #subparts-area {
        flex: 1;
        list-style: none;
        font-family: 'Helvetica', sans-serif;
        padding: 0;
        margin: 0;
        margin-left: 32px;
        overflow-y: auto;
    }
</style>
<section id="button-area">
    <slot name="button"></slot>
</section>
<section id="location-area">
    <h3>Part Location and Owners</h3>
    <p class="part-info">
        I am located at <button class="location-link"><span></span>${clipboardIcon}</button>
        and my id is <button class="id-link"><span></span>${clipboardIcon}</button>
    </p>
    <slot name="ancestor-info"></slot>
</section>
<section id="subparts-list-wrapper">
    <h3>Subparts</h3>
    <ol id="subparts-area">
        <slot></slot>
    </ol>
</section>
`;

class EditorSubpartsPane extends HTMLElement {
    constructor(){
        super();

        // Setup template and shadow root
        const template = document.createElement('template');
        template.innerHTML = templateString;
        this._shadowRoot = this.attachShadow({mode: 'open'});
        this._shadowRoot.appendChild(
            template.content.cloneNode(true)
        );

        // Bound methods
        this.onAddSubpart = this.onAddSubpart.bind(this);
        this.onSubpartItemClick = this.onSubpartItemClick.bind(this);
        this.onLocationLinkClick = this.onLocationLinkClick.bind(this);
        this.createAddPartButton = this.createAddPartButton.bind(this);
        this.createSubpartComponent = this.createSubpartComponent.bind(this);
        this.getLocationStringFor = this.getLocationStringFor.bind(this);
    }

    connectedCallback(){
        if(this.isConnected){
            this.headerEl = this._shadowRoot.getElementById('location-area');
            this.myLocationArea = this.headerEl.querySelector('p');
            this.myLocationButton = this.myLocationArea.querySelector('.location-link');
            this.myIdButton = this.myLocationArea.querySelector('.id-link');

            // Add event listener to buttons
            this.myLocationButton.addEventListener('click', this.onLocationLinkClick);
            this.myIdButton.addEventListener('click', this.onLocationLinkClick);
        }
    }

    disconnectedCallback(){
        this.myLocationButton.removeEventListener('click', this.onLocationLinkClick);
        this.myIdButton.removeEventListener('click', this.onLocationLinkClick);
    }

    render(aModel){
        this.model = aModel;
        this.headerEl = this._shadowRoot.getElementById('location-area');
        
        // Clear any DOM children
        this.innerHTML = "";


        // Create location link elements
        // and also the self-location element
        let myLocationText = this.getLocationStringFor(this.model);
        this.myLocationButton.querySelector('span').textContent = myLocationText;
        this.myIdButton.querySelector('span').textContent = this.model.id.toString();
        if(this.model.type == 'world'){
            this.headerEl.classList.add('hidden');
        } else {
            this.headerEl.classList.remove('hidden');

            // Create the info elements
            ['stack', 'card', 'owner'].forEach(kind => {
                let infoEl = document.createElement('editor-location-info');
                infoEl.setAttribute('slot', 'ancestor-info');
                infoEl.setAttribute('kind', kind);
                infoEl.render(this.model);
                this.appendChild(infoEl);
            });
        }

        // Create the "add subpart" buttons for parts that are accepted by the
        // current Model part.
        this.model.acceptedSubpartTypes.forEach(partType => {
            let element = this.createAddPartButton(partType);
            this.appendChild(element);
        });

        let labelHeader = this._shadowRoot.querySelector('#subparts-list-wrapper > h3');
        if(this.model.subparts.length){
            labelHeader.textContent = "Current Subparts";
        } else {
            labelHeader.textContent = "There are no subparts";
        }

        this.model.subparts.forEach(subpart => {
            let element = this.createSubpartComponent(subpart);
            this.appendChild(element);
        });
    }

    createSubpartComponent(aPart){
        let wrapper = document.createElement('li');
        wrapper.classList.add('subpart-item');
        wrapper.setAttribute('ref-id', aPart.id);
        wrapper.addEventListener('click', this.onSubpartItemClick);

        // Add icon area an SVG for Part
        let iconArea = document.createElement('div');
        iconArea.classList.add('icon-display-area');
        let iconImage;
        if(Object.keys(partIcons).includes(aPart.type)){
            iconImage = partIcons[aPart.type];
        } else {
            iconImage = partIcons.generic;
        }
        iconArea.innerHTML = iconImage;
        wrapper.append(iconArea);

        // Add label, name, and id info
        let labelArea = document.createElement('h3');
        labelArea.textContent = `a ${aPart.type[0].toUpperCase()}${aPart.type.slice(1)}`;
        wrapper.append(labelArea);
        let name = aPart.partProperties.getPropertyNamed(
            aPart,
            'name'
        );
        if(name && name != ""){
            let nameArea = document.createElement('span');
            nameArea.classList.add('name-span');
            nameArea.textContent = `"${name}"`;
            wrapper.append(nameArea);
        }

        let idArea = document.createElement('span');
        idArea.classList.add('id-span');
        idArea.textContent = `(${aPart.id})`;
        wrapper.append(idArea);

        return wrapper;
    }

    createAddPartButton(aPartName){
        let button = document.createElement('button');
        let icon = partIcons[aPartName];
        if(!icon){
            icon = partIcons.generic;
        }
        button.setAttribute('slot', 'button');
        button.setAttribute('data-type', aPartName);
        button.setAttribute('title', `Add a ${aPartName} to this ${this.model.type}`);
        button.classList.add('add-part-button');
        button.addEventListener('click', this.onAddSubpart);
        button.innerHTML = icon;
        return button;
    }

    getLocationStringFor(aPart){
        let result = "";
        let currentPart = aPart;
        let currentOwner = aPart._owner;
        while(currentOwner){
            let indexInParent = currentOwner.subparts.indexOf(currentPart) + 1;
            result += `${currentPart.type} ${indexInParent} of `;
            currentPart = currentPart._owner;
            currentOwner = currentOwner._owner;
        }
        result += 'this world';
        return result;
    }

    onSubpartItemClick(event){
        let id = event.currentTarget.getAttribute('ref-id');
        let targetPart = window.System.partsById[id];
        if(targetPart){
            window.System.editor.render(targetPart);
        }
    }

    onAddSubpart(event){
        let type = event.currentTarget.getAttribute('data-type');
        if(type){
            this.model.sendMessage({
                type: 'command',
                commandName: 'newModel',
                args: [
                    type,
                    this.model.id
                ]
            }, this.model);
        }
        this.render(this.model);
    }

    onLocationLinkClick(event){
        let text = event.currentTarget.querySelector('span').textContent;
        let input = document.createElement('input');
        input.style.position = 'absolute';
        input.style.opacity = 0;
        document.body.append(input);
        let currentFocus = document.activeElement;
        input.focus();
        input.value = text;
        console.log(input.value);
        input.select();
        document.execCommand('copy');
        input.remove();
        currentFocus.focus();
    }
};

export {
    EditorSubpartsPane,
    EditorSubpartsPane as default
};
