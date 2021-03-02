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

const haloModeButtonSVG = `
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
        this.textToHtml = this.textToHtml.bind(this);
        this.setTextValue = this.setTextValue.bind(this);
        this.setupPropHandlers = this.setupPropHandlers.bind(this);
        this.simpleTalkCompleter = this.simpleTalkCompleter.bind(this);
        this.initCustomHaloButton = this.initCustomHaloButton.bind(this);
        this.openColorWheelWidget = this.openColorWheelWidget.bind(this);
        this.onColorSelected = this.onColorSelected.bind(this);
        this.onTransparencyChanged = this.onTransparencyChanged.bind(this);

        this.setupPropHandlers();
    }

    setupPropHandlers(){
        this.onPropChange('editable', (value, id) => {
            this.textarea.setAttribute('contenteditable', value);
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
        if(!this.haloModeButton){
            this.initCustomHaloButton();
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
        this.textarea = this._shadowRoot.querySelector('.field-textarea');
        let textContent = this.model.partProperties.getPropertyNamed(
            this.model,
            'textContent'
        );
        document.execCommand("insertHTML", false, textContent);
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
            event.target.innerText
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
            } else if(event.altKey){
                let text = document.getSelection().toString();
                if(text && !this.contextMenuOpen){
                    this.openContextMenu();
                }
            }
        }
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

    initCustomHaloButton(){
        this.haloModeButton = document.createElement('div');
        this.haloModeButton.id = "halo-field-toggle-mode";
        this.haloModeButton.classList.add('halo-button');
        this.haloModeButton.innerHTML = haloModeButtonSVG;
        this.haloModeButton.style.marginRight = "6px";
        this.haloModeButton.setAttribute('slot', 'bottom-row');
        this.haloModeButton.setAttribute('title', 'Toggle field tools');
        this.haloModeButton.addEventListener('click', () => {
            let isEditable = this.model.partProperties.getPropertyNamed(this.model, "editable");
            this.model.partProperties.setPropertyNamed(
                this.model,
                'editable',
                isEditable
            );

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
        foundHalo.append(this.haloModeButton);
    }

    openColorWheelWidget(event, command){
        let colorWheelWidget = new ColorWheelWidget(command);
        // add an attribute describing the command
        colorWheelWidget.setAttribute("selector-command", command);
        // add a custom callback for the close button
        let closeButton = colorWheelWidget.shadowRoot.querySelector('#close-button');
        closeButton.addEventListener('click', () => {colorWheelWidget.remove();});
        // add the colorWheelWidget
        event.target.parentNode.after(colorWheelWidget);
        // add a color-selected event callback
        // colorWheelWidget event listener
        let colorWheel = this.shadowRoot.querySelector('color-wheel');
        colorWheel.addEventListener('color-selected', this.onColorSelected);
        colorWheel.addEventListener('transparency-changed', this.onTransparencyChanged);
    }

    onColorSelected(event){
        let command = event.target.getAttribute("selector-command");
        let colorInfo = event.detail;
        let colorStr = `rgba(${colorInfo.r}, ${colorInfo.g}, ${colorInfo.b}, ${colorInfo.alpha})`;
        this.model.sendMessage({
            type: "command",
            commandName: "setProperty",
            args: [command, colorStr]
        }, this.model);
    }

    onTransparencyChanged(event){
        this.model.sendMessage({
            type: "command",
            commandName: "setProperty",
            args: [event.detail.propName, event.detail.value]
        }, this.model);
    }

};

export {
FieldView,
FieldView as default
};
