import EditorPropItem from './EditorPropItem.js';

// PREAMBLE
window.customElements.define('editor-prop-item', EditorPropItem);

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

    #props-list {
        flex: 1;
        overflow-y: auto;
        list-style: none;
        margin: 0;
        padding: 0;
    }
    #filter-area {
        display: flex;
        width: 100%;
        align-items: center;
    }
    #filter-area > input {
        min-width: 0;
        width: auto;
        flex: 1;
    }
</style>
<div id="filter-area">
    <label for="filter-input">Filter: </label>
    <input type="text" id="filter-input" name="filter-input" placeholder="Filter..."/>
    <button id="clear">Clear</button>
</div>
<ul id="props-list">
    <slot></slot>
</ul>
`;

const specialProps = [
    'cssStyle',
    'cssTextStyle',
    'id',
    'name',
    'target',
    'events',
    'current',
    'script'
];

class EditorPropList extends HTMLElement {
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
        this.render = this.render.bind(this);
        this.onInput = this.onInput.bind(this);
        this.onFilterClearClick = this.onFilterClearClick.bind(this);
    }

    connectedCallback(){
        if(this.isConnected){
            this.filterInputElement = this._shadowRoot.getElementById('filter-input');
            this.clearButton = this._shadowRoot.getElementById('clear');
            this.clearButton.addEventListener('click', this.onFilterClearClick);
        }
    }

    render(aModel){
        this.model = aModel;

        // Clear any existing main DOM children
        this.innerHTML = "";
        let inputEl = this._shadowRoot.getElementById('filter-input');
        inputEl.removeEventListener('input', this.onInput);
        inputEl.addEventListener('input', this.onInput);

        // Create a sorted copy of the property objects
        this.propList = this.model.partProperties.all.slice().filter(prop => {
                return !specialProps.includes(prop.name);
            });
        this.propList
            .sort((first, second) => {
            return first.name.localeCompare(second.name);
        });

        // Render the list item elements and insert them
        this.propList.forEach(propObject => {
            let el = document.createElement('editor-prop-item');
            el.setProperty(propObject, this.model);
            el.setAttribute('name', propObject.name);
            this.appendChild(el);
        });
    }

    filterBy(text){
        // Find all of the prop item elements whose
        // property name does *not* include the substring,
        // and set those to not display
        let allElements = Array.from(this.querySelectorAll('editor-prop-item'));
        allElements.forEach(propEl => {
            let name = propEl.getAttribute('name');
            if(name.toLowerCase().includes(text)){
                propEl.classList.remove('item-hidden');
            } else {
                propEl.classList.add('item-hidden');
            }
        });
    }

    onInput(event){
        this.filterBy(event.target.value.toLowerCase());
    }

    onFilterClearClick(event){
        this.filterInputElement.value = "";
        this.filterBy("");
    }
};

export {
    EditorPropList,
    EditorPropList as default
};
