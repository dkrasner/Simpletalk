/**
 * Serialization and Deserialization Utility Classes
 */
import idMaker from './id.js';

const version = "0.0.2";

class STDeserializer {
    constructor(aSystem){
        this.system = aSystem;

        // These caches are used during the process
        // as optimizations
        this._modelCache = {};
        this._subpartMapCache = {};
        this._idCache = {};
        this._instanceCache = [];
        this._propsCache = {};
        this._viewsCache = {};
        this._scriptCache = {};
        this._rootsCache = [];

        // The targetId is the id of
        // the Part that we wish to append any
        // deserialized subpart tree into.
        // By default we assume the whole system,
        // ie full deserialization.
        this.targetId = 'system';
        // the root id is the id of the root part instance
        // being attached
        this.rootId = null;

        // Bound methods
        this.deserialize = this.deserialize.bind(this);
        this.deserializeData = this.deserializeData.bind(this);
        this.deserializePart = this.deserializePart.bind(this);
        this.attachSubparts = this.attachSubparts.bind(this);
        this.setProperties = this.setProperties.bind(this);
        this.createView = this.createView.bind(this);
        this.attachView = this.attachView.bind(this);
        this.setViewModel = this.setViewModel.bind(this);
        this.compilePartScript = this.compilePartScript.bind(this);
        this.refreshWorld = this.refreshWorld.bind(this);
        this.appendWorld = this.appendWorld.bind(this);
        this.addPartsToSystem = this.addPartsToSystem.bind(this);
        this.compileScripts = this.compileScripts.bind(this);
        this.getFlattenedPartTree = this.getFlattenedPartTree.bind(this);
        this.getModelClass = this.getModelClass.bind(this);
        this.handleId = this.handleId.bind(this);
        this.throwError = this.throwError.bind(this);
        this.flushCaches = this.flushCaches.bind(this);
        this.dispatchViewAdded = this.dispatchViewAdded.bind(this);
    }

    deserialize(aJSONString){
        this.data = JSON.parse(aJSONString);
        let target = this.system.partsById[this.targetId];
        return this.deserializeData()
            .then(() => {
                // Add all deserialized Parts to the System dict,
                // including the new World.
                this.addPartsToSystem(this._instanceCache);
            })
            .then(() => {
                // Compile the scripts on *all* deserialized
                // parts
                this.compileScripts(this._instanceCache);
            })
            .then(() => {
                // Insert the root Part into whatever
                // target it should go into.
                let rootPart = this.rootParts[0];
                let rootView = this.rootViews[0];
                if(this.targetId == 'system'){
                    this.refreshWorld();
                } else {
                    target.addPart(rootPart);
                }

                // Finally, append the PartView root node
                // where it should go in the view tree.
                if(this.targetId == 'system'){
                    this.appendWorld();
                } else {
                    let targetView = document.querySelector(`[part-id="${this.targetId}"]`);
                    targetView.appendChild(rootView);
                    this.dispatchViewAdded(rootView);
                }
                return this;
            });
    }

