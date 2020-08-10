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
            target.script._compiled[messageName] = messageList;

            // We need to somehow pass the arguments to
            // this outer function. They are not currently
            // being provided by the semantic parser.
            target._commandHandlers[messageName] = function(...args){
                recursivelySendMessages(
                    target.script._compiled[messageName]
                ).bind(target)();
            };
            target._commandHandlers[messageName] = messageList;
            break;
        case "function":
            target._functionHandlers[messageName] = messageList;
            break;
        }
    }
}

let recursivelySendMessages = function(messageList){
    // This is just an example. It will be
    // more complex since messages can be
    // nested etc
    messageList.forEach(message => {
        this.sendMessage(message, this);
    });
};

export {Compiler as default}
