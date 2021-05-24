

// PREAMBLE
const templateString = `
<style>
    :host {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        font-family: 'Helvetica', sans-serif;
        font-size: 0.8rem;
    }
   
    textarea {
        resize: none;
        flex: 0.25;
    }
</style>
<h3>Send this <span></span> a Message:</h3>
<textarea placeholder="Type your Simpletalk message here..."></textarea>
<button>Send</button>
`;

class EditorMessenger extends HTMLElement {
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
        this.render = this.render.bind(this);
        this.onMessageFieldInput = this.onMessageFieldInput.bind(this);
        this.sendMessageFromText = this.sendMessageFromText.bind(this);
    }

    connectedCallback(){
        if(this.isConnected){
            this.sendButton = this._shadowRoot.querySelector('button');
            this.sendButton.addEventListener('click', this.sendMessageFromText);
        
            this.messageField = this._shadowRoot.querySelector('textarea');
            this.messageField.addEventListener('input', this.onMessageFieldInput);
        }
    }

    disconnectedCallback(){
        this.messageField.removeEventListener('input', this.onMessageFieldInput);
        this.sendButton.removeEventListener('click', this.sendMessageFromText);
    }

    render(aModel){
        this.model = aModel;
        
        let partTypeLabel = this._shadowRoot.querySelector('h3 > span');
        partTypeLabel.textContent = this.model.type;
    }

    onMessageFieldInput(event){

    }

    sendMessageFromText(){
        let text = this.messageField.value;
        let script = `on doIt\n\t${text}\nend doIt`;
        this.model.sendMessage({
            type: 'compile',
            codeString: script,
            targetId: this.model.id
        }, this.model);
        this.model.sendMessage({
            type: 'command',
            commandName: 'doIt',
            args: [],
            shouldIgnore: true
        }, this.model);
    }
};

export {
    EditorMessenger,
    EditorMessenger as default
};
