/**
 * PartView
 * ----------------------------------------
 * I am an *abstract* webcompoent CustomElement
 * that serves as the generic view for any Part
 * models.
 * I should not be instantiated directly, nor should
 * I be added to any web page's registry of CustomElements.
 * I am indended to be extended (subclassed) by the actual
 * views for each Part kind, and therefore I contain all
 * of the common behavior, including lifecycle methods,
 * for these.
 */
import ContextMenu from './contextmenu/ContextMenu.js';
import interpreterSemantics from '../../ohm/interpreter-semantics.js';

window.customElements.define('st-context-menu', ContextMenu);

class PartView extends HTMLElement {
    constructor(){
        super();
        this.model = null;
        this.isPartView = true;
        this.isLensed = false;
        this.name = this.constructor.name;
        this.propChangeHandlers = {};
        this.setupBasePropHandlers();
        this.viewChangeHandlers = {};
        this.setupBaseViewChangeHandlers();

        // Halo settings. All are on by default
        this.wantsHaloResize = true;
        this.wantsHaloRotate = true;
        this.wantsHaloScriptEdit = true;
        this.wantsHaloEdit = true;
        this.wantsHaloDelete = true;
        this.wantsHalo = true;
        // Note: see getter for wantsHaloMove

        // Context menu settings
        this.wantsContextMenu = true;

        // Bind component methods
        this.setModel = this.setModel.bind(this);
        this.unsetModel = this.unsetModel.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.setupBasePropHandlers = this.setupBasePropHandlers.bind(this);
        this.setupBaseViewChangeHandlers = this.setupBaseViewChangeHandlers.bind(this);
        this.initLayout = this.initLayout.bind(this);

        // Bind initial property method
        this.styleCSS = this.styleCSS.bind(this);
        this.styleTextCSS = this.styleTextCSS.bind(this);

        // Bind property change reaction methods
        this.primHandlePropChange = this.primHandlePropChange.bind(this);
        this.onPropChange = this.onPropChange.bind(this);
        this.primHandleViewChange = this.primHandleViewChange.bind(this);
        this.onViewChange = this.onViewChange.bind(this);
        this.scriptChanged = this.scriptChanged.bind(this);
        this.layoutChanged = this.layoutChanged.bind(this);
        this.listDirectionChanged = this.listDirectionChanged.bind(this);
        this.listWrappingChanged = this.listWrappingChanged.bind(this);
        this.vResizingChanged = this.vResizingChanged.bind(this);
        this.hResizingChanged = this.hResizingChanged.bind(this);
        this.pinningLeftChanged = this.pinningLeftChanged.bind(this);
        this.pinningTopChanged = this.pinningTopChanged.bind(this);
        this.pinningBottomChanged = this.pinningBottomChanged.bind(this);
        this.pinningRightChanged = this.pinningRightChanged.bind(this);
        this.listAlignmentChanged = this.listAlignmentChanged.bind(this);
        this.listDistributionChanged = this.listDistributionChanged.bind(this);

        // Bind view change reaction methods
        this.subpartOrderChanged = this.subpartOrderChanged.bind(this);
        this.newSubpartView = this.newSubpartView.bind(this);

        // Bind Halo related methods
        this.openHalo = this.openHalo.bind(this);
        this.closeHalo = this.closeHalo.bind(this);
        this.onHaloDelete = this.onHaloDelete.bind(this);
        this.onHaloOpenEditor = this.onHaloOpenEditor.bind(this);
        this.onHaloOpenScriptEditor = this.onHaloOpenScriptEditor.bind(this);
        this.onHaloResize = this.onHaloResize.bind(this);
        this.onHaloRotate = this.onHaloRotate.bind(this);
        this.onHaloPaste = this.onHaloPaste.bind(this);
        this.onHaloCopy = this.onHaloCopy.bind(this);
        this.onHaloTarget = this.onHaloTarget.bind(this);
        this.endHaloTarget = this.endHaloTarget.bind(this);
        this.onHaloTargetButtonMouseEnter = this.onHaloTargetButtonMouseEnter.bind(this);
        this.onHaloTargetButtonMouseLeave = this.onHaloTargetButtonMouseLeave.bind(this);
        this.onHaloActivationClick = this.onHaloActivationClick.bind(this);
        this.onHaloOpenEditor = this.onHaloOpenEditor.bind(this);
        this.onAuxClick = this.onAuxClick.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onContextMenuClick = this.onContextMenuClick.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.handleTargetKey = this.handleTargetKey.bind(this);
        this.handleTargetMouseClick = this.handleTargetMouseClick.bind(this);
        this.handleTargetMouseOver = this.handleTargetMouseOver.bind(this);
        this.handleTargetMouseOut = this.handleTargetMouseLeave.bind(this);
        this.addContextMenuItems = this.addContextMenuItems.bind(this);
        this.getCurrentTargetViews = this.getCurrentTargetViews.bind(this);

        // Bind editor related methods
        this.openEditor = this.openEditor.bind(this);
        this.closeEditor = this.closeEditor.bind(this);

        // Context menu
        this.openContextMenuAt = this.openContextMenuAt.bind(this);
        this.closeContextMenu = this.closeContextMenu.bind(this);

        // misc
        this.highlight = this.highlight.bind(this);
        this.unhighlight = this.unhighlight.bind(this);

        // Bind lifecycle methods
        this.afterModelSet = this.afterModelSet.bind(this);
        this.afterModelUnset = this.afterModelUnset.bind(this);
        this.afterConnected = this.afterConnected.bind(this);
        this.afterDisconnected = this.afterDisconnected.bind(this);
    }

