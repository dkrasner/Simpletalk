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

class StackView extends PartView {
    constructor(){
        super();
    }

    createNewModel(){
        return new Stack();
    }
};

export {
    StackView,
    StackView as default
};
