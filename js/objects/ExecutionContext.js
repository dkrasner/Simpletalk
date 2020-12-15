/**
 * ExecutionContext Class
 * This class deals with tracking variable references
 * during the execution of a given Part's script handlers.
 * It contains basic variable lookup, but also the ability
 * to set specific 'current' scope for execution
 */

class ExecutionContext {
    constructor(){
        this._lookup = {};
        this._current = null;

        // Bind methods
        this.getLocal = this.getLocal.bind(this);
        this.setLocal = this.setLocal.bind(this);
    }

    getLocal(varName){
        return this.current[varName];
    }

    setLocal(varName, value){
        this.current[varName] = value;
    }

    set current(messageName){
        if(!this._lookup[messageName]){
            this._lookup[messageName] = {
                _argVariableNames: []
            };
        }
        this._current = this._lookup[messageName];
    }

    get current(){
        return this._current;
    }
};

export {
    ExecutionContext,
    ExecutionContext as default
};
