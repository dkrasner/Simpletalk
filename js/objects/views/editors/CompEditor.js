import PartView from '../PartView.js';
import EditorTab from './EditorTab.js';


// PREAMBLE

// Add editor tab element
window.customElements.define('editor-tab', EditorTab);

const templateString = `
<style>
    :host {
        display: flex;
        position: absolute;
        transform: translateX(-105%);
        transition: transform 150ms linear;
        min-width: 400px;
        height: 100%;
        background-color: white;
    }
    
    :host(.open){
        transform: translateX(0%);
        transition: transform 150ms linear;
    }
</style>
<div id="tab-area">
    <editor-tab active="true">One</editor-tab>
    <editor-tab>Two</editor-tab>
    <editor-tab>Three</editor-tab>
</div>
<div id="pane-area"></div>
`;

class CompEditor extends PartView {
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
        this.toggle = this.toggle.bind(this);
        this.onTabActivated = this.onTabActivated.bind(this);
    }

    afterConnected(){
        this._shadowRoot.addEventListener('tab-activated', this.onTabActivated);
    }

    afterDisconnected(){
        this._shadowRoot.removeEventListener('tab-activated', this.onTabActivated);
    }

    toggle(){
        if(this.classList.contains('open')){
            this.classList.remove('open');
        } else {
            this.classList.add('open');
        }
    }

    onTabActivated(event){
        console.log('event!');
        Array.from(this._shadowRoot.querySelectorAll('editor-tab'))
            .filter(tabEl => {
                return tabEl !== event.target;
            }).forEach(tabEl => {
                tabEl.removeAttribute('active');
            });
    }
};

export {
    CompEditor,
    CompEditor as default
};
