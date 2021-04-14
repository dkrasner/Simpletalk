/**
 * Utilities for Clipboard Functionality
 * ------------------------------------------
 * For the moment we use a very primitive stand-in
 * since the Clipboard API is not standardized across
 * browser implementations.
 **/
import idMaker from './id.js';
import {STDeserializer, STSerializer} from './serialization.js';

class STClipboard {
    constructor(aSystem){
        this.system = aSystem;
        this.contents = [];

        // Bound methods
        this.copyPart = this.copyPart.bind(this);
        this.pasteContentsInto = this.pasteContentsInto.bind(this);
    }

    copyPart(aPart){
        let serializer = new STSerializer(this.system);
        let rootSerialization = serializer.serialize(aPart, false);
        let item = new STClipboardItem(
            'simpletalk/json',
            rootSerialization,
            aPart.type
        );
        this.contents = [item];
    }

    pasteContentsInto(aTargetPart){
        let promises = this.contents.map(clipboardContent => {
            let serializedContent = clipboardContent.data;
            let deserializer = new STDeserializer(this.system);
            deserializer.targetId = aTargetPart.id;
            return deserializer.deserialize(serializedContent)
                .then(() => {
                    // Reset the top and left values to that
                    // the pasted part doesn't run outside of the new
                    // relative bounds in which it has been pasted
                    let newPart = deserializer.rootParts[0];
                    let hasTop = newPart.partProperties.findPropertyNamed('top');
                    let hasLeft = newPart.partProperties.findPropertyNamed('left');
                    if(hasTop){
                        newPart.partProperties.setPropertyNamed(
                            newPart,
                            'top',
                            10
                        );
                    }
                    if(hasLeft){
                        newPart.partProperties.setPropertyNamed(
                            newPart,
                            'left',
                            10
                        );
                    }
                    
                    // Open Halo on the new view
                    deserializer.rootViews[0].openHalo();

                    // Dispatch the CustomEvent that notifies listeners
                    // that a new view was added (used by Nav etc)
                    let event = new CustomEvent('st-view-added', {
                        detail: {
                            partType: newPart.type,
                            partId: newPart.id,
                            ownerId: newPart._owner.id
                        }
                    });
                    deserializer.rootViews[0].dispatchEvent(event);

                    // Add any lensed views that might be needed
                    let rootLensViews = this.system.findLensViewsById(newPart._owner.id);
                    rootLensViews.forEach(lensView => {
                        let newLensView = document.createElement(
                            this.system.tagNameForViewNamed(newPart.type)
                        );
                        newLensView.setModel(newPart);
                        newLensView.removeAttribute('part-id');
                        newLensView.setAttribute('lens-part-id', newPart.id);
                        newLensView.setAttribute('role', 'lens');
                        lensView.appendChild(newLensView);
                    });
                    
                    return;
                })
                .catch(err => {
                    throw err;
                });
        });
        return Promise.all(promises);
    }
    
    get isEmpty(){
        return this.contents.length <= 0;
    }
}

class STClipboardItem {
    constructor(mimeType, data, partType){
        if(mimeType){
            this.type = mimeType;
        }
        if(partType){
            this._partType = partType;
        }
        if(data){
            this.data = data;
        }
    }

    get partType(){
        if(this.type == 'simpletalk/json'){
            return this._partType;
        }
        return null;
    }

    set partType(val){
        this._partType = val;
    }
};

export {
    STClipboard,
    STClipboard as default
};
