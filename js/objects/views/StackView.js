/**
 * StackView
 * ----------------------------------------------
 * I am a Webcomponent (custom element) representing
 * the view of a Stack.
 * I take up the full width of the current viewport
 * when I am being displayed.
 * My child elements are BackgroundView and CardView
 */

import PartView from './PartView.js';
import Stack from '../parts/Stack.js';

// by default, stacks are hidden unless they're
// the current stack, or else they have the class
// window-stack (suggesting there's window part
// who wishes to display it)
const templateString = `<slot></slot>`;

class StackView extends PartView {
    constructor(){
        super();

        // Setup templating and shadow dom
        const template = document.createElement('template');
        template.innerHTML = templateString;
        this._shadowRoot = this.attachShadow({mode: 'open'});
        this._shadowRoot.appendChild(
            template.content.cloneNode(true)
        );

        // Handle current-ness prop change
        this.onPropChange('current', (newVal, id) => {
            if(newVal){
                this.classList.add('current-stack');
            } else {
                this.classList.remove('current-stack');
            }
        });
    }

    afterModelSet(){
        let initCurrentness = this.model.partProperties.getPropertyNamed(
            this.model,
            'current'
        );
        if(initCurrentness){
            this.classList.add('current-stack');
        }
    }
};

export {
    StackView,
    StackView as default
};
