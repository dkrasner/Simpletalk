const templateString = `
<style>
    :host {
        display: flex;
        position: relative;
    }
    .submenu-area {
        display: none;
        position: absolute;
        left: 100%;
        top: 0px;
    }

    :host(:hover) .submenu-area {
        display: flex;
    }

    .label-area {
        display: flex;
        align-items: center;
    }

    .caret.hidden {
        display: none;
    }
    .caret {
        display: block;
        margin-left: auto;
        font-size: 1.1em;
    }
</style>
<div class="label-area">
    <span class="label"><slot></slot></span>
    <div class="caret hidden">→</div>
</div>
<div class="submenu-area">
    <slot name="submenu"></slot>
</div>
`;

class ContextMenuItem extends HTMLElement {
    constructor(){
        super();

        // Setup shadow dom and template
        this.template = document.createElement('template');
        this.template.innerHTML = templateString;
        this._shadowRoot = this.attachShadow({mode: 'open'});
        this._shadowRoot.append(
            this.template.content.cloneNode(true)
        );

        // Bound methods
        this.showCaret = this.showCaret.bind(this);
    }

    showCaret(){
        let caretEl = this._shadowRoot.querySelector('.caret');
        caretEl.classList.remove('hidden');
        
    }
};

export {
    ContextMenuItem,
    ContextMenuItem as default
};
