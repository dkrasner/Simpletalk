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

const templateString = `
<style>
.field {
    display: flex;
    align-items: center;
    flex-direction: column;
    max-height: 100%important;
    height: 100%;
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
}

.field color-wheel {
    position: absolute;
}

.field-textarea-wrapper {
    width: 100%;
    height: 90%;
    background-color: var(--palette-cornsik);
}

.field-textarea {
    width: calc(100% - 5px);
    font-family: monospace;
    height: 100%;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
}

.field-toolbar {
    display: flex;
    justify-content: center;
    width: 100%;
    background-color: var(--palette-red);
    padding-top: 5px;
    padding-bottom: 5px;
    opacity: 1;
    transition: opacity .5s, transform 1s;
}

.field-toolbar > * {
    margin-right: 2px;
    margin-left: 2px;
}

.field-toolbar > *:active {
    outline: 2px solid #004b67;
}

:host {
    display: block;
    position: absolute;
    outline: none;
    resize: both;
}
:host(:active),
:host(:focus){
    outline: none;
}
</style>
<div class="field">
  <div class="field-toolbar">
      <select title="Mode" id="field-mode">
        <option class="heading" selected>- mode -</option>
        <option value="Bravo">Bravo</option>
        <option value="SimpleTalk" selected>SimpleTalk</option>
      </select>
      <select title="Font Name" id="field-fontname">
        <option class="heading" selected>- font -</option>
        <option value="Monospace" selected>Monospace</option>
        <option value="Times">Times</option>
        <option value="cursive">cursive</option>
        <option value="math">math</option>
      </select>
      <select title="Font Size" id="field-fontsize">
        <option class="heading" selected>- size -</option>
        <option value="1">X-small</option>
        <option value="2">Small</option>
        <option value="3" selected>Medium</option>
        <option value="4">Large</option>
        <option value="5">X-Large</option>
        <option value="6">XX-Large</option>
        <option value="7">Max</option>
      </select>
        <svg xmlns="http://www.w3.org/2000/svg" id="field-clean" class="icon icon-tabler icon-tabler-eraser" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <path d="M19 19h-11l-4 -4a1 1 0 0 1 0 -1.41l10 -10a1 1 0 0 1 1.41 0l5 5a1 1 0 0 1 0 1.41l-9 9" />
          <line x1="18" y1="12.3" x2="11.7" y2="6" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" id="field-undo"  class="icon icon-tabler icon-tabler-arrow-back-up" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <path d="M9 13l-4 -4l4 -4m-4 4h11a4 4 0 0 1 0 8h-1" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" id="field-redo"  class="icon icon-tabler icon-tabler-arrow-forward-up" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <path d="M15 13l4 -4l-4 -4m4 4h-11a4 4 0 0 0 0 8h1" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" id="field-removeFormat" class="icon icon-tabler icon-tabler-clear-formatting" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <path d="M17 15l4 4m0 -4l-4 4" />
          <path d="M7 6v-1h11v1" />
          <line x1="7" y1="19" x2="11" y2="19" />
          <line x1="13" y1="5" x2="9" y2="19" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" id="field-bold"  class="icon icon-tabler icon-tabler-bold" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <path d="M7 5h6a3.5 3.5 0 0 1 0 7h-6z" />
          <path d="M13 12h1a3.5 3.5 0 0 1 0 7h-7v-7" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" id="field-italic"  class="icon icon-tabler icon-tabler-italic" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <line x1="11" y1="5" x2="17" y2="5" />
          <line x1="7" y1="19" x2="13" y2="19" />
          <line x1="14" y1="5" x2="10" y2="19" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" id="field-underline" class="icon icon-tabler icon-tabler-underline" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <line x1="6" y1="20" x2="18" y2="20" />
          <path d="M8 5v6a4 4 0 0 0 8 0v-6" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" id="field-justifyleft"  class="icon icon-tabler icon-tabler-align-left" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="14" y2="12" />
          <line x1="4" y1="18" x2="18" y2="18" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" id="field-justifycenter" class="icon icon-tabler icon-tabler-align-center" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="6" y1="18" x2="18" y2="18" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" id="field-justifyright"  class="icon icon-tabler icon-tabler-align-right" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="10" y1="12" x2="20" y2="12" />
          <line x1="6" y1="18" x2="20" y2="18" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" id="field-insertunorderedlist" class="icon icon-tabler icon-tabler-list" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <line x1="9" y1="6" x2="20" y2="6" />
          <line x1="9" y1="12" x2="20" y2="12" />
          <line x1="9" y1="18" x2="20" y2="18" />
          <line x1="5" y1="6" x2="5" y2="6.01" />
          <line x1="5" y1="12" x2="5" y2="12.01" />
          <line x1="5" y1="18" x2="5" y2="18.01" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" id="field-outdent"  class="icon icon-tabler icon-tabler-indent-decrease" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <line x1="20" y1="6" x2="13" y2="6" />
          <line x1="20" y1="12" x2="11" y2="12" />
          <line x1="20" y1="18" x2="13" y2="18" />
          <path d="M8 8l-4 4l4 4" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" id="field-indent"  class="icon icon-tabler icon-tabler-indent-increase" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <line x1="20" y1="6" x2="9" y2="6" />
          <line x1="20" y1="12" x2="13" y2="12" />
          <line x1="20" y1="18" x2="9" y2="18" />
          <path d="M4 8l4 4l-4 4" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" id="field-cut"  class="icon icon-tabler icon-tabler-cut" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <circle cx="7" cy="17" r="3" />
          <circle cx="17" cy="17" r="3" />
          <line x1="9.15" y1="14.85" x2="18" y2="4" />
          <line x1="6" y1="4" x2="14.85" y2="14.85" />
        </svg>
        <svg id="field-color" xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-color-picker" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <line x1="11" y1="7" x2="17" y2="13" />
          <path d="M5 19v-4l9.7 -9.7a1 1 0 0 1 1.4 0l2.6 2.6a1 1 0 0 1 0 1.4l-9.7 9.7h-4" />
        </svg>
        <svg id="field-backgroundColor" xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-color-swatch" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <path d="M19 3h-4a2 2 0 0 0 -2 2v12a4 4 0 0 0 8 0v-12a2 2 0 0 0 -2 -2" />
          <path d="M13 7.35l-2 -2a2 2 0 0 0 -2.828 0l-2.828 2.828a2 2 0 0 0 0 2.828l9 9" />
          <path d="M7.3 13h-2.3a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h12" />
          <line x1="17" y1="17" x2="17" y2="17.01" />
        </svg>
   </div>
   <div class="field-textarea-wrapper">
      <div class="field-textarea" contenteditable="true" spellcheck="false">
   </div>
  </div>
</div>`;