    deserializeData(){
        return new Promise((resolve, reject) => {
            this.flushCaches();
            // First, we ensure that the target we
            // should be deserializing into actually exists
            let target = this.system.partsById[this.targetId];
            if(!target && this.targetId != 'system'){
                this.throwError(`Target id ${this.targetId} does not exist in System`);
            }

            // Second, we create instances of all models in the serialization
            // but we do not yet attach their subparts.
            Object.values(this.data.parts).forEach(partData => {
                this.deserializePart(Object.assign({}, partData));
            });

            // Translate targets
            for (var modelId in this._propsCache) {
                let props = this._propsCache[modelId];
                if (props.target !== null) {
                    for (var oldId in this._idCache) {
                        let newId = this._idCache[oldId];
                        if (props.target === 'part id ' + oldId) {
                            props.target = 'part id ' + newId;
                            break;
                        }
                    }
                }
            }
            // Translate scripts
            for (var modelId in this._scriptCache) {
                let script = this._scriptCache[modelId];
                if (script !== null && script.match('part id') !== null) {
                    for (var oldId in this._idCache) {
                        let newId = this._idCache[oldId];
                        let oldRe = 'part id ' + oldId;
                        let newRe = 'part id ' + newId;
                        if (this._scriptCache[modelId].match(oldRe) !== null) {
                            console.log(modelId);
                            this._scriptCache[modelId] = script.replaceAll(oldRe, newRe);
                        }
                    }
                }
            }

            // Third, we go through each created Part instance
            // and add any subparts to it. Note that this is not
            // recursive
            this._instanceCache.forEach(partInstance => {
                this.attachSubparts(partInstance);
            });

            // Forth and fifth. Create and attach views
            // Note this is recursive to preserve the subpart + view children order
            let root = this._instanceCache.filter((part) => {
                return part.partProperties.getPropertyNamed(part, "id") == this.rootId;
            })[0];
            this.createAndAttachViews(root);

            // Sixth, we set all properties on each created
            // Part model from the deserialized data.
            // We do this using a visitor method on the instances
            // themselves.
            // This gives the in-memory views the ability to
            // react to any initial changes to their models.
            this._instanceCache.forEach(partInstance => {
                this.setProperties(partInstance);
                // We need to translate new ids to old ones
                if (partInstance.name == "WorldStack") {
                    let world = partInstance;
                    world.partProperties.setPropertyNamed(
                        world,
                        "current",
                        this._idCache[world.currentStackId]
                    );
                }
                if (partInstance.name == "Stack") {
                    let stack = partInstance;
                    stack.partProperties.setPropertyNamed(
                        stack,
                        "current",
                        this._idCache[stack.currentCardId]
                    );
                }
                this.setViewModel(partInstance);
            });

            // We determine which of the instances is a "root",
            // meaning that it has, at this point, no owner in
            // the deserialized data. There can be multiple roots
            // (and therefore multiple trees) in a single deserialization
            this._rootsCache = this._instanceCache.filter(instance => {
                return instance._owner == null || instance._owner == undefined;
            });

            // Insertion should be handled by composed
            // promises elsewhere (see imports and deserialize()
            // for examples)

            return resolve(this);
        });
    }

    createAndAttachViews(partInstance){
        this.createView(partInstance);
        this.attachView(partInstance);
        if(partInstance.subparts.length){
            partInstance.subparts.forEach((subpartInstance) => {
                this.createAndAttachViews(subpartInstance);
            });
        }
    }

    importFromSerialization(aJSONString, filterFunction){
        this.data = JSON.parse(aJSONString);
        let target = this.system.partsById[this.targetId];
        let targetView = document.querySelector(`[part-id="${this.targetId}"]`);
        return this.deserializeData()
            .then(() => {
                // The caller will provide a filter function over
                // all deserialized part instances, returning only
                // those that should be inserted into the target.
                // For example, all Stacks in the WorldStack.
                return this._instanceCache.filter(filterFunction);
            })
            .then((rootParts) => {
                rootParts.forEach(rootPart => {
                    let allTreeParts = this.getFlattenedPartTree(rootPart);
                    this.addPartsToSystem(allTreeParts);
                });
                return rootParts;

            })
            .then((rootParts) => {
                rootParts.forEach(rootPart => {
                    let allTreeParts = this.getFlattenedPartTree(rootPart);
                    this.compileScripts(allTreeParts);
                });
                return rootParts;
            })
            .then((rootParts) => {
                rootParts.forEach(rootPart => {
                    let view = this._viewsCache[rootPart.id];
                    target.addPart(rootPart);
                    targetView.appendChild(view);
                    this.dispatchViewAdded(view);
                });
            });
    }

    deserializePart(partData){
        let partClass = this.getModelClass(partData.type);
        let instance = new partClass();

        // We create a new ID for this part, since we cannot
        // guarantee ID clashes with the existing System.
        // Exception is if the useOriginalids flag is set,
        // such as at load time
        let {newId, oldId} = this.handleId(instance, partData);
        instance.id = newId;
        // cache the new root ID if this is a root instance
        if(this.data.rootId == oldId){
            this.rootId = newId;
        }

        // Add to our caches and also to the System
        this._idCache[oldId] = newId;
        this._scriptCache[newId] = partData.properties.script;
        this._propsCache[newId] = partData.properties;
        this._modelCache[newId] = instance;
        this._subpartMapCache[newId] = partData.subparts;
        this._instanceCache.push(instance);
    }

    handleId(aPart, partData){
        let newId, oldId;
        oldId = partData.id;
        newId = aPart.id;
        if(aPart.type !== 'world'){
            newId = idMaker.new();
        }
        return {
            newId,
            oldId
        };
    }

    addPartsToSystem(aListOfParts){
        aListOfParts.forEach(part => {
            this.system.partsById[part.id] = part;
        });
    }

    compileScripts(aListOfParts){
        aListOfParts.forEach(part => {
            this.compilePartScript(part);
        });
    }

