import PartView from './PartView.js';

const templateString = `
                <style>
                </style>
                <slot></slot>
`;

class BackgroundView extends PartView {
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
};

export {
    BackgroundView,
    BackgroundView as default
};
