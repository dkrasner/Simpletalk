import ExecutionContext from '../objects/ExecutionContext.js';

const createInterpreterSemantics = (partContext, systemContext) => {
    return {
        Script: function(scriptParts, _){
            return scriptParts.interpret();
        },
        MessageHandler: function(handlerOpen, optionalStatementList, handlerClose){
            let {messageName, parameters} = handlerOpen.interpret();
            let handlerFunction = function(senders, ...args){
                if(!this._executionContext){
                    this._executionContext = new ExecutionContext();
                }
                this._executionContext.current = messageName;
                this._executionContext.current._argVariableNames = parameters;
                
                // Map each arg in order to any variable names given
                // to it. We set these as local variables
                args.forEach((arg, index) => {
                    let varName = this._executionContext.current._argVariableNames[index];
                    if(varName){
                        this._executionContext.setLocal(varName, arg);
                    }
                });

                let finalMessages = [];

                // In the grammar, the StatementList is
                // an optional rule, meaning the result of the rule
                // is an empty array (no statementlist) or a single
                // item array (the statementlist)
                if(optionalStatementList.children.length == 0){
                    return finalMessages;
                }
                let statementList = optionalStatementList.children[0];

                // Because StatementList is both optional *and* made up
                // of iterable StatementLine rules (ie, 'StatementLine+' in grammar),
                // we need to "unwrap" these nodes without calling interpret() on them.
                // This ensures that expressions within the statements, like variable lookups,
                // are not called before any preceding statements have been interpreted and
                // the corresponding messages have already been sent. For example, statement 1 might
                // set a variable that statement 2 needs to lookup and use, so we want the lookup to
                // occur after statement 1 has been interpreted and the message for it has
                // been sent.
                statementList.children.forEach(statementLines => {
                    statementLines.children.forEach(statementLine => {
                        let message = statementLine.interpret();
                        partContext.sendMessage(message, partContext);
                        finalMessages.push(message);
                    });
                });

                return finalMessages;
            };
            
            partContext._commandHandlers[messageName] = handlerFunction;
        },
        
        MessageHandlerOpen: function(literalOn, messageName, optionalParameterList, newLine){
            // Because the ParameterList here is optional, if
            // it is set it will be in the form of a size 1 array.
            // This single array item will itself be an array of the
            // parameter variable names.
            // Otherwise, an empty array indicates no params
            // are passed in for this handler
            let params = optionalParameterList.interpret();
            if(params.length > 0){
                params = params[0];
            }
            return {
                messageName: messageName.sourceString,
                parameters: params
            };
        },

        ParameterList: function(parameterString){
            return parameterString.asIteration().children.map(child => {
                return child.sourceString;
            });
        },
        
        ObjectSpecifier_thisSystemObject: function(thisLiteral, systemObject){
            let targetKind = systemObject.sourceString;
            if(partContext.type !== systemObject.sourceString){
                throw new Error(`'this' is not a ${systemObject.sourceString} (it is a ${partContext.type})`);
            }
            return partContext;
        },
        
        ObjectSpecifier_currentSystemObject: function(currentLiteral, systemObject){
            let targetKind = systemObject.sourceString;
            if(!['card', 'stack'].includes(targetKind)){
                throw "Semantic Error: 'current' can only apply to a card or stack";
            }
            let foundPart = systemContext.getCurrentCardModel();
            if(!foundPart){
                throw new Error(`Could not find current ${targetKind} in System!`);
            }
        },
        
        ObjectSpecifier_partById: function(partLiteral, identifier){
            let foundPart = systemContext.partsById[identifier.sourceString];
            if(!foundPart){
                throw new Error(`Could not find part ${partLiteral.sourceString} ${identifier.sourceString}`);
            }
            return foundPart;
        },
        
        ObjectSpecifier_partByName: function(systemObject, nameLiteral){
            let name = nameLiteral.interpret();
            let kind = systemObject.sourceString;
            
            throw new Error(`Should be implemented: lookup concrete part instance`);
        },
        
        InClause: function(inLiteral, objectSpecifier){
            return objectSpecifier.interpret();
        },
        
        Command_answer: function(answer, expression){
            let msg = {
                type: "command",
                commandName: "answer",
                args: [
                    expression.interpret()
                ]
            };
            return msg;
        },
        
        Command_goToDirection: function(goToLiteral, nextPrevious, systemObject){
            let args = [];
            args.push(nextPrevious.sourceString);
            if (systemObject.sourceString){
                args.push(systemObject.sourceString);
            }
            
            let msg = {
                type: "command",
                commandName: "go to direction",
                args: args
            };
            return msg;
        },

        Command_goToByReference: function(goToLiteral, systemObject, objectId){
            let args = [];
            args.push(systemObject.sourceString);
            args.push(objectId.sourceString);

            let msg = {
                type: "command",
                commandName: "go to reference",
                args: args
            };
            return msg;
        },

        Command_addModel: function(addLiteral, newObject, name, toLiteral, context, targetObjectType, targetObjectId){
            // TODO: a command like "add card to this stack 20" does not make sense, since you should either designate
            // the target by context "this" or by id. Here we should throw some sort of uniform error.
            let args = [];
            if(context.sourceString && targetObjectId.sourceString){
                throw "Semantic Error (Add model rule): only one of context or targetObjectId can be provided";
            }
            if(context.sourceString === "current" && !["card", "stack"].includes(targetObjectType.sourceString.toLowerCase())){
                throw "Semantic Error (Add model rule): context 'current' can only apply to 'card' or 'stack' models";
            }
            args.push(newObject.sourceString);
            args.push(targetObjectId.sourceString);
            args.push(targetObjectType.sourceString);
            args.push(context.sourceString);
            name = name.sourceString || "";
            // remove the string literal wrapping quotes
            if (name){
                name =name.slice(1, name.length - 1);
            }
            args.push(name);;

            let msg = {
                type: "command",
                commandName: "newModel",
                args: args
            };
            return msg;
        },

        Command_putVariable: function(putLiteral, value, intoLiteral, destination){
            let args = [
                value.interpret(),
                destination.sourceString
            ];
            let msg = {
                type: "command",
                commandName: 'putInto',
                args
            };
            return msg;
        },

        Command_deleteModel: function(deleteLiteral, thisLiteral, systemObject, objectId){
            let args = [];
            if (!objectId.sourceString){
                args.push(undefined);
            } else {
                args.push(objectId.sourceString);
            }
            args.push(systemObject.sourceString);

            let msg = {
                type: "command",
                commandName: "deleteModel",
                args: args
            };
            return msg;
        },

        Command_setProperty: function(setLiteral, propNameAsLiteral, toLiteral, literalOrVarName, optionalInClause){
            let clause = optionalInClause.interpret()[0] || {};
            let args = [
                propNameAsLiteral.interpret(), // The property name
                literalOrVarName.interpret(), // The value or a var representing the value
                clause.objectId,
                clause.objectType,
                clause.thisOrCurrent
            ];
            
            let msg = {
                type: "command",
                commandName: "setProperty",
                args: args
            };
            return msg;
        },

        Command_ask: function(askLiteral, question){
            return {
                type: "command",
                commandName: "ask",
                args: [ question.interpret() ]
            };
        },

        Command_arbitraryCommand: function(commandName, optionalArgumentList){
            // Because the argument list is optional here, it will
            // be either an empty array (no arguments) or a size 1
            // array (which itself will contain an array of the arguments)
            let optionalArguments = optionalArgumentList.interpret();
            if(optionalArguments.length > 0){
                optionalArguments = optionalArguments[0];
            }
            
            return {
                type: "command",
                commandName: commandName.sourceString,
                args: optionalArguments
            };
        },

        CommandArgumentList: function(list){
            return list.asIteration().interpret();
        },

        StatementLine: function(statement, newline){
            return statement.interpret();
        },

        Statement: function(command, optionalComment){
            return command.interpret();
        },

        Expression_addExpr: function(firstExpression, operation, secondExpression){
            let first = firstExpression.interpret();
            let second = secondExpression.interpret();
            return first + second;
        },

        Expression_timesExpr: function(firstExpression, operation, secondExpression){
            let first = firstExpression.interpret();
            let second = secondExpression.interpret();
            return first * second;
        },
        
        Factor_parenFactor: function(leftParen, expression, rightParen){
            return expression.interpret();
        },

        anyLiteral: function(theLiteral){
            return theLiteral.interpret();
        },

        stringLiteral: function(openQuote, text, closeQuote){
            return text.sourceString;
        },

        integerLiteral: function(negativeSign, integer){
            let int = parseInt(integer.sourceString);
            let hasNegative = (negativeSign.sourceString == "-");
            if(hasNegative){
                return -1 * int;
            }
            return int; 
        },
        
        floatLiteral: function(negativeSign, onesPlace, decimal, restPlace){
            let floatString = `${onesPlace.sourceString}.${restPlace.sourceString}`;
            let hasNegative = (negativeSign.sourceString == "-");
            let result = parseFloat(floatString);
            if(hasNegative){
                return -1 * result;
            }
            return result;
        },

        variableName: function(letterPlus, optionalDigits){
            // Lookup the variable in the part's
            // current execution context
            return partContext._executionContext.getLocal(this.sourceString);
        },

        _terminal(){
            
        }
    };
};


export {
    createInterpreterSemantics,
    createInterpreterSemantics as default
};