function formatDoc(sCmd, sValue) {
  document.execCommand(sCmd, false, sValue); oDoc.focus();
}

class FieldView extends PartView {
    constructor(){
        super();

        // this.editorCompleter = this.simpleTalkCompleter;
        this.editorCompleter = null;

        this.template = document.createElement('template');
        this.template.innerHTML = templateString;
        this._shadowRoot = this.attachShadow({mode: 'open'});
        this._shadowRoot.appendChild(
            this.template.content.cloneNode(true)
        );

        // Bind methods
        this.onInput = this.onInput.bind(this);
        this.onClick = this.onClick.bind(this);
        this.textToHtml = this.textToHtml.bind(this);
        this.setupPropHandlers = this.setupPropHandlers.bind(this);
        this.setUpToolbar = this.setUpToolbar.bind(this);
        this._toolbarHandler = this._toolbarHandler.bind(this);
        this.setEditorMode = this.setEditorMode.bind(this);
        this.simpleTalkCompleter = this.simpleTalkCompleter.bind(this);
        this.initCustomHaloButton = this.initCustomHaloButton.bind(this);
        this.toggleMode = this.toggleMode.bind(this);
        this.toggleModePartProperty = this.toggleModePartProperty.bind(this);
        this.openColorWheelWidget = this.openColorWheelWidget.bind(this);
        this.onColorSelected = this.onColorSelected.bind(this);

        this.setupPropHandlers();
    }

