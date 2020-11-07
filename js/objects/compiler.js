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
        let parsedMatch = this.semantics(match).parse();
        for (var i = 0; i < parsedMatch.length; i++) {
            if (typeof parsedMatch[i] == 'undefined') {
                continue;
                throw new Error(`Semantics parse failed on "${string}"`);
            }
            let [messageType, messageName, messageParameters, messageList] = parsedMatch[i];
            // We expect the list of compiled messages to send
            // to be attached to the Part._scriptSemantics.
            // Here I am using a dict at _compiled but we can all it
            // anything. The important part is that the key is the
            // same as the message/command name
            target._scriptSemantics[messageName] = messageList;
            switch(messageType){
                case "command":
                    // The "concrete handler" is the actual javascript function
                    // that handles a command called "click" on the given
                    // Part instance. The semantic compiler should have created
                    // a basic function wrapping the recursive calling of the
                    // Part's script messages and set the command name key
                    // to that function.
                    // TODO figure out how to pass the args to the outer func
                    // from the handler itself
                    target._commandHandlers[messageName] = function(...messageParameters){
                        recursivelySendMessages(
                            target._scriptSemantics[messageName],
                            target
                        );
                    };
                    break;
                case "function":
                    target._functionHandlers[messageName] = function(...args){
                        recursivelySendMessages(
                            target._scriptSemantics[messageName],
                            target
                        );
                    };
                    break;
            }
        }
    }
}

let recursivelySendMessages = function(messageList, target){
    // This is just an example. It will be
    // more complex since messages can be
    // nested etc
    messageList.forEach(message => {
        target.sendMessage(message, target);
    });
};

export {Compiler, Compiler as default}
