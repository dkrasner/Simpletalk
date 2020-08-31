import PartView from './PartView.js';

const templateString = `
                <style>
                 * {
                     box-sizing: border-box;
                 }
                 :host {
                     display: block;
                     position: absolute;
                     top: 0px;
                     left: 0px;
                     width: 100%;
                     height: 100%;
                     background-color: rgb(200, 200, 222);
                 }
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
