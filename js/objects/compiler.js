/*
 * Compiler
 * ----------------------
 *  I am compiler object that handles code string
 *  grammar validation and parsing, and application
 *  of the semantics.
 *  My main purpose is to take strings represenating code
 *  and return runnable code.
 */

class Compiler {
    constructor(grammar, semantics){
        this.grammar = grammar;
        this.semantics = semantics;
    }

    /**
     * I parse the given string into a grammar tree,
     * apply the grammatical semantics, i.e. compile
     * (transpaile) into a runnnable/executable function,
     * and attach said function to target object message store.
     */
    compile(string, target){
        let match = this.grammar.match(string);
        let [messageType, messageName, messageList] = this.semantics(match).parse();
        switch(messageType){
            case "command":
                target._commandHandlers[messageName] = messageList;
                break;
            case "function":
                target._functionHandlers[messageName] = messageList;
                break;
        }
    }
}

export {Compiler as default}