    connectedCallback(){
        if(this.isConnected){
            // Do some universal PartView configuration
            // when attached to a parent element, like
            // registering event listeners etc

            // Register middle mouse button click
            // to toggle the halo
            this.addEventListener('auxclick', this.onAuxClick);

            // Register default event handlers manually]
            this.addEventListener('click', this.onClick);
            this.addEventListener('contextmenu', this.onContextMenuClick);

            // Call the lifecycle method when done
            // with the above
            this.afterConnected();
        }
    }

    disconnectedCallback(){
        this.removeEventListener('auxclick', this.onAuxClick);
        this.removeEventListener('click', this.onClick);
        this.removeEventListener('contextmenu', this.onContextMenuClick);
        this.afterDisconnected();
    }

    setModel(aModel){
        this.unsetModel();
        this.model = aModel;
        aModel.addPropertySubscriber(this);
        aModel.addViewSubscriber(this);
        if(this.isLensed){
            this.removeAttribute('part-id');
            this.setAttribute('lens-part-id', aModel.id);
        } else {
            this.removeAttribute('lens-part-id');
            this.setAttribute('part-id', aModel.id);
        }

        // load all the initial styling
        this.styleCSS();
        this.styleTextCSS();
        this.initLayout();

        // deal with 'special' props
        let wantsMove = this.model.partProperties.getPropertyNamed(
            this.model,
            "wants-move"
        );
        if(wantsMove){
            this.addEventListener('mousedown', this.onMouseDown);
        }

        let haloOpen = this.model.partProperties.findPropertyNamed(
            "halo-open"
        );
        if(haloOpen && haloOpen._value){
            this.openHalo();
        }

        this.afterModelSet();
    }

    unsetModel(){
        if(this.model){
            let removedModel = this.model;
            this.model.removePropertySubscriber(this);
            this.model = null;
            this.setAttribute('part-id', "");
            this.afterModelUnset(removedModel);
        }
    }

    setupBasePropHandlers(){
        // This is where we should setup any
        // prop change handlers that are universal
        // to all PartViews. We would do this via
        // the #onPropChange method, which registers
        // a handler function.
        // Do not override this method
        // TODO: Implement the universals
        this.onPropChange('script', this.scriptChanged);
        this.onPropChange('number', this.numberChanged);
        this.onPropChange('cssStyle', this.styleCSS);
        this.onPropChange('cssTextStyle', this.styleTextCSS);
        this.onPropChange('layout', this.layoutChanged);
        this.onPropChange('list-direction', this.listDirectionChanged);
        this.onPropChange('list-wrapping', this.listWrappingChanged);
        this.onPropChange('list-alignment', this.listAlignmentChanged);
        this.onPropChange('list-distribution', this.listDistributionChanged);
        this.onPropChange('horizontal-resizing', this.hResizingChanged);
        this.onPropChange('vertical-resizing', this.vResizingChanged);
        this.onPropChange('pinning-top', this.pinningTopChanged);
        this.onPropChange('pinning-right', this.pinningRightChanged);
        this.onPropChange('pinning-left', this.pinningLeftChanged);
        this.onPropChange('pinning-bottom', this.pinningBottomChanged);
        this.onPropChange('wants-move', (value) => {
            if(value){
                this.addEventListener('mousedown', this.onMouseDown);
            } else {
                this.removeEventListener('mousedown', this.onMouseDown);
            }
        });
        this.onPropChange('halo-open', (value) => {
            if(value){
                this.openHalo();
            } else {
                this.closeHalo();
            }
        });
        this.onPropChange('editor-open', (value) => {
            if(value){
                this.openEditor();
            } else {
                this.closeEditor();
            }
        });
    }

