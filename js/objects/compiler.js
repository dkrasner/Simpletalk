/*
 * Compiler
 * ----------------------
 *  I am compiler object that handles code string
 *  grammar validation and parsing, and application
 *  of the semantics.
 *  My main purpose is to take strings represenating code
 *  and return runnable code.
 */

const evaluate = function(object, context){
    if(object == undefined || object == null){
        return object;
    }

    if(object.isVariable){
        return context._executionContext[object.name];
    }
    
    return object;
};

class Compiler {
    constructor(grammar, semantics){
        this.grammar = grammar;
        this.semantics = semantics;
    }

    /**
     * I parse the given string into a grammar tree,
     * apply the grammatical semantics, i.e. compile
     * (transpile) into a runnnable/executable function,
     * and attach said function to target object message store.
     */
    compile(string, target){
        let match = this.grammar.match(string);
        if (match.failed()) {
            let msg = {
                type: "error",
                name: "GrammarMatchError",
                message: match.message,
            };
            target.sendMessage(msg, target);
            return
        }
        var parsedMatch;
        try {
            parsedMatch = this.semantics(match).parse();
        } catch (error) {
            let msg = {
                type: "error",
                name: "SemanticsMatchError",
                message: error.message,
            };
            target.sendMessage(msg, target);
            return
        }
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
                        this._executionContext = {};
                        recursivelySendMessages(
                            target._scriptSemantics[messageName],
                            target,
                            this // the context
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

let recursivelySendMessages = function(messageList, target, context){
    // This is just an example. It will be
    // more complex since messages can be
    // nested etc
    messageList.forEach(message => {
        if(message.args){
            let evaluatedArgs = message.args.map(arg => {
                return evaluate(arg, context);
            });
            message.args = evaluatedArgs;
        }
        target.sendMessage(message, target);
    });
};

export {Compiler, Compiler as default}