    setupPropHandlers(){
        // When the htmlContent changes I update the textContent property
        // this way anything that depends on the underlying content can
        // access it directly
        this.onPropChange('htmlContent', (value, id) => {
            this.model.partProperties.setPropertyNamed(
                this.model,
                'textContent',
                this.htmlToText(this.textarea)
            );
        });
        this.onPropChange('mode', (value, id) => {
            this.toggleMode(value);
        });
    }

    afterConnected(){
        this.textarea = this._shadowRoot.querySelector('.field-textarea');
        this.textareaWrapper = this._shadowRoot.querySelector('.field-textarea-wrapper');
        this.textarea.addEventListener('input', this.onInput);
        this.textarea.focus();
        // document.execCommand("defaultParagraphSeparator", false, "br");
        this.setUpToolbar();
        // prevent the default tab key to leave focus on the field
        this.addEventListener("keydown", (event) => {
            if(event.key==="Tab"){
                event.preventDefault();
                document.execCommand('insertHTML', false, '&#x9');
            };
        });
        this.addEventListener('click', this.onClick);
        if(!this.haloModeButton){
            this.initCustomHaloButton();
        }
    }

    afterDisconnected(){
        this.textarea.removeEventListener('input', this.onInput);
        this.removeEventListener('click', this.onClick);
    }

    afterModelSet(){
        // If we have a model, set the value of the textarea
        // to the current text of the field model
        this.textarea = this._shadowRoot.querySelector('.field-textarea');
        let htmlContent = this.model.partProperties.getPropertyNamed(
            this.model,
            'htmlContent'
        );
        this.textarea.innerHTML = htmlContent;
        // set the textContent property
        this.model.partProperties.setPropertyNamed(
            this.model,
            'textContent',
            this.htmlToText(this.textarea)
        );
        // set the editing mode
        let mode = this.model.partProperties.getPropertyNamed(this.model, "mode");
        this.toggleMode(mode);
    }

    setUpToolbar(){
        let toolbar = this._shadowRoot.querySelector('.field-toolbar');
        toolbar.childNodes.forEach((node) => {
            // current id contains the command and the value, maybe this is too implicit
            // format "field-command-value"
            // TODO
            if(node.id){
                let [_, command, value] = node.id.split("-");
                let eventName = "click";
                if(command === "fontsize"){
                    eventName = "change";
                }
                node.addEventListener(eventName, (event) => {this._toolbarHandler(event, command, value);})
            }
        });
    }

    _toolbarHandler(event, command, value){
        if(command === "clean"){
            if(confirm('Are you sure?')){
                this.textarea.innerHTML = "";
            };
            return true;
        } else if(["fontsize", "fontname"].indexOf(command) > -1){
            value = event.target.value;
        } else if(["color", "backgroundColor"].indexOf(command) > -1){
            this.openColorWheelWidget(event, command);
        } else if(command === "mode"){
            this.setEditorMode(event.target.value);
            return true;
        }
        // execute the command
        document.execCommand(command, false, value);
        this.model.partProperties.setPropertyNamed(
            this.model,
            'htmlContent',
            this.htmlToText(this.textarea)
        );
        this.textarea.focus();
    }

    openColorWheelWidget(event, command){
        let colorWheelWidget = new ColorWheelWidget(command);
        // add an attribute describing the command
        colorWheelWidget.setAttribute("selector-command", command);
        // add a custom callback for the close button
        let closeButton = colorWheelWidget.shadowRoot.querySelector('#close-button');
        closeButton.addEventListener('click', () => {colorWheelWidget.remove()});
        // add the colorWheelWidget
        event.target.parentNode.after(colorWheelWidget);
        // add a color-selected event callback
        // colorWheelWidget event listener
        let colorWheel = this.shadowRoot.querySelector('color-wheel');
        colorWheel.addEventListener('color-selected', this.onColorSelected);
    }

