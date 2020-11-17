/**
 * FieldView
 * ---------------------------------
 * I am the view of an Field part.
 * I am an "interim" view intended to display
 * and edit plain text on a Card.
 * I should be replaced with a more comprehensive
 * implementation of Field/FieldView in the future.
 */
import PartView from './PartView.js';

const templateString = `
<style>
:host {
    display: block;
    flex: 1;
    outline: none;
}
:host(:active),
:host(:focus){
    outline: none;
}
</style>
<textarea class="field-textarea" resize="false"></textarea>`;

class FieldView extends PartView {
    constructor(){
        super();

        this.template = document.createElement('template');
        this.template.innerHTML = templateString;
        this._shadowRoot = this.attachShadow({mode: 'open'});
        this._shadowRoot.appendChild(
            this.template.content.cloneNode(true)
        );

        // Bind methods
        this.onInput = this.onInput.bind(this);
        this.setupPropHandlers = this.setupPropHandlers.bind(this);

        this.setupPropHandlers();
    }

    setupPropHandlers(){
        this.onPropChange('textContent', (value, partId) => {
            let textArea = this._shadowRoot.querySelector('.field-textarea');
            textArea.value = value;
        });
    }

    afterConnected(){
        let textarea = this._shadowRoot.querySelector('.field-textarea');
        textarea.addEventListener('input', this.onInput);
    }

    afterDisconnected(){
        let textarea = this._shadowRoot.querySelector('.field-textarea');
        textarea.removeEventListener('input', this.onInput);
    }

    afterModelSet(){
        // If we have a model, set the value of the textarea
        // to the current text of the field model
        let textarea = this._shadowRoot.querySelector('.field-textarea');
        textarea.value = this.model.partProperties.getPropertyNamed(
            this.model,
            'textContent'
        );
    }

    onInput(event){
        event.stopPropagation();
        event.preventDefault();
        this.model.partProperties.setPropertyNamed(
            this.model,
            'textContent',
            event.target.value
        );
    }
};

export {
    FieldView,
    FieldView as default
};
