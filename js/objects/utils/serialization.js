/**
 * Serialization and Deserialization Utility Classes
 */
import idMaker from './id.js';

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

        // The targetId is the id of
        // the Part that we wish to append any
        // deserialized subpart tree into.
        // By default we assume the whole system,
        // ie full deserialization.
        this.targetId = 'system';

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
        this.throwError = this.throwError.bind(this);
        this.flushCaches = this.flushCaches.bind(this);
    }

    deserialize(aJSONString){
        this.data = JSON.parse(aJSONString);
        let target = this.system[this.targetId];
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
                if(this.targetId == 'system'){
                    this.refreshWorld();
                } else {
                    target.addPart(this.rootPart);
                }
                
                // Finally, append the PartView root node
                // where it should go in the view tree.
                if(this.targetId == 'system'){
                    this.appendWorld();
                } else {
                    let targetView = document.querySelector(`[part-id="${targetId}"]`);
                    targetView.appendChild(this.rootView);
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

            // Third, we go through each created Part instance
            // and add any subparts to it. Note that this is not
            // recursive
            this._instanceCache.forEach(partInstance => {
                this.attachSubparts(partInstance);
            });

            // Fourth, we create all the appropriate PartViews
            // needed by the tree of deserialized parts.
            this._instanceCache.forEach(partInstance => {
                this.createView(partInstance);
            });

            // Fifth, we attach view elements in the tree
            // to their mapped parent elements. Note that
            // we do not yet attach the root view to anything
            // in the actual DOM.
            this._instanceCache.forEach(partInstance => {
                this.attachView(partInstance);
            });
            
            // Sixth, we set all properties on each created
            // Part model from the deserialized data.
            // We do this using a visitor method on the instances
            // themselves.
            // This gives the in-memory views the ability to
            // react to any initial changes to their models.
            this._instanceCache.forEach(partInstance => {
                this.setProperties(partInstance);
                this.setViewModel(partInstance);
            });

            // Insertion should be handled by composed
            // promises elsewhere (see imports and deserialize()
            // for examples)

            return resolve(this);
        });
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
                });
            });
    }

    deserializePart(partData){
        let partClass = this.getModelClass(partData.type);
        let instance = new partClass();

        // We create a new ID for this part, since we cannot
        // guarantee ID clashes with the existing System
        let newId;
        let oldId = partData.id;
        if(partData.id !== 'world'){
            newId = idMaker.new();
            instance.id = newId;
        } else {
            newId = oldId; // World always has 'world' as id
        }

        // Add to our caches and also to the System
        this._idCache[oldId] = newId;
        this._scriptCache[newId] = partData.properties.script;
        this._propsCache[newId] = partData.properties;
        this._modelCache[newId] = instance;
        this._subpartMapCache[newId] = partData.subparts;
        this._instanceCache.push(instance);
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
            ownerView.appendChild(partView);
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
        this.system.partsById['world'] = this.rootPart;
    }

    appendWorld(){
        let found = document.querySelector('st-world');
        if(found){
            document.body.replaceChild(this.rootView, found);
        } else {
            document.body.prepend(this.rootView);
        }
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
    }

    get rootPart(){
        let found = this._instanceCache.filter(inst => {
            return inst._owner == null;
        });
        if(found.length > 1){
            this.throwError(`Found multiple root parts in deserialization (${found.length})`);
        } else if(found.length == 1){
            return found[0];
        }
        return null;
    }

    get rootView(){
        let root = this.rootPart;
        if(root){
            return this._viewsCache[root.id];
        }
        return null;
    }
}

export {
    STDeserializer
};
