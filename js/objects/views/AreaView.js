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
                #area-wrapper {
                    display: inherit;
                    flex-direction: inherit;
                    flex-wrap: inherit;
                    align-items: inherit;
                    align-content: inherit;
                    justify-content: inherit;
                    position: relative; 
                    width: 100%;
                    height: 100%;
                }
                .clip {
                    overflow: hidden;  
                }
                .allow-scroll {
                    overflow: auto;
                }
                </style>
                <div id="area-wrapper">
                <slot></slot>
                </div>
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

        // Bound methods
        this.clippingChanged = this.clippingChanged.bind(this);
        this.allowScrollingChanged = this.allowScrollingChanged.bind(this);

        // Prop change handlers
        this.onPropChange('clipping', this.clippingChanged);
        this.onPropChange('allow-scrolling', this.allowScrollingChanged);
    }

    clippingChanged(newVal, id){
        let wrapper = this._shadowRoot.getElementById('area-wrapper');
        if(newVal == true){
            wrapper.classList.remove('allow-scroll');
            wrapper.classList.add('clip');
        } else {
            wrapper.classList.remove('clip');
        }
    }

    allowScrollingChanged(newVal, id){
        let wrapper = this._shadowRoot.getElementById('area-wrapper');
        if(newVal == true){
            wrapper.classList.remove('clip');
            wrapper.classList.add('allow-scroll');
        } else {
            wrapper.classList.remove('allow-scroll');
        }
    }
};

export {
    AreaView,
    AreaView as default
};
