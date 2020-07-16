/**
 * WorldView
 * ---------------------------------------------
 * I am a Webcomponent (custom element) that represents
 * a view of a WorldStack model.
 * My element children should contain a single StackView representing
 * the current displayed stack (this comes from the model).
 * I am the root-level element for the SimpleTalk system in a web
 * page. There should only be one of me on any given HTML page.
 */
import WorldStack from '../parts/WorldStack.js';
import PartView from './PartView.js';

class WorldView extends PartView {
    constructor(){
        super();
    }

    createNewModel(){
        return new WorldStack();
    }
};

export {
    WorldView,
    WorldView as default
};
