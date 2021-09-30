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
                    border-radius: inherit;
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

    afterModelSet(){
        let clipping = this.model.partProperties.getPropertyNamed(
            this.model,
            "clipping"
        );
        let allowScrolling = this.model.partProperties.getPropertyNamed(
            this.model,
            "allow-scrolling"
        );
        this.clippingChanged(clipping, this.model.id);
        this.allowScrollingChanged(allowScrolling, this.model.id);
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
            this.classList.add('outer-allow-scroll');
        } else {
            this.classList.remove('outer-allow-scroll');
            wrapper.classList.remove('allow-scroll');
        }
    }

    addContextMenuItems(contextMenu){
        contextMenu.addSpacer();
        let layout = this.model.partProperties.getPropertyNamed(
            this.model,
            'layout'
        );
        let direction = this.model.partProperties.getPropertyNamed(
            this.model,
            'list-direction'
        );
        if(layout != 'list'){
            contextMenu.addListItem(
                "Set Layout to List",
                (event) => {
                    this.model.partProperties.setPropertyNamed(
                        this.model,
                        'layout',
                        'list'
                    );
                }
            );
        } else {
            contextMenu.addListItem(
                "Set Layout to Strict",
                (event) => {
                    this.model.partProperties.setPropertyNamed(
                        this.model,
                        'layout',
                        'strict'
                    );
                }
            );
            if(direction == 'row'){
                contextMenu.addListItem(
                    "Set List Direction to Column",
                    (event) => {
                        this.model.partProperties.setPropertyNamed(
                            this.model,
                            'list-direction',
                            'column'
                        );
                    }
                );
            } else {
                contextMenu.addListItem(
                    "Set List Direction to Row",
                    (event) => {
                        this.model.partProperties.setPropertyNamed(
                            this.model,
                            'list-direction',
                            'row'
                        );
                    }
                );
            }
        }
    }
};

export {
    AreaView,
    AreaView as default
};
