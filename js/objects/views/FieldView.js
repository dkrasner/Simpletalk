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
import ColorWheelWidget from './drawing/ColorWheelWidget.js';

const haloEditButtonSVG = `
<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-tools" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <path d="M3 21h4l13 -13a1.5 1.5 0 0 0 -4 -4l-13 13v4" />
  <line x1="14.5" y1="5.5" x2="18.5" y2="9.5" />
  <polyline points="12 8 7 3 3 7 8 12" />
  <line x1="7" y1="8" x2="5.5" y2="9.5" />
  <polyline points="16 12 21 17 17 21 12 16" />
  <line x1="16" y1="17" x2="14.5" y2="18.5" />
</svg>
`;

const haloLockButtonSVG = `
<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-lock" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
   <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
   <rect x="5" y="11" width="14" height="10" rx="2"></rect>
   <circle cx="12" cy="16" r="1"></circle>
   <path d="M8 11v-4a4 4 0 0 1 8 0v4"></path>
</svg>
`;

const haloUnlockButtonSVG = `
<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-lock-open" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
   <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
   <rect x="5" y="11" width="14" height="10" rx="2"></rect>
   <circle cx="12" cy="16" r="1"></circle>
   <path d="M8 11v-5a4 4 0 0 1 8 0"></path>
</svg>
`;

const fieldTemplateString = `
      <style>
        .field {
            display: flex;
            align-items: center;
            flex-direction: column;
            height: 100%;
            width: 100%;
            overflow: auto;
        }

        .field color-wheel {
            position: absolute;
        }

        .field-textarea {
            width: calc(100% - 5px);
            font-family: monospace;
            height: 100%;
            width: 100%;
            white-space: pre-wrap;
            overflow-wrap: anywhere;
        }

    </style>
    <div class="field">
        <div class="field-textarea" spellcheck="false"></div>
    </div>`;


function formatDoc(sCmd, sValue) {
  document.execCommand(sCmd, false, sValue); oDoc.focus();
}

class FieldView extends PartView {
    constructor(){
        super();

        // this.editorCompleter = this.simpleTalkCompleter;
        this.editorCompleter = null;
        this.contextMenuOpen = false;
        this.haloLockUnlockButton = null;
        this.selectionRanges = {};

        this.template = document.createElement('template');
        this.template.innerHTML = fieldTemplateString;
        this._shadowRoot = this.attachShadow({mode: 'open'});
        this._shadowRoot.appendChild(
            this.template.content.cloneNode(true)
        );

        // Bind methods
        this.onInput = this.onInput.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onKeydown = this.onKeydown.bind(this);
        this.openContextMenu = this.openContextMenu.bind(this);
        this.closeContextMenu = this.closeContextMenu.bind(this);
        this.doIt = this.doIt.bind(this);
        this.handleSelection = this.handleSelection.bind(this);
        this.openField = this.openField.bind(this);
        this.textToHtml = this.textToHtml.bind(this);
        this.setTextValue = this.setTextValue.bind(this);
        this.setupPropHandlers = this.setupPropHandlers.bind(this);
        this.simpleTalkCompleter = this.simpleTalkCompleter.bind(this);
        this.initCustomHaloButtons = this.initCustomHaloButtons.bind(this);

        this.setupPropHandlers();
    }

    setupPropHandlers(){
        this.onPropChange('editable', (value, id) => {
            this.textarea.setAttribute('contenteditable', value);
            if(value === true){
                this.haloLockUnlockButton = this.haloLockButton;
                this.classList.add("editable");
            } else if (value === false){
                this.haloLockUnlockButton = this.haloUnlockButton;
                this.classList.remove("editable");
            }
        });
        this.onPropChange('textContent', (value, id) => {
            this.textarea.innerHTML = "";
            document.execCommand("insertHTML", false, value);
        });
    }

    afterConnected(){
        // The events here are added via the .addEventListener() API which is
        // distinct from the this.eventRespond() which uses the DOM element
        // element.onEvent API. This allows us to distnguish between "core"
        // system-web events that we don't want meddled with at the moment, like
        // entering text in a field, and ones exposed in the environemnt for scripting
        this.textarea = this._shadowRoot.querySelector('.field-textarea');
        let isEditable = this.model.partProperties.getPropertyNamed(this.model, "editable");
        this.textarea.setAttribute('contenteditable', isEditable);
        this.textarea.addEventListener('input', this.onInput);
        this.textarea.addEventListener('keydown', this.onKeydown);
        this.textarea.focus();
        // document.execCommand("defaultParagraphSeparator", false, "br");
        this.addEventListener('click', this.onClick);
        if(this.model){
            // If we have a model, set the value of the textarea
            // to the current text of the field model
            let textContent = this.model.partProperties.getPropertyNamed(
                this.model,
                'textContent'
            );
            document.execCommand("insertHTML", false, textContent);
        }
    }