    setupBaseViewChangeHandlers(){
        // This is where we should setup any
        // view change handlers that are universal
        // to all PartViews. We would do this via
        // the #onViewChange method, which registers
        // a handler function.
        // Do not override this method
        this.onViewChange('subpart-order', this.subpartOrderChanged);
        this.onViewChange('subpart-new', this.newSubpartView);
    }

    initLayout(){
        // Not all Part/PartView pairs have the layout
        // properties. Ensure they exist first
        let hasLayout = this.model.partProperties.findPropertyNamed('layout');
        let hasBoxResizing = this.model.partProperties.findPropertyNamed('vertical-resizing');
        let hasPinning = this.model.partProperties.findPropertyNamed('pinning');
        if(hasLayout){
            let initialLayout = this.model.partProperties.getPropertyNamed(
                this.model,
                'layout'
            );
            let initialListDirection = this.model.partProperties.getPropertyNamed(
                this.model,
                'list-direction'
            );
            let initialListWrapping = this.model.partProperties.getPropertyNamed(
                this.model,
                'list-wrapping'
            );
            this.layoutChanged(initialLayout);
            this.listDirectionChanged(initialListDirection);
            this.listWrappingChanged(initialListWrapping);
            this.listAlignmentChanged();
            this.listDistributionChanged();
        }

        if(hasBoxResizing){
            let initialVResizing = this.model.partProperties.getPropertyNamed(
                this.model,
                'vertical-resizing'
            );
            let initialHResizing = this.model.partProperties.getPropertyNamed(
                this.model,
                'horizontal-resizing'
            );
            this.vResizingChanged(initialVResizing);
            this.hResizingChanged(initialHResizing);
        }

        if(hasPinning){
            this.pinningTopChanged();
            this.pinningBottomChanged();
            this.pinningLeftChanged();
            this.pinningRightChanged();
        }
    }

    styleCSS(){
        let cssStyle = this.model.partProperties.getPropertyNamed(this, "cssStyle");
        Object.keys(cssStyle).forEach((key) => {
            let value = cssStyle[key];
            this.style[key] = value;
        });
    }

    styleTextCSS(){
        let cssStyle = this.model.partProperties.getPropertyNamed(this, "cssTextStyle");
        Object.keys(cssStyle).forEach((key) => {
            let value = cssStyle[key];
            this.style[key] = value;
        });
    }

    sendMessage(aMessage, target){
        if(!this.isLensed){
            // Lensed views should not send messages
            window.System.sendMessage(aMessage, this, target);
        }
    }

    receiveMessage(aMessage){
        switch(aMessage.type){
        case 'propertyChanged':
            this.primHandlePropChange(
                aMessage.propertyName,
                aMessage.value,
                aMessage.partId
            );
            break;
        case 'viewChanged':
            this.primHandleViewChange(
                aMessage.changeName,
                ...aMessage.args
            );
            break;
        }
    }

    primHandlePropChange(name, value, partId){
        // We notify the model that the property change so that
        // on propertyChanged command handlers could be invoked
        // but we make sure that this stops at the said model and
        // does not go up the delegation chain
        let commandMessage = {
            type: 'command',
            commandName: 'propertyChanged',
            args: [name, value],
            shouldNotDelegate:true, // do not send this up the delegation chain
            shouldIgnore: true
        };
        this.sendMessage(commandMessage, this.model);
        // Find the handler for the given named
        // property. If it does not exist, do nothing
        let handler = this.propChangeHandlers[name];
        if(!handler){
            return null;
        }
        handler = handler.bind(this);
        return handler(value, partId);
    }


    onPropChange(name, func){
        this.propChangeHandlers[name] = func;
    }

    primHandleViewChange(name, ...args){
        // Find the handler for the given named
        // property. If it does not exist, do nothing
        let handler = this.viewChangeHandlers[name];
        if(!handler){
            return null;
        }
        handler = handler.bind(this);
        return handler(...args);
    }

