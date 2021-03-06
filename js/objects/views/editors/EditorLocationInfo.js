import interpreterSemantics from '../../../ohm/interpreter-semantics.js';
import {onLocationLinkClick, getLocationStringFor} from './utils/subparts.js';

// PREAMBLE
const arrowLeftIcon = `
<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-arrow-narrow-left" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000000" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <line x1="5" y1="12" x2="19" y2="12" />
  <line x1="5" y1="12" x2="9" y2="16" />
  <line x1="5" y1="12" x2="9" y2="8" />
</svg>
`;

const clipboardIcon = `
<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-clipboard" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="#000000" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" />
  <rect x="9" y="3" width="6" height="4" rx="2" />
</svg>
`;

const templateString = `
<style>
    :host(.hidden){
        display: none;
    }
    .button-link {
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

    .button-link:hover {
        cursor: pointer;
        border-bottom: 1px solid rgba(150, 150, 150, 0.7);
        transition: border 0.2s ease-out;
    }

    .button-link > svg {
        margin-left: 8px;
        opacity: 0.7;
        transform: translateX(0px);
        transition: transform 0.2s ease-out, opacity 0.2s ease-out;
    }

    .button-link:hover > svg {
        opacity: 1.0;
        transform: translateX(-5px);
        transition: transform 0.2s ease-out, opacity 0.2s ease-out;
    }
</style>
<p class="part-info">
    My <button id="owner-link" class="button-link" title=""><span></span>${arrowLeftIcon}</button> is named <span class="part-name"></span> and is located at <button id="location-link" class="button-link" title="Copy location"><span></span>${clipboardIcon}</button> <button id="id-link" class="button-link" title="Copy id"><span>Copy id</span>${clipboardIcon}</button>
</p>
`;

class EditorLocationInfo extends HTMLElement {
    constructor(){
        super();

        // Setup template and shadow root
        const template = document.createElement('template');
        template.innerHTML = templateString;
        this._shadowRoot = this.attachShadow({mode: 'open'});
        this._shadowRoot.appendChild(
            template.content.cloneNode(true)
        );

        // Accepted values for the kind attribute
        this.allowedKinds = ['stack', 'card', 'owner'];

        // define and bind methods
        this.getLocationStringFor = getLocationStringFor.bind(this);
        this.onLocationLinkClick = onLocationLinkClick.bind(this);

        // Bound methods
        this.handleStackKind = this.handleStackKind.bind(this);
        this.handleCardKind = this.handleCardKind.bind(this);
        this.updateInfo = this.updateInfo.bind(this);
        this.getAncestorOfTypeFor = this.getAncestorOfTypeFor.bind(this);
        this.getLocationViews = this.getLocationViews.bind(this);
        this.onLinkClick = this.onLinkClick.bind(this);
        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
    }

    connectedCallback(){
        // Events
        let ownerLinkButton = this._shadowRoot.getElementById('owner-link');
        let locationLinkButton = this._shadowRoot.getElementById('location-link');
        let idLinkButton = this._shadowRoot.getElementById('id-link');
        ownerLinkButton.addEventListener('click', this.onLinkClick);
        locationLinkButton.addEventListener('click', this.onLocationClick);
        idLinkButton.addEventListener('click', this.onLocationClick);
        locationLinkButton.addEventListener('mouseenter', this.onMouseEnter);
        idLinkButton.addEventListener('mouseenter', this.onMouseEnter);
        locationLinkButton.addEventListener('mouseleave', this.onMouseLeave);
        idLinkButton.addEventListener('mouseleave', this.onMouseLeave);
    }

    disconnectedCallback(){
        let ownerLinkButton = this._shadowRoot.getElementById('owner-link');
        let locationLinkButton = this._shadowRoot.getElementById('location-link');
        let idLinkButton = this._shadowRoot.getElementById('id-link');
        locationLinkButton.removeEventListener('click', this.onLocationClick);
        idLinkButton.removeEventListener('click', this.onLocationClick);
        ownerLinkButton.removeEventListener('mouseenter', this.onMouseEnter);
        locationLinkButton.removeEventListener('mouseenter', this.onMouseEnter);
        idLinkButton.removeEventListener('mouseenter', this.onMouseEnter);
        locationLinkButton.removeEventListener('mouseleave', this.onMouseLeave);
        idLinkButton.removeEventListener('mouseleave', this.onMouseLeave);
    }