    afterDisconnected(){
        this.textarea.removeEventListener('input', this.onInput);
        this.textarea.removeEventListener('keydown', this.onKeydown);
        this.removeEventListener('click', this.onClick);
    }

    afterModelSet(){
        // If we have a model, set the value of the textarea
        // to the current text of the field model
        let textContent = this.model.partProperties.getPropertyNamed(
            this.model,
            'textContent'
        );
        document.execCommand("insertHTML", false, textContent);
        // setup the lock/unlock halo button
        this.initCustomHaloButtons();
        let editable = this.model.partProperties.getPropertyNamed(
            this.model,
            'editable'
        );
        if(editable === true){
            this.haloLockUnlockButton = this.haloLockButton;
            this.classList.add("editable");
        } else if (editable === false){
            this.haloLockUnlockButton = this.haloUnlockButton;
            this.classList.remove("editable");
        }
    }

    setTextValue(text){
        this.model.partProperties.setPropertyNamed(
            this.model,
            'textContent',
            text
        );
        document.execCommand("insertHTML", false, textContent);
    }

    simpleTalkCompleter(element){
        let textContent = this.htmlToText(element);
        let startOfHandlerRegex = /^on\s(\w+)(\s|\n)+$/;
        let match = textContent.match(startOfHandlerRegex);
        if(match){
            let messageName = match[1];
            // if input break is a new line then an extra
            // <div></br></div> has beed added into the elemen already
            let tabLine = "\t\n";
            if(match[2] === "\n"){
                tabLine= "";
            }
            textContent = `${tabLine}end ${messageName}`;
            let htmlContent = this.textToHtml(textContent);
            element.insertAdjacentHTML("beforeend", htmlContent);
        }
        return element.innerHTML;
    }

    /*
     * I convert raw text to html respecting the Firefox
     * contenteditable attribute guidelnes.
     * This means that single lins of text are left as is;
     * multiline text, i.e. text which includes "\n", is
     * wrapped in <div></div> for every line; and the last
     * line gets a <br> tag inserted before the </div> to reflect
     * the "on-enter-key" behavior.
     */
    textToHtml(text){
        if(text){
            let textLines = text.split("\n");
            if(textLines.length > 1){
                let html = "";
                textLines.forEach((line) => {
                    if(line){
                        html += `<div>${line}</div>`;
                    } else {
                        html += "<div><br></div>";
                    }
                });
                return  `<div>${html}<br></div>`;
            } else {
                return text;
            }
        } else {
            return "";
        }
    }

    htmlToText(element){
        // TODO this is very naive and ignores most possible structure
        if(element.innerHTML){
            // first replace all the "</div><div>" with line breaks
            let cleanHTML =  element.innerHTML.replace(/<\/div><div>/g, "\n");
            // then remove all html
            let tempElement = document.createElement("div");
            tempElement.innerHTML = cleanHTML;
            let cleanText = tempElement.textContent;
            tempElement.remove();
            return cleanText;
        } else {
            return "";
        }
    }

    onInput(event){
        event.stopPropagation();
        event.preventDefault();

        if(this.editorCompleter){
            // TODO sort out how this would work
            let innerHTML = event.target.innerHTML;
            innerHTML = this.editorCompleter(event.target);
        }

        this.model.partProperties.setPropertyNamed(
            this.model,
            'textContent',
            event.target.innerText,
            false // do not notify, to preserve contenteditable context
        );
    }

    onKeydown(event){
        // prevent the default tab key to leave focus on the field
        if(event.key==="Tab"){
            event.preventDefault();
            document.execCommand('insertHTML', false, '&#x9');
        };
    }

    onClick(event){
        event.preventDefault();
        event.stopPropagation();
        if(event.button == 0){
            // if the shift key is pressed we toggle the halo
            if(event.shiftKey){
                if(this.hasOpenHalo){
                    this.closeHalo();
                    // toolbar.style.top = `${toolbar.clientHeight + 5}px`;
                    // toolbar.style.visibility = "hidden";
                } else {
                    this.openHalo();
                    // toolbar.style.top = `-${toolbar.clientHeight + 5}px`;
                    // toolbar.style.visibility = "unset";
                }
            } else{
                let text = window.getSelection().toString();
                // if no text is selected we do nothing
                if(text){
                    // if the altKey is pressed we open the context ("do it") menu
                    if(event.altKey){
                        if(!this.contextMenuOpen){
                            this.openContextMenu();
                        }
                    } else {
                        this.handleSelection();
                    }
                } else {
                    // clear all the selections
                    this.selectionRanges = {};
                }
                console.log(this.selectionRanges);
            }
        }
    }