    onColorSelected(event){
        let command = event.target.getAttribute("selector-command");
        let colorInfo = event.detail;
        let colorStr = `rgba(${colorInfo.r}, ${colorInfo.g}, ${colorInfo.b}, ${colorInfo.alpha})`;
        // document.execCommand(command, false, colorStr);
        // TODO maybe this should be a partProperty
        this.textareaWrapper.style[command] = colorStr;
    }

    // I set the selected editor mode, removing or adding corresponding
    // toolbard elements, as well as adding editor helpers/utilities.
    setEditorMode(mode){
        let toolbarElementNames = ["insertorderedlist", "insertunorderedlist", "justifyleft", "justifycenter", "justifyright"];
        let display = "inherit";
        this.editorCompleter = undefined;
        // spellcheck
        this.textarea.setAttribute("spellcheck", "true");
        if(mode === "SimpleTalk"){
            display = "none";
            // this.editorCompleter = this.simpleTalkCompleter;
            this.textarea.setAttribute("spellcheck", "false");
        }
        toolbarElementNames.forEach((name) => {
            let idSelector = "#field-" + name;
            let element = this._shadowRoot.querySelector(idSelector);
            element.style.display = display;
        });
    }

    simpleTalkCompleter(element){
        let textContent = this.htmlToText(element);
        let startOfHandlerRegex = /^on\s(\w+)(\s|\n)+$/;
        let match = textContent.match(startOfHandlerRegex);
        if(match){
            let messageName = match[1];
            // if input break is a new line then an extra
            // <div></br></div> has beed added into the elemen alreadyt
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
            if(text.includes("\n")){
                text = "<div>" + text + "<br></div>";
                return text.replace(/\n/g, "</div><div>");
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

        let innerHTML = event.target.innerHTML;

        if(this.editorCompleter){
            innerHTML = this.editorCompleter(event.target);
        }

        this.model.partProperties.setPropertyNamed(
            this.model,
            'htmlContent',
            innerHTML
        );
    }

    onClick(event){
        if(event.button == 0){
            // if the shift key is pressed we toggle the halo
            if(event.shiftKey){
                event.preventDefault();
                event.stopPropagation();
                if(this.hasOpenHalo){
                    this.closeHalo();
                    // toolbar.style.top = `${toolbar.clientHeight + 5}px`;
                    // toolbar.style.visibility = "hidden";
                } else {
                    this.openHalo();
                    // toolbar.style.top = `-${toolbar.clientHeight + 5}px`;
                    // toolbar.style.visibility = "unset";
                }
            }
        }

    }
    initCustomHaloButton(){
        this.haloModeButton = document.createElement('div');
        this.haloModeButton.id = "halo-field-toggle-mode";
        this.haloModeButton.classList.add('halo-button');
        this.haloModeButton.innerHTML = haloModeButtonSVG;
        this.haloModeButton.style.marginRight = "6px";
        this.haloModeButton.setAttribute('slot', 'bottom-row');
        this.haloModeButton.setAttribute('title', 'Toggle field tools');
        this.haloModeButton.addEventListener('click', this.toggleModePartProperty);
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

    /*
     * I toggle the editing mode of field, by setting the 'mode'
     * partProperty to either "viewing" or "editing."
     */
    toggleModePartProperty(){
        let currentMode = this.model.partProperties.getPropertyNamed(this.model, "mode");
        let nextMode = 'editing'; // By default, set to editing
        if(currentMode === 'editing'){
            nextMode = 'viewing';
        }
        this.model.partProperties.setPropertyNamed(
            this.model,
            'mode',
            nextMode
        );
    }

    /*
     * I toggle the editing mode of field and toolbar, by setting
     * the opacity of toolbar to 0 or 1 and conteneditable of textarea to
     * false or true, respectively.
     */
    toggleMode(mode){
        let toolbar = this._shadowRoot.querySelector('.field-toolbar');
        if(mode === "viewing"){
            toolbar.style.opacity = "0";
            this.textarea.setAttribute("contenteditable", "false");
        } else if(mode === "editing") {
            toolbar.style.opacity = "1";
            this.textarea.setAttribute("contenteditable", "true");
        } else {
            throw `Unkown field mode ${mode}`;
        }
    }
};

export {
FieldView,
FieldView as default
};
