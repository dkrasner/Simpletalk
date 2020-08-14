import CardView from './CardView.js';

const templateString = `
                <style>
                 * {
                     box-sizing: border-box;
                 }
                 :host {
                     display: block;
                     position: relative;
                     width: 100%;
                     height: 100%;
                 }
                </style>
                <slot></slot>
`;

class BackgroundView extends CardView {
    constructor(){
        super();
    }
};

export {
    BackgroundView,
    BackgroundView as default
};