    onViewChange(name, func){
        this.viewChangeHandlers[name] = func;
    }

    scriptChanged(value, partId){
        // make sure that we are only sending the compile
        // message when dealing with a 'core' st-part views (not
        // with navigator or related views)
        if(this.tagName.split("-")[0] != "ST" || this.slot == "wrapped-view"){
            return;
        }
        this.model.sendMessage({
            type: 'compile',
            codeString: value,
            targetId: partId
        }, window.System);
    }

    subpartOrderChanged(id, currentIndex, newIndex){
        // there is no need to do anything for the wrapped views
        // CardRow and StackRow will handle the updates
        if(this.name == "WrappedView"){
            return;
        }
        let subpartNode = this.childNodes[currentIndex];
        if(newIndex == this.childNodes.length - 1){
            this.appendChild(subpartNode);
        } else {
            // we need to account for whether the index of this
            // is before or after the newIndex
            if(currentIndex < newIndex){
                newIndex = newIndex + 1;
            }
            let referenceNode = this.childNodes[newIndex];
            this.insertBefore(subpartNode, referenceNode);
        }
    }

    newSubpartView(newView){
        this.appendChild(newView);
    }

    layoutChanged(value, partId){
        if(value == 'list'){
            this.classList.add('list-layout');
        } else {
            this.classList.remove('list-layout');
        }
    }

    listDirectionChanged(value, partId){
        // Row is the default configuration
        // for a list layout, so only one extra
        // CSS class needs to be toggled
        if(value == 'row'){
            this.classList.remove('list-column');
        } else if(value == 'column'){
            this.classList.add('list-column');
        }
    }

    listWrappingChanged(value, partId){
        if(value == true){
            this.classList.add('wrap-list');
        } else {
            this.classList.remove('wrap-list');
        }
    }

    hResizingChanged(value){
        if(value == 'space-fill'){
            this.classList.add('h-space-fill');
            this.classList.remove(
                'h-rigid',
                'h-shrink-wrap'
            );
        } else if(value == 'shrink-wrap'){
            this.classList.add('h-shrink-wrap');
            this.classList.remove(
                'h-rigid',
                'h-space-fill'
            );
        } else if(value == 'rigid'){
            this.classList.add('h-rigid');
            this.classList.remove(
                'h-space-fill',
                'h-shrink-wrap'
            );
        }
    }

    vResizingChanged(value){
        if(value == 'space-fill'){
            this.classList.add('v-space-fill');
            this.classList.remove(
                'v-rigid',
                'v-shrink-wrap'
            );
        } else if(value == 'shrink-wrap'){
            this.classList.add('v-shrink-wrap');
            this.classList.remove(
                'v-rigid',
                'v-space-fill'
            );
        } else if(value == 'rigid'){
            this.classList.add('v-rigid');
            this.classList.remove(
                'v-space-fill',
                'v-shrink-wrap'
            );
        }
    }

    pinningTopChanged(){
        let top = this.model.partProperties.getPropertyNamed(
            this.model,
            'pinning-top'
        );
        if(top){
            this.classList.add('pin-top');
        } else {
            this.classList.remove('pin-top');
        }
    }

    pinningLeftChanged(){
        let left = this.model.partProperties.getPropertyNamed(
            this.model,
            'pinning-left'
        );
        if(left){
            this.classList.add('pin-left');
        } else {
            this.classList.remove('pin-left');
        }
    }

    pinningRightChanged(){
        let right = this.model.partProperties.getPropertyNamed(
            this.model,
            'pinning-right'
        );
        if(right){
            this.classList.add('pin-right');
        } else {
            this.classList.remove('pin-right');
        }
    }

    pinningBottomChanged(){
        let bottom = this.model.partProperties.getPropertyNamed(
            this.model,
            'pinning-bottom'
        );
        if(bottom){
            this.classList.add('pin-bottom');
        } else {
            this.classList.remove('pin-bottom');
        }
    }

    listAlignmentChanged(){
        let value = this.model.partProperties.getPropertyNamed(
            this.model,
            'list-alignment'
        );
        let valid = [
            'top',
            'bottom',
            'left',
            'right',
            'center'
        ];
        if(valid.includes(value)){
            valid.forEach(side => {
                this.classList.remove(`list-align-${side}`);
            });
            this.classList.add(`list-align-${value}`);
        }
    }

