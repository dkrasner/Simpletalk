/* I am dictionary that represent semantics actions
 * associated with the SimpleTalk grammar. For every
 * node-rule in the grammar I offer and action, or a
 * function that takes as it's argument the string values
 * at the corresponding node.
 */

let simpleTalkSemantics = {
    command_answer: function(answer, space, openQuote, text, closeQuote){
        return function(){
            let msg = {
            type: "command",
                commandName: answer.sourceString,
                args: [
                    text.sourceString
                ]
            };
            this.sendMessage(msg);
        };
    },

    messageHandlerOpen: function(literalOn, space, messageName, optionalSpace, parameterList, newLine){
        return [messageName.sourceString, parameterList];
    },

    messageHandler: function(handlerOpen, statementList, handlerClose){
        let open = handlerOpen.parse();
        let handlerName = open[0];
        let paramList = open[1];
        let parsedParams = paramList.parse();
        let parsedStatements = statementList.parse();
        return function(targetObj){
            let it;
            console.log(targetObj);
            parsedStatements.forEach(statementFunc => {
                statementFunc.bind(targetObj)();
            });
        };
    },

    statementList: function(list){
        return list.parse()[0];
    },

    statementLine: function(spaces, statement, newline){
        return statement.parse();
    },

    parameterList: function(paramString){
        return paramString.split(", ");
    }
}

export {simpleTalkSemantics as default}
