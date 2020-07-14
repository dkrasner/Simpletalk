/**
 * PartCollection
 * ---------------------------------
 * I represent a collection of parts that are
 * "children" of some parent part.
 * Parts can be referenced by a given property name,
 * the "number" of their kind within the parent
 * (ie, card button 3), the "number" of the part
 * of any kind within the parent (ie, card part 4)
 */

class PartCollection {
    constructor(anOwnerPart){
        this.allParts = [];
        this.partsByType = {};
        this.partsById = {};
        this.partsByName = {};
        this.owner = anOwnerPart;

        // Bind methods
        this.addPart = this.addPart.bind(this);
        this.removePart = this.removePart.bind(this);
        this.getPartById = this.getPartById.bind(this);
        this.getPartByName = this.getPartByName.bind(this);
        this.getPartByPartIndex = this.getPartByPartIndex.bind(this);
        this.getPartByTypeIndex = this.getPartByTypeIndex.bind(this);
        this.getTypeIndexForPart = this.getTypeIndexForPart.bind(this);
    }

    addPart(aPart){
        // Find the list of parts for
        // the incoming part type
        let byTypeList = this.partsByType[aPart.type];
        if(byTypeList){
            byTypeList.push(aPart);
        } else {
            this.partsByType[aPart.type] = [aPart];
        }

        // Add the part to the total parts list
        this.allParts.push(aPart);

        // Add to parts by id
        this.partsById[aPart.id] = aPart;

        // Add to parts by name
        if(aPart.name){
            this.partsByName[aPart.name] = aPart;
        }

        // Set the part's owner to be the
        // same as that of this PartCollection
        aPart._owner = this.owner;
    }

    removePart(aPart){
        // Remove from the byType structure,
        // if present
        let typeList = this.partsByType[aPart.type];
        if(typeList){
            let typePartIndex = typeList.indexOf(aPart);
            if(typePartIndex >= 0){
                typeList.splice(typePartIndex, 1);
            }
        }

        // Remove from allParts, if present
        let allPartsIndex = this.allParts.indexOf(aPart);
        if(allPartsIndex >= 0){
            this.allParts.splice(allPartsIndex, 1);
        }

        // Remove from by id dictionary
        delete this.partsById[aPart.id];

        // Remove from the by name dictionary
        delete this.partsByName[aPart.name];
    }

    /**
     * Various Get methods.
     * TODO: Should these throw errors
     * if not found, return -1, or return
     * the result of the normal data structure
     * lookup? We do the last option for now.
    **/

    getPartById(id){
        return this.partsById[id];
    }

    getPartByName(aName){
        return this.partsByName[aName];
    }

    getPartByTypeIndex(aType, anIndex){
        let typeList = this.partsByType[aType];
        if(typeList){
            return typeList[anIndex - 1];
        }
        return undefined;
    }

    getTypeIndexForPart(aPart){
        let typeList = this.partsByType[aPart.type];
        if(typeList){

            // Note that the expected values are
            // 1-indexed (not 0-indexed) as this is
            // what HyperTalk expects
            return typeList.indexOf(aPart) + 1;
        }
        return -1;
    }

    getPartByPartIndex(anIndex){
        // Note: this method expects
        // 1-indexed values, ie 1 is the first
        // in the subcollection, etc
        return this.allParts[anIndex - 1];
    }
};

export {
    PartCollection,
    PartCollection as default
};