    render(aModel){
        this.model = aModel;
        let kind = this.getAttribute('kind');
        if(!kind || !this.allowedKinds.includes(kind)){
            this.classList.add('hidden');
            return;
        }
        if(this.model.type == 'world'){
            this.classList.add('hidden');
            return;
        }

        this.classList.remove('hidden');

        // Update element references
        this.ownerLinkButton = this._shadowRoot.getElementById('owner-link');
        this.ownerLinkTypeSpan = this.ownerLinkButton.querySelector('span');
        this.locationLinkButton = this._shadowRoot.getElementById('location-link');
        this.locationLinkSpan = this.locationLinkButton.querySelector('span');
        this.idLinkButton = this._shadowRoot.getElementById('id-link');
        this.idLinkSpan = this.idLinkButton.querySelector('span');
        this.nameSpan = this._shadowRoot.querySelector('p .part-name');

        if(kind == 'stack'){
            this.handleStackKind();
        } else if(kind =='card'){
            this.handleCardKind();
        } else {
            this.updateInfo();
        }
    }

    updateInfo(){
        let kind = this.getAttribute('kind');
        let ancestor = this.model._owner;
        if(kind == 'stack' || kind == 'card'){
            ancestor = this.getAncestorOfTypeFor(this.model, kind);
        }

        // If we cannot find an ancestor of the given
        // kind, then we hide this field
        if(!ancestor){
            this.classList.add('hidden');
            return;
        }

        // Update name span
        let ancestorName = ancestor.partProperties.getPropertyNamed(
            ancestor,
            'name'
        );
        if(!ancestorName){
            ancestorName = '(unnamed)';
        } else {
            ancestorName = `"${ancestorName}"`;
        }
        this.nameSpan.textContent = ancestorName;

        // Update kind span
        let kindLabel = kind[0].toUpperCase() + kind.slice(1);
        this.ownerLinkTypeSpan.textContent = kindLabel;

        // Update location link span
        this.locationLinkSpan.textContent = this.getLocationStringFor(ancestor);

        // Update button titles
        let editTitle = `Edit owning ${kindLabel}`;
        if(kind == 'owner'){
            editTitle = 'Edit Owner';
        }
        this.ownerLinkButton.setAttribute(
            'title',
            editTitle
        );

        // Add the ref-id attribute
        this.setAttribute('ref-id', ancestor.id);
    }

    handleStackKind(){
        if(this.model.type == 'stack' || this.model.type == 'world'){
            this.classList.add('hidden');
            return;
        }
        this.updateInfo();
    }

    handleCardKind(){
        if(this.model.type == 'card' || this.model.type == 'stack'){
            this.classList.add('hidden');
            return;
        }
        this.updateInfo();
    }

    getAncestorOfTypeFor(aPart, aType){
        let result;
        let currentOwner = aPart._owner;
        while(currentOwner){
            if(currentOwner.type == aType){
                result = currentOwner;
                break;
            }
            currentOwner = currentOwner._owner;
        }
        return result;
    }

    onLinkClick(event){
        let id = this.getAttribute('ref-id');
        if(id && this.model){
            // Re-render the editor on the Part
            // referenced by the found id
            let target = window.System.partsById[id];
            target.partProperties.setPropertyNamed(target, "editor-open", true);
        }
    }

    onMouseEnter(event){
        this.getLocationViews(event).forEach((view) => {
            view.highlight("rgb(54, 172, 100)"); // green
        });
    }

    onMouseLeave(event){
        this.getLocationViews(event).forEach((view) => {
            view.unhighlight();
        });
    }

    getLocationViews(event){
        let targetId;
        let span = event.currentTarget.querySelector('span');
        if(span.parentElement.id == 'id-link'){
            targetId = this.getAttribute('ref-id');
        } else {
            let semantics = window.System.grammar.createSemantics();
            semantics.addOperation(
                'interpret',
                interpreterSemantics(window.System.partsById['world'], window.System)
            );
            let m = window.System.grammar.match(span.textContent, "ObjectSpecifier");
            try{
                targetId = semantics(m).interpret();
            } catch(e){
                console.log(`cannot locate ${span.textContent}`);
            }
        }
        return window.System.findViewsById(targetId);
    }
};

export {
    EditorLocationInfo,
    EditorLocationInfo as default
};
