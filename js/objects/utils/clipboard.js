/**
 * Utilities for Clipboard Functionality
 * ------------------------------------------
 * For the moment we use a very primitive stand-in
 * since the Clipboard API is not standardized across
 * browser implementations.
 **/
import idMaker from './idMaker.js';
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
            JSON.stringify(rootSerialization)
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
                this._recursivelyUpdateIds(deserialization, null);
                this._deserializePastedPart(deserialization, aTargetPart);
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
        aDeserialization.id = idMaker.new();
        if(parentDeserialization){
            aDeserialization.ownerId = parentDeserialization.id;
        }
        aDeserialization.subparts.forEach(subpart => {
            this._recursivelyUpdateIds(subpart, aDeserialization);
        });
    }
}

class STClipboardItem {
    constructor(mimeType, data){
        if(mimeType){
            this.type = mimeType;
        }
        if(data){
            this.data = data;
        }
    }
};

export {
    STClipboard,
    STClipboard as default
};
