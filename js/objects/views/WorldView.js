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
import WorldStack from '../parts/WorldStack';

class WorldView extends HTMLElement {
    constructor(){
        super();

        // This is a view of a Part
        // model
        this.isPartView = true;

        // Bind component methods
        this.makeErrorElement = this.makeErrorElement.bind(this);
    }

    connectedCallback(){
        if(this.isConnected){
            if(this.parentNode.isPartView){
                throw new Error(`WorldView should not be the child of any Part Views!`);
            }
        }
    }

    makeErrorElement(errorName, errorMessage){
        let wrapper = document.createElement('div');
        wrapper.classList.add('st-error-wrapper', 'world-error-wrapper');
        let inner = document.createElement('div');
        inner.classList.add('st-error-inner');
        wrapper.append(inner);
        let header = document.createElement('h1');
        header.classList.add('st-error-header');
        header.innerText = errorName;
        inner.append(header);
        let content = document.createElement('p');
        p.innerText = errorMessage;
        inner.append(content);
        this.append(wrapper);
    }
};
