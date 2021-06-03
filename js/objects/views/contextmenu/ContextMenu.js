// PREAMBLE

const templateString = `
<style>
    :host {
        display: flex;
        flex-direction: column;
        position: absolute;
        border: 1px solid black;
        background-color: white;
        box-shadow: 1px 5px rgba(50, 50, 50, 0.7);
        z-index: 10000;
        padding-bottom: 8px;
        min-width: 200px;
        font-family: 'Helvetica', sans-serif;
    }
    header {
        width: 100%;
        position: relative;
        display: flex;
        border-bottom: 1px solid rgba(150, 150, 150, 0.5);
        padding-right: 16px;
        padding-left: 16px;
        padding-top: 8px;
        padding-bottom: 8px;
    }

    header > h4 {
        padding: 0;
        margin:0;
    }

    ul {
        list-style: none;
        margin: 0;
        padding: 0;
    }

</style>
<header>
    <h4></h4>
</header>
<ul id="list-items">
    <slot></slot>
</ul>
`;

class ContextMenu extends HTMLElement {
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
        this.addCopyAndPasteItems = this.addCopyAndPasteItems.bind(this);
        this.addListItem = this.addListItem.bind(this);
    }

    render(aModel){
        this.innerHTML = "";
        this.model = aModel;
        let headerEl = this._shadowRoot.querySelector('header > h4');
        let headerText = `${this.model.type[0].toUpperCase()}${this.model.type.slice(1)}`;
        headerText = `a ${headerText}`;
        headerEl.textContent = headerText;

        // Render the default menu items
        this.addCopyAndPasteItems();
    }

    addListItem(label, callback, submenu=null){
        let itemEl = document.createElement('li');
        itemEl.textContent = label;
        itemEl.classList.add('context-menu-item');
        itemEl.addEventListener('click', callback);
        if(submenu){             
            submenu.classList.add('context-submenu', 'submenu-hidden');
            itemEl.append(submenu);
        }
        this.append(itemEl);
    }

    addCopyAndPasteItems(){
        // Add copy item
        this.addListItem(
            'Copy',
            (event) => {
                window.System.clipboard.copyPart(this.model);
            }
        );

        // Add paste but only if:
        // 1. There is clipboard contents;
        // 2. The part type in the clipboard is
        //    one that is accepted by this model's part
        if(window.System.clipboard.contents.length){
            let partType = window.System.clipboard.contents[0].partType;
            if(this.model.acceptsSubpart(partType)){
                let label = `Paste (a ${partType[0].toUpperCase()}${partType.slice(1)})`;
                this.addListItem(label, (event) => {
                    window.System.clipboard.pasteContentsInto(this.model);
                });
            }
        }
    }
};

export {
    ContextMenu,
    ContextMenu as default
};
