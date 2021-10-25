// PREAMBLE
import ContextMenuItem from './ContextMenuItem.js';

window.customElements.define('st-context-menu-item', ContextMenuItem);

const templateString = `
<style>
    :host {
        display: flex;
        flex-direction: column;
        position: absolute;
        border: 1px solid black;
        background-color: white;
        box-shadow: 1px 2px 10px rgba(50, 50, 50, 0.7);
        z-index: 10000;
        padding-bottom: 8px;
        min-width: 200px;
        font-family: 'Helvetica', sans-serif;
    }

    :host-context(li) {
        display: none;
        position: absolute;
        left: 100%;
        top: 0px;
    }

    :host-context(li):hover {
        display: flex;
    }

    header {
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
        font-size: 0.8rem;
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
        this.addHaloToggleItem = this.addHaloToggleItem.bind(this);
        this.addNavigatorToggleItem = this.addNavigatorToggleItem.bind(this);
        this.addCopyAndPasteItems = this.addCopyAndPasteItems.bind(this);
        this.addOpenEditorItem = this.addOpenEditorItem.bind(this);
        this.addScriptEditItem = this.addScriptEditItem.bind(this);
        this.addMovementItems = this.addMovementItems.bind(this);
        this.addPartSubmenu = this.addPartSubmenu.bind(this);
        this.addSaveSnapshotItem = this.addSaveSnapshotItem.bind(this);
        this.addListItem = this.addListItem.bind(this);
        this.addSpacer = this.addSpacer.bind(this);
        this.hideHeader = this.hideHeader.bind(this);
        this.adjustToClientView = this.adjustToClientView.bind(this);
    }

    render(aModel){
        this.innerHTML = "";
        this.model = aModel;
        let headerEl = this._shadowRoot.querySelector('header > h4');
        let headerText = `${this.model.type[0].toUpperCase()}${this.model.type.slice(1)}`;
        headerText = `a ${headerText}`;
        headerEl.textContent = headerText;

        // Render the default menu items
        this.addHaloToggleItem();
        this.addCopyAndPasteItems();
        this.addOpenEditorItem();
        this.addPartSubmenu();
        this.addScriptEditItem();
        this.addMovementItems();
        this.addNavigatorToggleItem();
        this.addSaveSnapshotItem();

        // Add View-specific items
        let view = document.querySelector(`[part-id="${this.model.id}"]`);
        view.addContextMenuItems(this);
    }

    addListItem(label, callback, submenu=null){
        let itemEl = document.createElement('st-context-menu-item');
        itemEl.textContent = label;
        itemEl.classList.add('context-menu-item');
        itemEl.addEventListener('click', callback);
        itemEl.addEventListener('click', () => {
            this.remove();
        });
        if(submenu){
            submenu.classList.add('context-submenu', 'submenu-hidden');
            submenu.setAttribute('slot', 'submenu');
            itemEl.append(submenu);
            itemEl.showCaret();
        }
        this.append(itemEl);
    }

    addSaveSnapshotItem(){
        this.addListItem(
            'Save Snapshot...',
            (event) => {
                window.System.world.sendMessage({
                    type: 'command',
                    commandName: 'saveHTML',
                    args: []
                }, window.System.world);
            }
        );
    }

    addHaloToggleItem(){
        let target = window.System.findViewById(this.model.id);
        // don't add halo option to cards, since you can't see those
        if(target.name != "CardView"){
            if(target.classList.contains('editing')){
                this.addListItem(
                    'Close Halo',
                    (event) => {
                        target.closeHalo();
                    }
                );
            } else {
                this.addListItem(
                    'Open Halo',
                    (event) => {
                        target.openHalo();
                    }
                );
            }
        }
    }

    addNavigatorToggleItem(){
        let nav = document.querySelector('st-navigator');
        if(nav.classList.contains('open')){
            nav.classList.toggle('open');
            this.addListItem(
                'Close Navigator',
                (event) => {
                    nav.close();
                }
            );
        } else {
            this.addListItem(
                'Open Navigator',
                (event) => {
                    nav.open();
                    nav.classList.toggle('open');
                }
            );
        }
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

    addOpenEditorItem(){
        this.addListItem(
            'Open Editor',
            (event) => {
                window.System.openEditorForPart(this.model.id);
            }
        );
    }

    addScriptEditItem(){
        this.addListItem(
            'Edit Script',
            (event) => {
                this.model.sendMessage({
                    type: 'command',
                    commandName: 'openScriptEditor',
                    args: [this.model.id]
                }, this.model);
            }
        );

        this.addListItem(
            'Edit World Script',
            (event) => {
                this.model.sendMessage({
                    type: 'command',
                    commandName: 'openScriptEditor',
                    args: ['world']
                }, this.model);
            }
        );

        let windowAncestor = this.model.findAncestorOfType('window');
        if(this.model.type != 'window' && windowAncestor !== null){
            this.addListItem(
                'Edit Owning Window Script',
                (event) => {
                    this.model.sendMessage({
                        type: 'command',
                        commandName: 'openScriptEditor',
                        args: [windowAncestor.id]
                    }, this.model);
                }
            );
        }
        
        let cardAncestor = this.model.findAncestorOfType('card');
        if(this.model.type != 'card' && cardAncestor){
            this.addListItem(
                'Edit Owning Card Script',
                (event) => {
                    this.model.sendMessage({
                        type: 'command',
                        commandName: 'openScriptEditor',
                        args: [cardAncestor.id]
                    }, this.model);
                }
            );
        }

        let stackAncestor = this.model.findAncestorOfType('stack');
        if(this.model.type != 'stack' && stackAncestor){
            this.addListItem(
                'Edit Owning Stack Script',
                (event) => {
                    this.model.sendMessage({
                        type: 'command',
                        commandName: 'openScriptEditor',
                        args: [stackAncestor.id]
                    }, this.model);
                }
            );
        }
    }

    addPartSubmenu(){
        // First, we need to get a list of names
        // of subparts that this model accepts
        let subpartNames;
        if(this.model.acceptedSubpartTypes[0] == "*"){
            // This model accepts all subpart types.
            // We need to get the names for these subparts,
            // which are registered at the System level.
            subpartNames = Object.keys(window.System.availableViews);
        } else {
            subpartNames = this.model.acceptedSubpartTypes;
        }

        // If there are no subpart names (meaning
        // the given part, like a button, doesn't
        // accept any subparts), then we do nothing.
        if(subpartNames.length == 0){
            return;
        }

        // Now we construct the submenu for adding parts
        // of the given type
        let submenu = document.createElement('st-context-menu');
        submenu.hideHeader();
        subpartNames.forEach(subpartName => {
            submenu.addListItem(
                subpartName[0].toUpperCase() + subpartName.slice(1),
                () => {
                    this.model.sendMessage({
                        type: 'command',
                        commandName: 'newModel',
                        args: [
                            subpartName,
                            this.model.id
                        ]
                    }, this.model);
                }
            );
        });

        // Now add the list item that will "reveal"
        // the submenu
        this.addListItem(
            'Add a new part',
            null,
            submenu
        );
        
    }

    addMovementItems(){
        let index = this.model._owner.subparts.indexOf(this.model);
        let ownerLength = this.model._owner.subparts.length;
        if(ownerLength && index < ownerLength - 1){
            // Create the moveDown option
            this.addListItem(
                'Move Down',
                (event) => {
                    this.model.sendMessage({
                        type: 'command',
                        commandName: 'moveDown',
                        args: []
                    }, this.model);
                }
            );
            this.addListItem(
                'Move to Last',
                (event) => {
                    this.model.sendMessage({
                        type: 'command',
                        commandName: 'moveToLast',
                        args: []
                    }, this.model);
                }
            );
        }
        if(index > 0){
            // Create the moveUp option
            this.addListItem(
                'Move Up',
                (event) => {
                    this.model.sendMessage({
                        type: 'command',
                        commandName: 'moveUp',
                        args: []
                    }, this.model);
                }
            );
            this.addListItem(
                'Move to First',
                (event) => {
                    this.model.sendMessage({
                        type: 'command',
                        commandName: 'moveToFirst',
                        args: []
                    }, this.model);
                }
            );
        }
    }

    addSpacer(){
        let item = document.createElement('li');
        item.classList.add('context-menu-spacer');
        this.append(item);
    }

    hideHeader(){
        let headerEl = this._shadowRoot.querySelector('header');
        headerEl.style.display = "none";
    }

    adjustToClientView(){
        let rect = this.getBoundingClientRect();
        let padding = 10;
        let viewportWidth = document.documentElement.clientWidth;
        let viewportHeight = document.documentElement.clientHeight;
        let bottomDiff = (rect.bottom + padding) - viewportHeight;
        let rightDiff = (rect.right + padding) - viewportWidth;
        if(bottomDiff > 0){
            this.style.top = `${(rect.top - bottomDiff)}px`;

            // Reposition any hidden submenus, so they open
            // above
            Array.from(this.children).filter(childEl => {
                return childEl.children.length > 0;
            }).forEach(itemWithSubmenu => {
                let container = itemWithSubmenu._shadowRoot.querySelector('.submenu-area');
                container.style.top = `${(-1 * itemWithSubmenu.getBoundingClientRect().height)}px`;
            });
        }
        if(rightDiff > 0){
            this.style.left = `${rect.left - rightDiff}px`;

            // Reposition any hidden submenus, so they open
            // to the left (instead of right)
            Array.from(this.children).filter(childEl => {
                return childEl.children.length > 0;
            }).forEach(itemWithSubmenu => {
                let container = itemWithSubmenu._shadowRoot.querySelector('.submenu-area');
                container.style.left = `${(-1 * itemWithSubmenu.getBoundingClientRect().width)}px`;
            });
        }
    }
};

export {
    ContextMenu,
    ContextMenu as default
};