    /* I handle selected text, creating a new field model/view
     * for every range in the selection, keeping track of every range
     * in this.selection Object/dict so that modification can be inserted
     * back into the corresponding ranges.
     */
    handleSelection(){
        let selection = window.getSelection();
        for(let i=0; i < selection.rangeCount; i++){
            // make sure this is not a continuing selection
            // and that the range is not already registered
            let range = selection.getRangeAt(i);
            if(Object.values(this.selectionRanges).indexOf(range) >= 0){
                continue;
            }
            // we generate our own range ids, since we want this to correspond to
            // selection order which is not respected by the browser selection object
            let rangeId = Object.keys(this.selectionRanges).length;
            this.selectionRanges[rangeId] = range;
            // open a field for each new selection and populate it with the range html
            this.openField(range);
        }
    }

    openField(range){
        // create an HTML document fragment from the range to avoid dealing wiht start/end
        // and offset calculations
        let docFragment = range.cloneContents();
        // fragments don't have the full html DOM element API so we need to create the inner HTML
        let html = "";
        docFragment.childNodes.forEach((node) => {
            if(node.nodeName === "#text"){
                html += node.textContent;
            } else {
                html += node.innerHTML;
            }
        });

        // TODO these should all be messages and correspnding command handler definitions
        // should be part of the field's own script
        let fieldModel = window.System.newModel("field", this.model._owner.id, "selection XYZ");
        fieldModel.partProperties.setPropertyNamed(fieldModel, "htmlContent", html);

    }

    openContextMenu(){
        let text = document.getSelection().toString();
        let focusNode = document.getSelection().focusNode;
        let button = document.createElement("button");
        button.id = "doIt";
        button.style.marginLeft = "10px";
        button.style.backgroundColor = "var(--palette-green)";
        button.textContent = "Do it!";
        button.addEventListener("click", this.doIt);
        focusNode.after(button);
        this.contextMenuOpen = true; 
    };

    closeContextMenu(){
        let button = this._shadowRoot.querySelector('#doIt');
        if(button){
            button.remove();
        }
        // clear the selection and set the context menu to closed
        document.getSelection().removeAllRanges();
        this.contextMenuOpen = false;
    }

    doIt(event){
        event.stopPropagation();
        let text = document.getSelection().toString();
        this.closeContextMenu();
        // send message to compile the prepped script
        let script = `on doIt\n   ${text}\nend doIt`;
        this.sendMessage(
            {
                type: "compile",
                codeString: script,
                targetId: this.model.id
            },
            this.model
        );
        this.sendMessage(
            {
                type: "command",
                commandName: "doIt",
                args: [],
            },
            this.model
        );
    }

    initCustomHaloButtons(){
        this.haloLockButton = document.createElement('div');
        this.haloLockButton.id = "halo-field-lock-editor";
        this.haloLockButton.classList.add('halo-button');
        this.haloLockButton.innerHTML = haloLockButtonSVG;
        this.haloLockButton.style.marginRight = "6px";
        this.haloLockButton.setAttribute('slot', 'bottom-row');
        this.haloLockButton.setAttribute('title', 'Lock Editing');
        this.haloLockButton.addEventListener('click', () => {
            this.model.sendMessage({
                type: 'command',
                commandName: 'setProperty',
                args: ["editable", false],
            }, this.model);
            this.closeHalo();
            this.openHalo();
            // close/open the halo to update the editing state toggle button
        });
        this.haloUnlockButton = document.createElement('div');
        this.haloUnlockButton.id = "halo-field-unlock-editor";
        this.haloUnlockButton.classList.add('halo-button');
        this.haloUnlockButton.innerHTML = haloUnlockButtonSVG;
        this.haloUnlockButton.style.marginRight = "6px";
        this.haloUnlockButton.setAttribute('slot', 'bottom-row');
        this.haloUnlockButton.setAttribute('title', 'Unlock Editing');
        this.haloUnlockButton.addEventListener('click', () => {
            this.model.sendMessage({
                type: 'command',
                commandName: 'setProperty',
                args: ["editable", true],
            }, this.model);
            // close/open the halo to update the editing state toogle button
            this.closeHalo();
            this.openHalo();
        });
    }

    openHalo(){
        // Override default. Here we add a custom button
        // when showing.
        let foundHalo = this.shadowRoot.querySelector('st-halo');
        if(!foundHalo){
            foundHalo = document.createElement('st-halo');
            this.shadowRoot.appendChild(foundHalo);
        }
        foundHalo.append(this.haloLockUnlockButton);
    }

    // Overwriting the base class open/close editor methods
    openEditor(){
        window.System.openEditorForPart("field", this.model.id);
    }

    closeEditor(){
        window.System.closeEditorForPart("field", this.model.id);
    }

    // We overwrite the PartView.onHaloOpenEditor for the moment
    // TODO when all editors are properly established this can
    // be moved back to the base class, and remove from here
    onHaloOpenEditor(){
        // Send the message to open a script editor
        // with this view's model as the target
        this.model.sendMessage({
            type: 'command',
            commandName: 'openEditor',
            args: [this.model.id],
            shouldIgnore: true // Should ignore if System DNU
        }, this.model);
    }


};

export {
    FieldView,
    FieldView as default
};
