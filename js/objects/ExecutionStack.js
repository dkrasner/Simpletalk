/**
 * ExecutionStack
 * ---------------------------------
 * I am an object that manages a stack of
 * ActivationContext objects.
 * I am designed to be used by System as the
 * global execution stack.
 *
 */

class ExecutionStack {
    constructor(){
        this._stack = [];
        this._globals = {};

        // Bound methods
        this.pop = this.pop.bind(this);
        this.push = this.push.bind(this);
        this.setGlobal = this.setGlobal.bind(this);
        this.getGlobal = this.getGlobal.bind(this);
    }

    pop(){
        if(!this._stack.length){
            return null;
        }
        return this._stack.pop();
    }

    push(anActivation){
        this._stack.push(anActivation);
    }

    setGlobal(varName, value){
        this._globals[varName] = value;
    }

    getGlobal(varName){
        return this._globals[varName];
    }

    get current(){
        if(!this._stack.length){
            return null;
        }
        return this._stack[this._stack.length - 1];
    }
};

class ActivationContext {
    constructor(messageName, part){
        this.part = part;
        this.messageName = messageName;
        this._locals = {};

        // Bound methods
        this.get = this.get.bind(this);
        this.getLocal = this.getLocal.bind(this);
        this.setLocal = this.setLocal.bind(this);
    }

    get(varName){
        let localValue = this.getLocal(varName);
        if(localValue !== undefined){
            return localValue;
        };
        // otherwise try to return a global
        // variable
        return window.System.executionStack.getGlobal(varName);
    }

    getLocal(varName){
        return this._locals[varName];
    }

    setLocal(varName, value){
        this._locals[varName] = value;
    }
}

export {
    ExecutionStack,
    ActivationContext
};
