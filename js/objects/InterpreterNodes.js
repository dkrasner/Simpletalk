/**
 * Interpreter Nodes
 * ------------------------------
 * This module contains class definitions
 * for the various Interpreter nodes available
 * to the ohm semantics.
 * These nodes are interpreted by the Interpreter
 * to produce bound javascript functions compiled from
 * SimpleTalk scripts
 */
class InterpreterNode {
    constructor(config){
        this.config = config;
        this.isInterpreterNode = true;
    }

    /**
     * Default evaluation method for
     * the base node.
     * By default it does nothing.
     * Subclasses should implement their
     * own versions
     */
    eval(context){
        throw new Error(`Should be implemented in subclass!`);
    }
};


class VariableINode extends InterpreterNode {
    constructor(configDict){
        super(configDict);
        this.isVariableINode = true;
        this.name = configDict.name || undefined;
    }

    eval(context){
        if(!context._executionContext){
            throw new Error(`Could not find execution context for ${context.type} ${context.id}`);
        }
        return context._executionContext[this.name];
    }
};

class DefinitionVariableINode extends InterpreterNode {
    constructor(configDict){
        super(configDict);
        this.isDefinitionVariableINode = true;
        this.name = configDict.name || undefined;
        this.index = configDict.index || undefined;
    }

    eval(context){
        if(!context._executionContext){
            throw new Error(`Could not find execution context for ${context.type} ${context.id}`);
        }
        // The compiler should have inserted any incoming
        // concrete JS function handler arguments as _messageParams
        // on the execution context object. The definition variable is mapped
        // to one of these values by its corresponding index. We then simply
        // set this as a local variable
        let params = context._executionContext._messageParams;
        let concreteParam = params[this.index];
        this.context._executionContext[this.name] = concreteParam;
    }
}

class PartRefINode extends InterpreterNode {
    constructor(configDict){
        super(configDict);
        this.isPartRefINode = true;

        this.objectType = configDict.objectType || undefined;
        this.objectId = configDict.objectId || undefined;
        this.name = configDict.name || undefined;
        this.thisOrCurrent = configDict.thisOrCurrent || undefined;
    }

    eval(context){
        throw new Error(`Should be implemented`);
    }
};

class ArithmeticINode extends InterpreterNode {
    constructor(configDict){
        super(configDict);
        this.values = configDict.values;
        this.operation = configDict.operation;
    }

    eval(context){
        if(!context._executionContext){
            throw new Error(`Could not find execution context for ${context.type} ${context.id}`);
        }
        let resolvedValues = this.values.map(rawValue => {
            if(rawValue.isInterpreterNode){
                return rawValue.eval(context);
            } else {
                return rawValue;
            }
        });

        switch(this.operation){
        case '+':
            return resolvedValues[0] + resolvedValues[1];
        case '*':
            return resolvedValues[0] * resolvedValues[1];
        }

        throw new Error(`Unknown arithmetic operation: ${this.operation}`);
    }
}

export {
    VariableINode,
    PartRefINode,
    ArithmeticINode
};
