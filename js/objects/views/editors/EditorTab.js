// PREAMBLE

const templateString = `
<style>
    :host {
        display: flex;
        flex: 1;
        align-items: center;
        justify-content: center;
        padding: 6px;
        opacity: 0.5;
        border-bottom: 2px solid rgba(100, 100, 100, 0.7);
        transition: border 0.2s linear, opacity 0.2s linear;
        user-select: none;
    }

    :host([active="true"]){
        border-bottom: 2px solid rgba(200, 0, 0, 0.9);
        opacity: 1.0;
        transition: border 0.2s linear, opacity 0.2s linear;
    }

    :host(:hover){
        cursor: pointer;
    }
</style>
<span id="label">
    <slot></slot>
</span>
`;

class EditorTab extends HTMLElement {
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
        this.onClick = this.onClick.bind(this);
    }

    connectedCallback(){
        if(this.isConnected){
            this.addEventListener('click', this.onClick);

            // If the tab is currently activated, emit
            // the tab-activaed message
            if(this.getAttribute('active') == "true"){
                let event = new CustomEvent("tab-activated", {
                    bubbles: true
                });
                this.dispatchEvent(event);
            }
        }
    }

    disconnectedCallback(){
        this.removeEventListener('click', this.onClick);
    }

    onClick(event){
        let isActive = (this.getAttribute('active') == "true");
        if(!isActive){
            this.setAttribute('active', 'true');
            let event = new CustomEvent("tab-activated", {
                bubbles: true
            });
            this.dispatchEvent(event);
        }
    }
};

export {
    EditorTab,
    EditorTab as default
};