    listDistributionChanged(){
        let value = this.model.partProperties.getPropertyNamed(
            this.model,
            'list-distribution'
        );
        let valid = [
            'start',
            'end',
            'space-between',
            'space-around',
            'center'
        ];
        if(valid.includes(value)){
            valid.forEach(side => {
                this.classList.remove(`list-distribution-${side}`);
            });
            this.classList.add(`list-distribution-${value}`);
        }
    }

    /* Lifecycle Method Defaults */
    afterModelSet(){
        // Does nothing.
        // Should be implemented in subclasses
    }

    afterModelUnset(removedModel){
        // Does nothing.
        // Should be implemented in subclasses
    }

    afterConnected(){
        // Does nothing by default.
        // Should be implemented in subclass
    }

    afterDisconnected(){
        // Does nothing by default.
        // Should be implemented in subclass
    }

    /* Halo Related Methods */

    openHalo(){
        // Check to see if there's a halo in
        // the component's shadow root already
        let foundHalo = this.shadowRoot.querySelector('st-halo');
        if(!foundHalo){
            let newHalo = document.createElement('st-halo');
            this.shadowRoot.appendChild(newHalo);
        }
    }

    closeHalo(){
        let foundHalo = this.shadowRoot.querySelector('st-halo');
        if(foundHalo){
            foundHalo.remove();
        }
    }

    toggleAntsBorder(){
        if(this.classList.contains('marching-ants')){
            this.classList.remove('marching-ants');
        } else {
            this.classList.add('marching-ants');
        }
    }

    onHaloDelete(){
        // What to do when the user clicks the
        // delete button on a halo for this partview.
        // The default implementation is to send a message
        // to the System to delete the corresponding
        // model and *all* views referencing that
        // model.
        this.sendMessage({
            type: 'command',
            commandName: 'deleteModel',
            args: [this.model.id]
        }, this.model);
    }

    onHaloOpenScriptEditor(){
        // Send the message to open a script editor
        // with this view's model as the target
        this.model.sendMessage({
            type: 'command',
            commandName: 'openScriptEditor',
            args: [this.model.id]
        }, this.model);
    }

    onHaloOpenEditor(){
        this.model.partProperties.setPropertyNamed(this.model, "editor-open", true);
    }

    onHaloResize(movementX, movementY){
        // Default implementation on what to do during
        // halo button resize opertations. Subclasses
        // can override for custom behavior.
        // Default is to update the View component's
        // width and height style properties directly.
        // If the part is rotated this will throw off the bounding rectangle
        // browser calcualtion. So the hack here is to rotate the part to 0
        // (if necessary) do the calculations and then rotate it back
        let angle = this.model.partProperties.getPropertyNamed(this.model, "rotate");
        if(angle){
            this.model.partProperties.setPropertyNamed(this.model, "rotate", 0);
        }
        let rect = this.getBoundingClientRect();
        let newWidth, newHeight;
        if(this.preserveAspectOnResize){
            let ratio = rect.width / rect.height;
            let hyp = Math.sqrt((movementX**2) + (movementY**2));
            if(movementX < 0 || movementY < 0){
                hyp = hyp * -1;
            }
            newHeight = rect.height + hyp;
            newWidth = rect.width + hyp;
        } else {
            newWidth = movementX + rect.width;
            newHeight = movementY + rect.height;
        }
        this.model.partProperties.setPropertyNamed(this.model, "width", newWidth);
        this.model.partProperties.setPropertyNamed(this.model, "height", newHeight);
        // reset the rotate angle to the original (if necessary)
        if(angle){
            this.model.partProperties.setPropertyNamed(this.model, "rotate", angle);
        }
    }

    onHaloRotate(movementX, movementY){
        // Default implementation on what to do during
        // halo button rotate opertations. Subclasses
        // can override for custom behavior.
        // Default is to update the View component's
        // rotate style property directly.
        if(movementX || movementY){
            let currentAngle = this.model.partProperties.getPropertyNamed(this.model, "rotate");
            let rect = this.getBoundingClientRect();
            if(!currentAngle){
                currentAngle = 0;
            }
            let theta1 = Math.atan((rect.height/2)/(rect.width/2));
            let theta2 = Math.atan((rect.height/2 + movementY)/(rect.width/2 + movementX));
            let changeAngle = Math.abs((theta2 - theta1)*180/Math.PI);
            let newAngle = (currentAngle + changeAngle) % 360;
            if(newAngle < 0){
                newAngle = 360 + newAngle;
            }
            if(newAngle){
                this.model.partProperties.setPropertyNamed(this.model, "rotate", newAngle);
            }
        }
    }

