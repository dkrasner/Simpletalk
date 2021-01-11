import PartView from '../PartView.js';

const templateString = `
   <st-container></st-container>
`;

class ButtonEditorView extends PartView {
    constructor(){
        super();
        this.defaultWidth = "100px";
        this.defaultHeight = "100px";


        // Configure the Shadow DOM and template
        this.template = document.createElement('template');
        this.template.innerHTML = templateString;
        this.shadow = this.attachShadow({mode: 'open'});
        this.shadow.append(
            this.template.content.cloneNode(true)
        );
    }

    afterModelSet() {
    }

    afterConnected(){
    }

    afterDisconnected(){
    }
};

export {
    ButtonEditorView,
    ButtonEditorView as default
};
