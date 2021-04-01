/**
 * Utilities for Clipboard Functionality
 * ------------------------------------------
 * For the moment we use a very primitive stand-in
 * since the Clipboard API is not standardized across
 * browser implementations.
 **/
import idMaker from './id.js';
class STClipboard {
    constructor(aSystem){
        this.system = aSystem;
        this.contents = [];

        // Bound methods
        this.copyPart = this.copyPart.bind(this);
        this.pasteContentsInto = this.pasteContentsInto.bind(this);
        this._deserializedPastedPart = this._deserializePastedPart.bind(this);
        this._recursivelyUpdateIds = this._recursivelyUpdateIds.bind(this);
        this._recursivelySerialize = this._recursivelySerialize.bind(this);
        this._recursivelyRecompile = this._recursivelyRecompile.bind(this);
    }

    copyPart(aPart){
        let rootSerialization = aPart.serialize();
        this._recursivelySerialize(aPart, rootSerialization);
        let item = new STClipboardItem(
            'simpletalk/json',
            JSON.stringify(rootSerialization),
            aPart.type
        );
        this.contents = [item];
    }

    pasteContentsInto(aTargetPart){
        // For now, we only allow single entries
        // into this mock clipboard.
        if(this.contents.length){
            let content = this.contents[0].data;
            let deserialization = JSON.parse(content);
            if(aTargetPart.acceptsSubpart(deserialization.type)){
                // Update all IDs so that they are new
                this._recursivelyUpdateIds(deserialization, null);

                // Recursively create new instances of the part and any
                // descendant subparts, down the chain
                this._deserializePastedPart(deserialization, aTargetPart);

                // Recompile the Part's script (if present)
                // and do the same for all descendant copies
                let copiedPart = window.System.partsById[deserialization.properties.id];
                this._recursivelyRecompile(copiedPart);

                // Reset the top and left values so that the
                // pasted part doesn't run outside of new relative bounds
                let hasTop = copiedPart.partProperties.findPropertyNamed('top');
                let hasLeft = copiedPart.partProperties.findPropertyNamed('left');
                if(hasTop){
                    copiedPart.partProperties.setPropertyNamed(
                        copiedPart,
                        'top',
                        10
                    );
                }
                if(hasLeft){
                    copiedPart.partProperties.setPropertyNamed(
                        copiedPart,
                        'left',
                        10
                    );
                }

                // Open a halo on the resulting part
                let copiedView = document.querySelector(`[part-id="${deserialization.properties.id}"]`);
                copiedView.openHalo();
            } else {
                console.warn(`${aTargetPart.type}[${aTargetPart.id}] does not accept subparts of type ${deserialization.type}`);
            }
        }
    }

    _deserializePastedPart(deserialization, anOwnerPart){
        let partClass = this.system.availableParts[deserialization.type];
        if(!partClass){
            throw new Error(`Cannot deserialize Part of type ${aPartJSON.type}!`);
        }
        let partCopy = partClass.fromSerialized(anOwnerPart.id, deserialization);
        this.system.partsById[partCopy.id] = partCopy;

        // Add the system as a prop subscriber
        partCopy.addPropertySubscriber(this.system);

        // Tell the system to build a view for the part
        this.system.newView(partCopy.type, partCopy.id);

        // Recursively do the same for any subparts
        deserialization.subparts.forEach(subpartSerialization => {
            this._deserializePastedPart(
                subpartSerialization,
                partCopy
            );
        });
    }

    _recursivelyRecompile(aPart){
        // Recursively recompile all scripts
        // (if present) on the given part and all
        // descendant subparts
        let scriptText = aPart.partProperties.getPropertyNamed(
            aPart,
            'script'
        );
        if(scriptText){
            aPart.partProperties.setPropertyNamed(
                aPart,
                'script',
                scriptText
            );
        }
        aPart.subparts.forEach(subpart => {
            this._recursivelyRecompile(subpart);
        });
    }

    _recursivelySerialize(aPart, serialization){
        serialization.subparts = [];
        aPart.subparts.forEach(subpart => {
            let subSerial = subpart.serialize();
            serialization.subparts.push(subSerial);
            this._recursivelySerialize(subpart, subSerial);
        });
    }

    _recursivelyUpdateIds(aDeserialization, parentDeserialization){
        //aDeserialization.id = idMaker.new();
        // if(parentDeserialization){
        //     aDeserialization.ownerId = parentDeserialization.id;
        // }
        aDeserialization.properties.id = idMaker.new();
        aDeserialization.id = aDeserialization.properties.id;
        aDeserialization.subparts.forEach(subpart => {
            this._recursivelyUpdateIds(subpart, aDeserialization);
        });
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