    onHaloCopy(){
        window.System.clipboard.copyPart(this.model);
    }

    onHaloPaste(){
        window.System.clipboard.pasteContentsInto(this.model);
        this.model.partProperties.setPropertyNamed(this.model, "halo-open", false);
    }

    onHaloTarget(event){
        // Add targeting receive listeners to all PartViews
        // on the current card.
        let currentStackView = document.querySelector(`[part-id="${window.System.world.currentStack.id}"]`);
        let currentCardView = document.querySelector(`[part-id="${window.System.world.currentStack.currentCard.id}"]`);
        let targetCardParts = Array.from(currentCardView.querySelectorAll('[part-id]'));
        let targetStackParts = Array.from(currentStackView.querySelectorAll('[part-id]:not(st-card):not(st-stack)'));
        let allTargets = targetCardParts.concat(targetStackParts);
        allTargets.forEach(partView => {
            document.addEventListener('keydown', this.handleTargetKey);
            partView.addEventListener('mouseover', this.handleTargetMouseOver);
            partView.addEventListener('mouseout', this.handleTargetMouseOut);
            partView.addEventListener('click', this.handleTargetMouseClick);
        });
        document.body.classList.add('targeting-mode');
        event.stopPropagation();
    }

    onHaloTargetButtonMouseEnter(){
        // light up the current target
        this.getCurrentTargetViews().forEach((view) => {
            view.highlight("rgb(54, 172, 100)"); //green
        });
    }

    onHaloTargetButtonMouseLeave(){
        // light up the current target
        this.getCurrentTargetViews().forEach((view) => {
            view.unhighlight();
        });
    }

    highlight(color){
        if(this.name != "StackView" && this.name != "WorldView"){
            this._tempBackgroundColor = this.model.partProperties.getPropertyNamed(this.model, "background-color");
            this.model.partProperties.setPropertyNamed(this.model, "background-color", color);
            this._tempBackgroundTransparency = this.model.partProperties.getPropertyNamed(this.model, "background-transparency");
            this.model.partProperties.setPropertyNamed(this.model, "background-transparency", 1);
        }

    }

    unhighlight(){
        if(this.name != "StackView" && this.name != "WorldView"){
            this.model.partProperties.setPropertyNamed(this.model, "background-color", this._tempBackgroundColor);
            this.model.partProperties.setPropertyNamed(this.model, "background-transparency", this._tempBackgroundTransparency);
        }
    }

    endHaloTarget(){
        // Remove all targeting related event listeners
        // that were added during the onHaloTarget
        // handler
        let currentStackView = document.querySelector(`[part-id="${window.System.world.currentStack.id}"]`);
        let currentCardView = document.querySelector(`[part-id="${window.System.world.currentStack.currentCard.id}"]`);
        let targetCardParts = Array.from(currentCardView.querySelectorAll('[part-id]'));
        let targetStackParts = Array.from(currentStackView.querySelectorAll('[part-id]:not(st-card):not(st-stack)'));
        let allTargets = targetCardParts.concat(targetStackParts);
        allTargets.forEach(partView => {
            document.removeEventListener('keydown', this.handleTargetKey);
            partView.removeEventListener('keydown', this.handleTargetKey);
            partView.removeEventListener('mouseover', this.handleTargetMouseOver);
            partView.removeEventListener('mouseout', this.handleTargetMouseOut);
            partView.removeEventListener('click', this.handleTargetMouseClick);
        });
        document.body.classList.remove('targeting-mode');
    }

    handleTargetKey(event){
        if(event.key == 'Escape'){
            this.endHaloTarget();
        }
    }

    handleTargetMouseOver(event){
        if(!event.target.classList.contains('targeting')){
            event.target.classList.add('targeting');
            event.target.highlight("rgb(234, 55, 55)");
            event.target.removeEventListener('click', event.target.onClick);
        }
    }

    handleTargetMouseLeave(event){
        if(event.target.classList.contains('targeting')){
            event.target.classList.remove('targeting');
            event.target.unhighlight();
            event.target.addEventListener('click', event.target.onClick);
        }
    }

