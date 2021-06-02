// PREAMBLE

const templateString = `
<style>
    :host {
        display: block;
        position: absolute;
        border: 1px solid black;
        background-color: white;
        box-shadow: 1px 5px rgba(50, 50, 50, 0.7);
    }
</style>
<header>
    <h5></h5>
</header>
<ul id="list-items">
    <slot></slot>
</ul>
`;

class ContextMenu extends HTMLElement {
    constructor(){
        super();

        // Setup template and shadow root
        const template = document.createElement('template');
        template.innerHTML = templateString;
        this._shadowRoot = this.attachShadow({mode: 'open'});
        this._shadowRoot.appendChild(
            template.content.cloneNode(true)
        );
    }

    render(aModel){
        this.model = aModel;
        let headerEl = this._shadowRoot.querySelector('header > h5');
        let headerText = `${this.model.type[0].toUpperCase()}${this.model.type.slice(1)}`;
        headerText = `a ${headerText}`;
        headerEl.textContent = headerText;
    }
};

export {
    ContextMenu,
    ContextMenu as default
};
