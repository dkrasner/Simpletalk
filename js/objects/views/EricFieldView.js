/**
 * EricFieldView
 * ---------------------------------
 * I am the view of an EricField part.
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
<textarea class="eric-field-textarea" resize="false"></textarea>`;

class EricFieldView extends PartView {
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
        this.handlePropChange = this.handlePropChange.bind(this);
    }

    connectedCallback(){
        let textarea = this._shadowRoot.querySelector('.eric-field-textarea');
        textarea.addEventListener('input', this.onInput);

        // If we have a model, set the value of the textarea
        // to the current text of the field model
        if(this.model){
            textarea.value = this.model.partProperties.getPropertyNamed(
                this.model,
                'textContent'
            );
        }
    }

    disconnectedCallback(){
        let textarea = this._shadowRoot.querySelector('.eric-field-textarea');
        textarea.addEventListener('input', this.onInput);
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

    receiveMessage(aMessage){
        if(aMessage.type == 'propertyChanged'){
            this.handlePropChange(aMessage);
        }
    }

    handlePropChange(changeMessage){
        switch(changeMessage.propertyName){
        case 'textContent':
            let textArea = this._shadowRoot.querySelector('.eric-field-textarea');
            textArea.value = changeMessage.value;
        }
    }
};

export {
    EricFieldView,
    EricFieldView as default
};