    handleTargetMouseClick(event){
        event.preventDefault();
        if(event.button == 0 && event.shiftKey){
            this.onHaloActivationClick(event);
            return;
        }
        event.target.classList.remove('targeting');
        this.model.partProperties.setPropertyNamed(
            this.model,
            'target',
            event.target.model.id
        );
        this.endHaloTarget();
        event.stopImmediatePropagation();
        event.target.unhighlight();
        event.target.addEventListener('click', event.target.onClick);
    }

    getCurrentTargetViews(){
        // clean up the current target
        let currentTarget = this.model.partProperties.getPropertyNamed(this.model, "target");
        if(currentTarget){
            let semantics = window.System.grammar.createSemantics();
            semantics.addOperation(
                'interpret',
                interpreterSemantics(this.model, window.System)
            );
            let m = window.System.grammar.match(currentTarget, "ObjectSpecifier");
            let targetId = semantics(m).interpret();
            return window.System.findViewsById(targetId);
        }
        return [];
    }

    onContextMenuClick(event){
        if(this.wantsContextMenu){
            event.preventDefault();
            event.stopPropagation();
            if(this.contextMenuIsOpen){
                this.closeContextMenu();
            } else {
                this.openContextMenuAt(
                    event.clientX,
                    event.clientY
                );
            }
        } else {
            event.stopPropagation();
        }
    }

    onAuxClick(event){
        // Should only open halo when middle
        // mouse button is clicked
        if(event.button == 1){
            event.preventDefault();
            this.onHaloActivationClick(event);
        }
    }

    onClick(event){
        if(this.contextMenuIsOpen){
            this.closeContextMenu();
        }
        if(event.button == 0 && event.shiftKey){
            event.preventDefault();
            this.onHaloActivationClick(event);
        }
    }

    onHaloActivationClick(event){
        if(this.wantsHalo){
            if(this.hasOpenHalo){
                this.model.partProperties.setPropertyNamed(this.model, "halo-open", false);
            } else {
                event.stopPropagation();
                this.model.partProperties.setPropertyNamed(this.model, "halo-open", true);
            }
        }
    }

    onMouseDown(event){
        if(event.button == 0 && !event.shiftKey){
            document.addEventListener('mousemove', this.onMouseMove);
            document.addEventListener('mouseup', this.onMouseUp);
        }
    }

    onMouseMove(event){
        this.sendMessage({
            type: 'command',
            commandName: 'move',
            args: [event.movementX, event.movementY]
        }, this.model);
    }

    onMouseUp(event){
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
    }

    openContextMenuAt(x, y){
        let menuEl = document.createElement('st-context-menu');
        menuEl.render(this.model);
        menuEl.style.left = `${x}px`;
        menuEl.style.top = `${y}px`;
        document.body.append(menuEl);

        // Ensure that the menu is completely
        // within the current view. If not (meaning
        // it is clipped), then adjust so it is
        // completely in the view.
        menuEl.adjustToClientView();
    }

    closeContextMenu(){
        let found = document.querySelector('st-context-menu');
        if(found){
            found.remove();
        }
    }

    addContextMenuItems(contextMenu){
        // The default implementation is to
        // do nothins.
        // Subclasses should override and use the
        // passed-in contextMenu object to construct
        // list items that are specific to their needs
        return;
    }

    get wantsHaloMove(){
        if(!this.parentElement || !this.isConnected){
            return false;
        }
        let parentModel = this.parentElement.model;
        if(!parentModel){
            return true;
        }

        let hasLayout = parentModel.partProperties.findPropertyNamed(
            parentModel,
            'layout'
        );

        if(!hasLayout){
            return true;
        }

        let parentLayout = parentModel.partProperties.getPropertyNamed(
            parentModel,
            'layout'
        );
        if(parentLayout === 'strict' | !parentLayout || parentLayout == ""){
            return true;
        }

        return false;
    }

    get contextMenuIsOpen(){
        let found = document.querySelector('st-context-menu');
        if(found){
            return true;
        }
        return false;
    }

    /* Editor related methods */
    openEditor(){
        let editor = document.querySelector('st-editor');
        editor.render(this.model);
        if(!editor.isOpen){
            editor.open();
        }
    }

    closeEditor(){
        let editor = document.querySelector('st-editor.open');
        if(editor){
            editor.close();
        }
    }
};

export {
    PartView,
    PartView as default
};
