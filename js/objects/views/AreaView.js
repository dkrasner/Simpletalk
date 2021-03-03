/**
 * AreaView
 * -------------------------------
 * I am a webcomponent representation
 * of an Area, which is a grouping of
 * Parts that have some kind of layout
 * specified
 */
import PartView from './PartView.js';

const templateString = `
                <style>
                </style>
                <slot></slot>
`;

class AreaView extends PartView {
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
    AreaView,
    AreaView as default
};
