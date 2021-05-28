// PREAMBLE
import EditorLocationInfo from './EditorLocationInfo.js';
import partIcons from '../../utils/icons.js';

window.customElements.define('editor-location-info', EditorLocationInfo);

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

    header,
    #subparts-list-wrapper {
        display: flex;
        flex-direction: column;
        margin: 6px;
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
<header>
    <h3>Part Location and Owners</h3>
    <slot name="ancestor-info"></slot>
</header>
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
        this.onSubpartItemClick = this.onSubpartItemClick.bind(this);
        this.createSubpartComponent = this.createSubpartComponent.bind(this);
    }

    render(aModel){
        this.model = aModel;
        this.headerEl = this._shadowRoot.querySelector('header');
        
        // Clear any DOM children
        this.innerHTML = "";

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

    onSubpartItemClick(event){
        let id = event.currentTarget.getAttribute('ref-id');
        let targetPart = window.System.partsById[id];
        if(targetPart){
            window.System.editor.render(targetPart);
        }
    }
};

export {
    EditorSubpartsPane,
    EditorSubpartsPane as default
};
