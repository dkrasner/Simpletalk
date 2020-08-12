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
            commandName: "answer",
            args: [
                stringLiteral.parse()
            ]
        };
        return msg;
    },

    Command_goTo: function(goToLiteral, nextPrevious, systemObject, objectId){
        let msg = {
            type: "command",
            commandName: "go to",
            args: [
                nextPrevious.sourceString
            ]
        };
        return msg;
    },

    MessageHandlerOpen: function(literalOn, messageName, parameterList, newLine){
        return [messageName.sourceString, parameterList];
    },

    MessageHandler: function(handlerOpen, statementList, handlerClose){
        let open = handlerOpen.parse();
        let handlerName = open[0];
        let paramList = open[1];
        let parsedParams = paramList.parse();
        console.log(parsedParams);
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
        console.log(paramString);
        return paramString.split(", ");
    },

    stringLiteral: function(openQuote, text, closeQuote){
        return text;
    }
}

export {simpleTalkSemantics as default}
