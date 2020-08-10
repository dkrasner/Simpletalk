/* I am dictionary that represent semantics actions
 * associated with the SimpleTalk grammar. For every
 * node-rule in the grammar I offer and action, or a
 * function that takes as it's argument the string values
 * at the corresponding node.
 */

let simpleTalkSemantics = {
    command_answer: function(answer, space, openQuote, text, closeQuote){
        let msg = {
            type: "command",
            commandName: "answer",
            args: [
                text.sourceString
            ]
        };
        return msg;
    },

    command_goTo: function(goToLiteral, space, nextPrevious, systemObject, objectId){
        let msg = {
            type: "command",
            commandName: "go to",
            args: [
                nextPrevious.sourceString
            ]
        };
        return msg;
    },

    messageHandlerOpen: function(literalOn, space, messageName, optionalSpace, parameterList, newLine){
        return [messageName.sourceString, parameterList];
    },

    messageHandler: function(handlerOpen, statementList, handlerClose){
        let open = handlerOpen.parse();
        let handlerName = open[0];
        let paramList = open[1];
        let parsedParams = paramList.parse();
        // TODO: do we want messageHandler a la HT to be of type 'command'
        return ["command", handlerName, statementList.parse()[0]];
    },

    statementList: function(list){
        return list.parse();
    },

    statementLine: function(spaces, statement, newline){
        return statement.parse();
    },

    parameterList: function(paramString){
        return paramString.split(", ");
    }
}

export {simpleTalkSemantics as default}