    attachSubparts(aPart){
        // At this point, the _subpartMapCache should
        // have an entry mapping from this aPart's (new)
        // id to an array of ids of also-initialized
        // subpart models
        let subpartIds = this._subpartMapCache[aPart.id];
        subpartIds.forEach(subpartId => {
            let newId = this._idCache[subpartId];
            let subpartModel = this._modelCache[newId];
            if(!subpartModel){
                debugger;
            }
            aPart.addPart(subpartModel);
        });
    }

    setProperties(aPart){
        let props = this._propsCache[aPart.id];
        delete props['id'];
        aPart.setPropsFromDeserializer(props, this);
    }

    createView(aPart){
        let newView = document.createElement(
            this.system.tagNameForViewNamed(aPart.type)
        );
        // we need to set the part-id attribute since these
        // are used for queries needed for things like
        // current stack and card
        newView.setAttribute("part-id", aPart.id);
        this._viewsCache[aPart.id] = newView;
    }

    setViewModel(aPart){
        let view = this._viewsCache[aPart.id];
        view.setModel(aPart);
    }
    
    attachView(aPart){
        let owner = aPart._owner;
        if(owner){
            let ownerView = this._viewsCache[owner.id];
            let partView = this._viewsCache[aPart.id];
            owner.sendMessage({
                type: "viewChanged",
                changeName: "subpart-new",
                args: [partView]
            }, ownerView);
        }
    }

    compilePartScript(aPart){
        let scriptString = this._scriptCache[aPart.id];
        if(scriptString && scriptString != ""){
            this.system.compile({
                type: 'compile',
                targetId: aPart.id,
                codeString: scriptString,
                serialize: false
            });
        }
    }

    refreshWorld(){
        // We assume a single root part was deserialized and
        // attach it as the World accordingly
        let newWorld = this.rootParts[0];
        if(newWorld.type !== 'world'){
            this.throwError(`Found ${this.rootParts.length} roots, but no world!`);
        }
        this.system.partsById['world'] = this.rootParts[0];
    }

    appendWorld(){
        // We assume a single root view that is an st-world.
        let found = document.querySelector('st-world');
        if(found){
            document.body.replaceChild(this.rootViews[0], found);
        } else {
            document.body.prepend(this.rootViews[0]);
        }
        this.dispatchViewAdded(document.querySelector('st-world'));
    }

    getFlattenedPartTree(aPart, list=[]){
        list.push(aPart);
        aPart.subparts.forEach(subpart => {
            this.getFlattenedPartTree(subpart, list);
        });
        return list;
    }

    throwError(message){
        throw new Error(`Deserialization Error: ${message}`);
    }

    getModelClass(aPartTypeStr){
        let cls = this.system.availableParts[aPartTypeStr];
        if(!cls){
            this.throwError(`Part type "${aPartTypeStr}" does not exist in system`);
        }
        return cls;
    }

    flushCaches(){
        this._modelCache = {};
        this._subpartMapCache = {};
        this._idCache = {};
        this._instanceCache = [];
        this._propsCache = {};
        this._viewsCache = {};
        this._scriptCache = {};
        this._rootsCache = [];
    }

    dispatchViewAdded(aView){
        let event = new CustomEvent('st-view-added', {
            detail: {
                partType: aView.model.type,
                partId: aView.model.id,
                //ownerId: aView.model._owner.id || null
            } 
        });
        aView.parentElement.dispatchEvent(event);
    }

    get rootParts(){
        return this._rootsCache;
    }

    get rootViews(){
        return this.rootParts.map(part => {
            return this._viewsCache[part.id];
        });
    }
}


class STSerializer {
    constructor(aSystem){
        this.system = aSystem;
        this._objectCache = {};

        // Bound methods
        this.serializePart = this.serializePart.bind(this);
        this.flushCaches = this.flushCaches.bind(this);
    }

    serialize(aRootPart, pretty=true){
        this.flushCaches();
        let result = {
            version: version,
            rootId: aRootPart.id,
            type: aRootPart.type,
            id: aRootPart.id
        };

        // Recursively serialize Parts and
        // store in flat list
        this.serializePart(aRootPart);

        // We set the result objects parts
        // dict to be the same as the cache
        result.parts = this._objectCache;

        // Finally, we convert to a string and
        // return
        if(pretty){
            return JSON.stringify(result, null, 4);
        } else {
            return JSON.stringify(result);
        }
    }

    serializePart(aPart){
        // We use the serialize method available on
        // base Parts, passing in this serializer instance
        // as the sole arg
        this._objectCache[aPart.id] = aPart.serialize(this);
        aPart.subparts.forEach(subpart => {
            this.serializePart(subpart);
        });
    }

    flushCaches(){
        this._objectCache = {};
    }
}

export {
    STSerializer,
    STDeserializer
};
