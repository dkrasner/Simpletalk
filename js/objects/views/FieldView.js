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
import cssStyler from '../utils//styler.js';
import ColorWheelWidget from './drawing/ColorWheelWidget.js';
import interpreterSemantics from '../../ohm/interpreter-semantics.js';
import createHighlighter from '../utils/AltSyntaxHighlighter.js';

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
            height: 100%;
            width: 100%;
            white-space: pre-wrap;
            overflow-wrap: anywhere;
        }

        /* Syntax Highlighting
 *---------------------------------------------------*/
span[data-st-rule="messageName"]{
    text-decoration: underline;
}

span[data-st-rule="keyword"]{
    font-weight: bold;
}

span[data-st-rule="ParameterList-item"]{
    font-style: italic;
    color: grey;
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
        this.textStyler = cssStyler;  // we might want to consider a more programmatic way to set this
        this.editorCompleter = null;
        this.contextMenuOpen = false;
        this.haloLockUnlockButton = null;
        this.selectionRanges = {};

        // Presets for syntax highlighting.
        // When highlighting is enabled, we will check
        // each line of the text for the following
        // grammatical rules:
        this._syntaxRules = [
            "MessageHandlerOpen",
            "MessageHandlerClose"
        ];

        this.template = document.createElement('template');
        this.template.innerHTML = fieldTemplateString;
        this._shadowRoot = this.attachShadow({mode: 'open'});
        this._shadowRoot.appendChild(
            this.template.content.cloneNode(true)
        );

        // Bind methods
        this.onInput = this.onInput.bind(this);
        this.onBeforeInput = this.onBeforeInput.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onKeydown = this.onKeydown.bind(this);
        this.onMousedown = this.onMousedown.bind(this);
        this.openContextMenu = this.openContextMenu.bind(this);
        this.closeContextMenu = this.closeContextMenu.bind(this);
        this.doIt = this.doIt.bind(this);
        this.handleSelection = this.handleSelection.bind(this);
        this.openField = this.openField.bind(this);
        this.textToHtml = this.textToHtml.bind(this);
        this.setupPropHandlers = this.setupPropHandlers.bind(this);
        this.simpleTalkCompleter = this.simpleTalkCompleter.bind(this);
        this.initCustomHaloButtons = this.initCustomHaloButtons.bind(this);
        this.insertRange = this.insertRange.bind(this);
        this.setRangeInTarget = this.setRangeInTarget.bind(this);
        this.setSelection = this.setSelection.bind(this);
        this.highlightSyntax = this.highlightSyntax.bind(this);
        this.unhighlightSyntax = this.unhighlightSyntax.bind(this);

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
        // 'text' is a DynamicProp whose setter will set the corresponding
        // value for `innerHTML`. This way we can have programmatic content
        // setting and still allow to not loose markup.
        // 'innerHTML' is a BasicProp. See how these are set, without
        // notification in this.onInput()
        this.onPropChange('innerHTML', (value, id) => {
            this.textarea.innerHTML = value;
            this.model.partProperties.setPropertyNamed(
                this.model,
                "text",
                this.textarea.innerText,
                false // do not notify, to avoid an infinite loop
            );
        });
    }

    afterConnected(){
        // The events here are added via the .addEventListener() API which is
        // distinct from the this.eventRespond() which uses the DOM element
        // element.onEvent API. This allows us to distnguish between "core"
        // system-web events that we don't want meddled with at the moment, like
        // entering text in a field, and ones exposed in the environemnt for scripting
        this.textarea = this._shadowRoot.querySelector('.field-textarea');

        this.textarea.addEventListener('input', this.onInput);
        //this.textarea.addEventListener('beforeinput', this.onBeforeInput);
        this.textarea.addEventListener('keydown', this.onKeydown);
        this.textarea.addEventListener('mousedown', this.onMousedown);
        // No need to add a click listener as the base PartView class does that

        // in order to deal with range insertions (for styling text fragments within
        // the textarea), we need to have the default paragraph tag = </br>. Otherwise
        // the insert new line is of the form <div></br><div> which causes the appearance
        // of newlines when nodes are inserted into a range
        //document.execCommand("defaultParagraphSeparator", false, "st-line");
    }

    afterDisconnected(){
        this.textarea.removeEventListener('input', this.onInput);
        //this.textarea.removeEventListener('beforeinput', this.onBeforeInput);
        this.textarea.removeEventListener('keydown', this.onKeydown);
        this.textarea.removeEventListener('mousedown', this.onMousedown);
    }

    afterModelSet(){
        this.textarea = this._shadowRoot.querySelector('.field-textarea');
        // If we have a model, set the value of the textarea
        // to the current html of the field model
        let innerHTML = this.model.partProperties.getPropertyNamed(
            this.model,
            'innerHTML'
        );
        this.textarea.innerHTML = innerHTML;

        let isEditable = this.model.partProperties.getPropertyNamed(this.model, "editable");
        this.textarea.setAttribute('contenteditable', isEditable);

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
            let innerHTML = this.textToHtml(textContent);
            element.insertAdjacentHTML("beforeend", innerHTML);
        }
        return element.innerHTML;
    }

    /*
     * I override my base-class's implementation to handle target related functionality
     */
    styleTextCSS(){
        let textarea = this._shadowRoot.querySelector('.field-textarea');
        let cssStyle = this.model.partProperties.getPropertyNamed(this, "cssTextStyle");
        Object.keys(cssStyle).forEach((key) => {
            let value = cssStyle[key];
            textarea.style[key] = value;
        });
        // if there is a target and range set then send the target an update message
        let target = this.model.partProperties.getPropertyNamed(this.model, 'target');
        if(target){
            this.setRangeInTarget(target, this.textarea.innerHTML, cssStyle);
        }
    }

    /*
     * set a text-* property on selection to style the selected text
     * Note: this is done for every current selection, i.e. everthing
     * in this.selectionRanges
     */
    setSelection(propName, value){
        Object.values(this.selectionRanges).forEach((range) => {
            let currentStyle = {};
            // // if the document fragment has one child node and it's a span
            // // we should style that directly. This avoids unncessary DOM elements
            // // being created to wrap the contents, such as when styling is continually
            // // applied ot the same selection
            // let span;
            // if(docFragment.childNodes.length == 1 && docFragment.childNodes[0].nodeName == "SPAN"){
            //     span = docFragment.childNodes[0];
            //     // Note the use of Obejct.values here for the DOM style attribute object
            //     // that's weird
            //     Object.values(span.style).forEach((key) => {
            //         currentStyle[key] = span.style[key];
            //     });
            // } else {
            //     // we need to create a span element to wrap the contents in style
            //     span = document.createElement('span');
            //     // While tempting to use range.surroundContents() avoid this
            //     // since it will fail with a non-informative error if the range
            //     // includes partial nodes (ex text across various nodes)
            //     while (docFragment.childNodes.length){
            //         span.appendChild(docFragment.childNodes[0]);
            //     }
            // }
            let span = document.createElement('span');
            let cssObject = this.textStyler(currentStyle, propName, value);
            Object.keys(cssObject).forEach((key) => {
                span.style[key] = cssObject[key];
            });

            span.append(range.extractContents());
            range.insertNode(span);
            
            this.model.partProperties.setPropertyNamed(
                this.model,
                'innerHTML',
                this.textarea.innerHTML,
                false // do not notify
            );
            // if there is a target and range set then send the target an update message
            let target = this.model.partProperties.getPropertyNamed(this.model, 'target');
            if(target){
                this.setRangeInTarget(target, this.textarea.innerHTML);
            }
        });
    }

    onBeforeInput(event){
        let selection = document.getSelection();
        let selectedRange = selection.getRangeAt(0);
        let range = selectedRange.cloneRange();

        let innerHTML = event.target.innerHTML;
        if(!innerHTML.endsWith("<div><br></div>")){
            innerHTML += "<div><br></div>";
            event.target.innerHTML = innerHTML;
        }
        
        if(event.inputType == "insertParagraph"){
            //event.stopPropagation();
            event.preventDefault();

            let br = document.createElement('br');
            let br2 = document.createElement('br');
            range.insertNode(br);
            range.collapse(false);
            range.insertNode(br2);
            range.setStartAfter(br2);
            range.setEndAfter(br2);
        }
    }

    onInput(event){
        let innerHTML = event.target.innerHTML;
        /*
        if(!innerHTML.endsWith("<br>")){
            innerHTML += "<br>";
            event.target.innerHTML = innerHTML;
        }
        */

        if(this.editorCompleter){
            // TODO sort out how this would work
            let innerHTML = event.target.innerHTML;
            innerHTML = this.editorCompleter(event.target);
        }

        this.model.partProperties.setPropertyNamed(
            this.model,
            'text',
            event.target.innerText,
            false // do not notify, to preserve contenteditable context
        );
        this.model.partProperties.setPropertyNamed(
            this.model,
            'innerHTML',
            event.target.innerHTML,
            false // do not notify
        );
        // Since we update the 'text' property without notification, the part/model
        // is not sent the "propertyChanged" message so we do so manually
        this.model.propertyChanged("text", event.target.innerText);
        // if there is a target and range set then send the target an update message
        let target = this.model.partProperties.getPropertyNamed(this.model, 'target');
        if(target){
            this.setRangeInTarget(target, event.target.innerHTML);
        }
    }

    onKeydown(event){
        // prevent the default tab key to leave focus on the field
        if(event.key==="Tab" || event.key === "Enter"){
            let tabNodeValue = '\t';
            if (event.key === "Enter") {
                tabNodeValue = '\n';
            }
            event.preventDefault();
            //document.execCommand('insertHTML', false, '&#x9');
            const sel = document.getSelection();
            const range = sel.getRangeAt(0);

            const tabNode = document.createTextNode(tabNodeValue);

            range.insertNode(tabNode);

            range.setStartAfter(tabNode);
            range.setEndAfter(tabNode);
        };
    }

    onMousedown(event){
        // clear all selections
        this.selectionRanges = {};
    }
    onClick(event){
        event.preventDefault();
        event.stopPropagation();
        if(event.button == 0){
            // if the shift key is pressed we toggle the halo
            if(event.shiftKey){
                this.onHaloActivationClick(event);
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
                        this.handleSelection(event.metaKey);
                    }
                } else {
                    // make sure no context menu is open
                    if(this.contextMenuOpen){
                        this.closeContextMenu();
                    }
                    // clear all the selections
                    this.selectionRanges = {};
                }
            }
        }
    }

    /* I handle selected text, creating a new field model/view
     * for every range in the selection, keeping track of every range
     * in this.selection Object/dict so that modification can be inserted
     * back into the corresponding ranges.
     */
    handleSelection(openNewField){
        let selection = window.getSelection();
        for(let i=0; i < selection.rangeCount; i++){
            // make sure this is not a continuing selection
            // and that the range is not already registered
            let range = selection.getRangeAt(i);
            let currentRanges = Object.values(this.selectionRanges);
            if(currentRanges.indexOf(range) >= 0){
                continue;
            }
            // we generate our own range ids, since we want this to correspond to
            // selection order which is not respected by the browser selection object
            // to ensure we don't hit on other views' ranges by accident we need unique id's
            let rangeId = Date.now(); //TODO we need a better random id
            this.selectionRanges[rangeId] = range;
            if(openNewField){
                // open a field for each new selection and populate it with the range html
                this.openField(range, rangeId);
            }
        }
    }

    openField(range, rangeId){
        // create an HTML document fragment from the range to avoid dealing wiht start/end
        // and offset calculations
        // fragments don't have the full html DOM element API so we need to create one
        let span = document.createElement('span');
        span.appendChild(range.cloneContents());

        // TODO these should all be messages and correspnding command handler definitions
        // should be part of the field's own script
        let fieldModel = window.System.newModel("field", this.model._owner.id, `selection ${rangeId}`);
        fieldModel.partProperties.setPropertyNamed(fieldModel, "innerHTML", span.innerHTML);
        fieldModel.partProperties.setPropertyNamed(fieldModel, "target", `field id ${this.model.id}`);
        fieldModel.partProperties.setPropertyNamed(fieldModel, "targetRangeId", rangeId);
    }

    /**
      * Given a tagrget specifier and html
      * I first look up to make sure that the target has the corresponding
      * range (coming from the targetRangeId property), and then set it with my
      * innerHTML. Note, since the target property value is an object specifier I
      * create a semantics objects and interpret the value resulting in a valid
      * part id.
      */
    setRangeInTarget(targetSpecifier, html, css){
        let targetRangeId = this.model.partProperties.getPropertyNamed(this.model, 'targetRangeId');
        let match = window.System.grammar.match(targetSpecifier, "ObjectSpecifier");
        let semantics = window.System.grammar.createSemantics();
        semantics.addOperation('interpret', interpreterSemantics(this.model, window.System));
        let targetId = semantics(match).interpret();

        this.model.sendMessage({
            type: "command",
            commandName: "insertRange",
            args: [targetRangeId, html, css]
        }, window.System.partsById[targetId]);
    }

    /*
     * I insert the html (string) into the specified range (by id)
     */
    insertRange(rangeId, html, cssObj){
        let range = this.selectionRanges[rangeId];
        if(range){
            let span = document.createElement('span');
            span.innerHTML = html;
            if(cssObj){
                Object.keys(cssObj).forEach((key) => {
                    let value = cssObj[key];
                    span.style[key] = value;
                });
            }
            range.deleteContents();
            range.insertNode(span);
            // update the text and innerHTML properties without notification
            // to prevent unnecessary setting of the text/html
            this.model.partProperties.setPropertyNamed(
                this.model,
                'text',
                this.textarea.innerText,
                false // do not notify, to preserve contenteditable context
            );
            this.model.partProperties.setPropertyNamed(
                this.model,
                'innerHTML',
                this.textarea.innerHTML,
                false // do not notify
            );
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
        // clean up the text to make sure no newlines or spaces made it in
        text = text.replace(/^[\t\n ]+/, "");
        text = text.replace(/[\t\n ]+$/, "");
        this.closeContextMenu();
        // cache the current script to re-set after the doIt command is run
        const currentScript = this.model.partProperties.getPropertyNamed(this.model, "script");
        // send message to compile the prepped script
        let script = `on doIt\n   ${text}\nend doIt`;
        // send these messages from the model (not the view)
        // since if there is an error the original sender will
        // have an id
        this.model.sendMessage(
            {
                type: "compile",
                codeString: script,
                targetId: this.model.id
            },
            this.model
        );
        this.model.sendMessage(
            {
                type: "command",
                commandName: "doIt",
                args: [],
                shouldIgnore: true // Should ignore if System DNU
            },
            this.model
        );
        //reset the currentScript
        this.model.sendMessage(
            {
                type: "compile",
                codeString: currentScript,
                targetId: this.model.id
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
        window.System.openEditorForPart(this.model.id);
    }

    closeEditor(){
        window.System.closeEditorForPart(this.model.id);
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

    highlightSyntax(){
        let current = this.getAttribute("syntax");
        if(current && current !== "false"){
            this.unhighlightSyntax();
        }
        let semantics = window.System.grammar.createSemantics();
        semantics.addOperation(
            "highlightSyntax",
            createHighlighter(this)
        );
        let text = this.model.partProperties.getPropertyNamed(
            this.model,
            "text"
        );
        if(!text){
            return;
        }
        let newHTML = text.split("\n").map(line => {
            // Loop through each rule and try to match
            for(let i = 0; i < this._syntaxRules.length; i++){
                let rule = this._syntaxRules[i];
                let match = window.System.grammar.match(line, rule);
                if(match.succeeded()){
                    return semantics(match).highlightSyntax().outerHTML;
                }
            }
            return line;
        }).join("\n");

        this.model.partProperties.setPropertyNamed(
            this.model,
            "innerHTML",
            newHTML
        );

        this.toggleAttribute("syntax", true);
    }

    unhighlightSyntax(){
        let text = this.model.partProperties.getPropertyNamed(
            this.model,
            "text"
        );
        if(!text){
            return;
        }
        let plainElements = text.split("\n").map(line => {
            let div = document.createElement("div");
            div.innerText = line;
            return div;
        });
        let finalLine = document.createElement("div");
        finalLine.append(document.createElement("br"));
        plainElements.push(finalLine);

        let newHTML = "";
        plainElements.forEach(element => {
            newHTML += element.outerHTML;
        });

        this.model.partProperties.setPropertyNamed(
            this.model,
            "innerHTML",
            newHTML
        );

        this.toggleAttribute("syntax", false);
    }
};

export {
    FieldView,
    FieldView as default
};
