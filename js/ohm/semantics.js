/* I am dictionary that represent semantics actions
 * associated with the SimpleTalk grammar. For every
 * node-rule in the grammar I offer and action, or a
 * function that takes as it's argument the string values
 * at the corresponding node.
 */

let simpleTalkSemantics = {
    Command_answer: function(answer, stringLiteral){
        let msg = {
            type: "command",
            commanName: "answer",
            args: [
                stringLiteral.parse()
            ]
        };
        return msg;
    },

    Command_goTo: function(goToLiteral, nextPrevious, systemObject, objectId){
        let args = [];
        if (nextPrevious.sourceString){
            args.push(nextPrevious.sourceString);
        }
        if (systemObject.sourceString){
            args.push(systemObject.sourceString);
        }
        if (objectId.sourceString){
            args.push(objectId.sourceString);
        }

        let msg = {
            type: "command",
            commandName: "go to",
            args: args
        };
        return msg;
    },

    MessageHandlerOpen: function(literalOn, messageName, parameterList, newLine){
        return [messageName.sourceString, parameterList];
    },

    MessageHandler: function(handlerOpen, statementList, handlerClose){
        let open = handlerOpen.parse();
        let handlerName = open[0];
        let paramList = open[1].parse();
        // let parsedParams = paramList.parse();
        // TODO: do we want messageHandler a la HT to be of type 'command'
        return ["command", handlerName, paramList, statementList.parse()[0]];
    },

    StatementList: function(list){
        return list.parse();
    },

    StatementLine: function(statement, newline){
        return statement.parse();
    },

    ParameterList: function(paramString){
        // TODO is the ohm way of doing this? or should we
        // walk the tree?
        return paramString.sourceString.split(",")[0];
    },

    stringLiteral: function(openQuote, text, closeQuote){
        return text.sourceString;
    }
}

export {simpleTalkSemantics, simpleTalkSemantics as default}
