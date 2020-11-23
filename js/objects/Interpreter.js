/**
 * Interpreter
 * ---------------------------
 * This class is responsible for evaluating any
 * arguments passed to concrete command/function handlers
 * in the system.
 * The primary duty is to call `eval` on any InterpreterNode
 * instances it comes across.
 * This is how we ensure late binding of important
 * scripted elements when handlers are actually called
 */
class Interpreter {
    constructor(aSystem){
        this._system = aSystem || null;
    }

    /**
     * The responsibility of the interpret
     * method is to return either the original
     * object or an object resulting from the 
     * evaluation of an InterpreterNode
     */
    interpret(object, partContext){
        // If the object to evaluate is null
        // or undefined, we assume that this is
        // intentional and simply return the
        // passed in value
        if(!object){
            return object;
        }

        // If the object is a kind of InterpreterNode,
        // then the Interpreter should evaluate it
        // and return the result of that evaluation
        if(!object.isInterpreterNode){
            return object;
        }

        // Otherwise, the incoming object is
        // something that does not need to be
        // interpreted at all, so we simply
        // return it
        return object.eval(partContext);
    }
};

export {
    Interpreter as default,
    Interpreter
};
