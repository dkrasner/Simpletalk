import ExecutionContext from '../objects/ExecutionContext.js';

// Helpers
function findNearestParentOfKind(aPart, aPartType){
    let owner = aPart._owner;
    let found = null;
    while(owner){
        if(owner.type == aPartType){
            found = owner;
            break;
        }
        owner = owner._owner;
    }
    return found;
}

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

                // In the grammar, the StatementList is
                // an optional rule, meaning the result of the rule
                // is an empty array (no statementlist) or a single
                // item array (the statementlist)
                if(optionalStatementList.children.length == 0){
                    return;
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
                    });
                });

                // Restore any previous execution context
                partContext._executionContext.restore();
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

        Command_putVariable: function(putLiteral, value, intoLiteral, globalLiteral, destination){
            let global = false;
            if(globalLiteral.sourceString){
                global = true;
            };
            let args = [
                value.interpret(),
                destination.sourceString,
                global
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
            let specifiedObjectId = optionalInClause.interpret()[0] || null;
            let args = [
                propNameAsLiteral.interpret(), // The property name
                literalOrVarName.interpret(), // The value or a var representing the value
                specifiedObjectId
            ];

            let msg = {
                type: "command",
                commandName: "setProperty",
                args: args
            };
            return msg;
        },

        Command_eventRespond: function(respondToLiteral, eventNameAsLiteral, optionalInClause){
            let clause = optionalInClause.interpret()[0] || {};
            let args = [
                "eventRespond", // The property name
                eventNameAsLiteral.interpret(), // The value or a var representing the value
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

        Command_eventIgnore: function(ignoreLiteral, eventNameAsLiteral, optionalInClause){
            let clause = optionalInClause.interpret()[0] || {};
            let args = [
                "eventIgnore", // The property name
                eventNameAsLiteral.interpret(), // The value or a var representing the value
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
            let message = statement.interpret();

            // Some statements, like if-then controls
            // and repeat controls, do not result in
            // messages but return null.
            // We ignore these.
            if(message && typeof(message) !== 'string'){
                let commandResult = partContext.sendMessage(message, partContext);
                partContext._executionContext.setLocal('it', commandResult);
                return null;
            } else {
                return message;
            }
        },

        Statement: function(actualStatement, optionalComment){
            return actualStatement.interpret();
        },

        Expression_addExpr: function(firstExpression, operation, secondExpression){
            let first = firstExpression.interpret();
            let second = secondExpression.interpret();
            return first + second;
        },

        Expression_minusExpr: function(firstExpr, operation, secondExpr){
            let first = firstExpr.interpret();
            let second = secondExpr.interpret();
            return first - second;
        },

        Expression_timesExpr: function(firstExpression, operation, secondExpression){
            let first = firstExpression.interpret();
            let second = secondExpression.interpret();
            return first * second;
        },
        
        Factor_parenFactor: function(leftParen, expression, rightParen){
            return expression.interpret();
        },

        EqualityConditional: function(expr1, comparatorLiteral, expr2){
            let first = expr1.interpret();
            let second = expr2.interpret();
            return first === second;
        },

        NonEqualityConditional: function(expr1, comparatorLiteral, expr2){
            let first = expr1.interpret();
            let second = expr2.interpret();
            return first !== second;
        },

        Conditional_gtComparison: function(expr1, gtLiteral, expr2){
            let first = expr1.interpret();
            let second = expr2.interpret();
            return first > second;
        },

        Conditional_ltComparison: function(expr1, ltLiteral, expr2){
            let first = expr1.interpret();
            let second = expr2.interpret();
            return first < second;
        },

        Conditional_gteComparison: function(expr1, gteLiteral, expr2){
            let first = expr1.interpret();
            let second = expr2.interpret();
            return first >= second;
        },

        Conditional_lteComparison: function(expr1, lteLiteral, expr2){
            let first = expr1.interpret();
            let second = expr2.interpret();
            return first <= second;
        },

        IfThenInline: function(ifLiteral, conditional, thenLiteral, statement, optionalComment){
            let shouldEvaluate = conditional.interpret();
            if(shouldEvaluate){
                return statement.interpret();
            } else {
                return null;
            }
        },

        IfThenSingleline_withoutElse: function(ifLine, lineTerm1, thenLine){
            let condition = ifLine.interpret();
            if(condition){
                return thenLine.interpret();
            } else {
                return null;
            }
        },

        IfThenSingleline_withElse: function(ifLine, lineTerm1, thenLine, lineTerm2, elseLine){
            let condition = ifLine.interpret();
            if(condition){
                return thenLine.interpret();
            } else {
                return elseLine.interpret();
            }
        },

        IfLine: function(ifLiteral, conditional, optionalComment){
            return conditional.interpret();
        },

        ThenLine: function(thenLiteral, statement, optionalComment){
            return statement.interpret();
        },

        ElseLine: function(elseLiteral, statement, optionalComment){
            return statement.interpret();
        },

        KindConditional: function(expr1, comparatorLiteral, expr2){
            // TODO: Flesh out this function to account for
            // various object types and their kind comparisons
            return false;
        },

        NotKindConditional: function(expr1, comparatorLiteral, expr2){
            // TODO: Flesh out this function to account for
            // various object types and their kind comparisons
            return true;
        },

        RepeatControlForm_forNumTimes: function(repeatLit, optionalForLit, intOrVar, timesLit){
            return {
                repeatType: 'forNumTimes',
                numTimes: intOrVar.interpret()
            };
        },

        RepeatControlForm_untilCondition: function(repeatLit, untilLit, conditional){
            return {
                repeatType: 'untilCondition',
                condition: conditional
            };
        },

        RepeatControlForm_whileCondition: function(repeatLit, whileLit, conditional){
            return {
                repeatType: 'whileCondition',
                condition: conditional
            };
        },

        RepeatControlForm_withStartFinish: function(repeatLit, withLit, varName, eqLit, firstVal, toLit, secondVal){
            return {
                repeatType: 'withStartFinish',
                varName: varName.sourceString,
                start: firstVal.interpret(),
                finish: secondVal.interpret()
            };
        },

        RepeatAdjust_exit: function(_){
            return 'exit repeat';
        },

        RepeatAdjust_next: function(_){
            return 'next repeat';
        },

        RepeatBlock: function(repeatControl, lineTerm, statementLineOrRepAdjustPlus, endLiteral){
            let repeatInfo = repeatControl.interpret();
            let statementLines = statementLineOrRepAdjustPlus.children;
            switch(repeatInfo.repeatType){
            case 'forNumTimes':
                for(let i = 1; i <= repeatInfo.numTimes; i++){
                    let shouldBreak = false;
                    let shouldPass = false;
                    for(let j = 0; j < statementLines.length; j++){
                        let currentStatement = statementLines[j];
                        let result = currentStatement.interpret();
                        if(result == 'exit repeat'){
                            shouldBreak = true;
                            break; // break out of this inner loop
                        } else if(result == 'next repeat'){
                            shouldPass = true;
                            break; // break out of this inner loop
                        }
                    }
                    if(shouldPass){
                        i += 1;
                    }
                    if(shouldBreak){
                        break; // break out of the main for loop
                    }
                }
                break; // Break out of the switch
            case 'untilCondition':
                let untilTestCondition = repeatInfo.condition.interpret();
                while(!untilTestCondition){
                    let shouldBreak = false;
                    for(let i = 0; i < statementLines.length; i++){
                        let currentStatement = statementLines[i];
                        let result = currentStatement.interpret();
                        if(result){
                            if(result == 'exit repeat'){
                                shouldBreak = true;
                                break;
                            } else if(result == 'next repeat'){
                                break;
                            }
                        }
                    }
                    if(shouldBreak){
                        break; // break out of the outer while loop
                    }
                    untilTestCondition = repeatInfo.condition.interpret();
                }
                break; // Break out of the switch case
            case 'whileCondition':
                let whileTestCondition = repeatInfo.condition.interpret();
                while(whileTestCondition){
                    let shouldBreak = false;
                    for(let i = 0; i < statementLines.length; i++){
                        let currentStatement = statementLines[i];
                        let result = currentStatement.interpret();
                        if(result == 'exit repeat'){
                            shouldBreak = true;
                            break; // break out of this inner loop
                        } else if(result == "next repeat"){
                            break; // break out of this inner loop
                        }
                    }
                    if(shouldBreak){
                        break; // break out of outer while loop (end repeat)
                    }
                    whileTestCondition = repeatInfo.condition.interpret();
                }
                break; // break out of switch case
            case 'withStartFinish':
                // For now, we assume that start is less than
                // finish. We should probably throw an error if
                // otherwise
                if(repeatInfo.start > repeatInfo.finish){
                    throw new Error(`Repeat error: start greater than finish`);
                }

                for(let i = repeatInfo.start; i <= repeatInfo.finish; i++){
                    partContext._executionContext.setLocal(repeatInfo.varName, i);
                    let shouldBreak = false;
                    let shouldPass = false;
                    for(let j = 0; j < statementLines.length; j++){
                        let currentStatement = statementLines[j];
                        let result = currentStatement.interpret();
                        if(result == "exit repeat"){
                            shouldBreak = true;
                            break; // break out of this inner loop
                        } else if(result == "next repeat"){
                            shouldPass = true;
                            break; // break out of this inner loop
                        }
                    }
                    if(shouldPass){
                        i += 1;
                    }
                    if(shouldBreak){
                        break; // break out of the outer (repeat) loop
                    }
                }
            }
            return null;
        },

        /** Object Specifiers **/

        /**
         * The partByIndex Partial Specifier
         * refers to partials that specify a part
         * type and an integer literal, for ex:
         *     field 3
         * The above example refers to the third
         * field part in its owner/parent part.
         */
        PartialSpecifier_partByIndex: function(objectType, integerLiteral){
            let index = integerLiteral.interpret();
            if(index < 1){
                throw new Error(`Part indices must be 1 or greater`);
            }
            return function(contextPart){
                if(objectType.sourceString == 'part'){
                    if(index > contextPart.subparts.length){
                        throw new Error(`${contextPart.type}[${contextPart.id}] does not have a part numbered ${index}`);
                    }
                    return contextPart.subparts[index-1];
                } else {
                    let partsOfType = contextPart.subparts.filter(subpart => {
                        return subpart.type == objectType.sourceString;
                    });
                    if(index > partsOfType.length){
                        throw new Error(`${contextPart.type}[${contextPart.id}] does not have a ${objectType.sourceString} numbered ${index}`);
                    }
                    return partsOfType[index-1];return contextPart.subparts.filter(subpart => {
                        return subpart.type == objectType.sourceString;
                    })[index-1];
                }
            }; 
        },

        /**
         * The partByNumericalIndex Partial Specifier
         * refers to partial that specify a part
         * type preceded by the English word for the
         * number. For the moment we accept first - tenth
         * Example:
         *     sixth button
         */
        PartialSpecifier_partByNumericalIndex: function(numericalKeyword, objectType){
            let index = numericalKeyword.interpret();
            return function(contextPart){
                if(objectType.sourceString == 'part'){
                    if(index > contextPart.subparts.length){
                        throw new Error(`${contextPart.type}[${contextPart.id}] does not have a part numbered ${index}`);
                    }
                    return contextPart.subparts[index-1];
                } else {
                    let partsOfType = contextPart.subparts.filter(subpart => {
                        return subpart.type == objectType.sourceString;
                    });
                    if(index > partsOfType.length){
                        throw new Error(`${contextPart.type}[${contextPart.id}] does not have a ${objectType.sourceString} numbered ${index}`);
                    }
                    return partsOfType[index-1];
                }
            };
        },

        /**
         * The partByName Partial Specifier
         * refers to a partial that specifies a part
         * by its name property. Example:
         *     card "My Custom Card"
         */
        PartialSpecifier_partByName: function(objectType, stringLiteral){
            let name = stringLiteral.interpret();
            if(objectType.sourceString == 'part'){
                return function(contextPart){
                    let found = contextPart.subparts.filter(subpart => {
                        let foundName = subpart.partProperties.getPropertyNamed(
                            subpart,
                            'name'
                        );
                        return name == foundName;
                    });
                    if(found.length){
                        return found[0];
                    }
                    throw new Error(`${contextPart.type}[${contextPart.id}] does not have a part named "${name}"`);
                };
            } else {
                return function(contextPart){
                    let found = contextPart.subparts.filter(subpart => {
                        return subpart.type == objectType.sourceString;
                    }).filter(subpart => {
                        let foundName = subpart.partProperties.getPropertyNamed(
                            subpart,
                            'name'
                        );
                        return foundName == name;
                    });
                    if(found.length){
                        return found[0];
                    }
                    throw new Error(`${contextPart.type}[${contextPart.id}] does not have a ${objectType.sourceString} named "${name}"`);
                };
            }
        },

        /**
         * The 'this' specifier is a terminal (final)
         * specifier that refers to one of three things:
         * 1. the type of the current part executing the script,
         *    example: this button
         * 2. Card, which refers to the card that owns the
         *    part that is currently executing the script, ex:
         *    this card
         * 3. Stack, which refers to the stack that owns the
         *    part that is currently executing the script, ex:
         *    this stack
         */
        TerminalSpecifier_thisSystemObject: function(thisLiteral, systemObject){
            let targetType = systemObject.sourceString;
            return function(contextPart){
                if(targetType == 'card'){
                    if(partContext.type == 'card'){
                        return partContext;
                    } else {
                        return findNearestParentOfKind(targetType);
                    }
                } else if(targetType == 'stack'){
                    if(partContext.type == 'stack'){
                        return partContext;
                    } else {
                        return findNearestParentOfKind(targetType);
                    }
                } else {
                    // If we reach this point, we expect the systemObject
                    // type to be equivalent to the overall partContext.
                    // If it is not, throw and error
                    if(partContext.type !== systemObject.sourceString){
                        throw new Error(`'this' is a ${partContext.type}, not a ${systemObject.sourceString}!`);
                    }
                    return partContext;
                }
            };
        },
        
        /**
         * The 'current' specifier is a terminal (final)
         * specifier that refers to either the current card or stack
         * being displayed to the user.
         * There are only two possible valid options:
         *     `current card`
         *     `current stack`
         */
        TerminalSpecifier_currentSystemObject: function(currentLiteral, systemObject){
            let targetType = systemObject.sourceString;
            return function(contextPart){
                if(targetType == 'stack'){
                    return systemContext.getCurrentStackModel();
                } else {
                    return systemContext.getCurrentCardModel();
                }
            };
        },

        /**
         * The partById specifier is a terminal (final)
         * specifier that refers to a given part type
         * by its unique system id. For any kind of part,
         * we use `part id <objectId>`
         * Examples: `card id 266` `part id 5`
         */
        TerminalSpecifier_partById: function(objectType, idLiteral, objectId){
            let id = objectId.interpret();
            let found = systemContext.partsById[id];
            if(!found){
                throw new Error(`Cannot find ${objectType.sourceString} with id ${objectId}`);
            }
            return found;
        },

        /**
         * A "prefixed" queried specifier is just
         * a PartialSpecifier with "of" in front of it, indicating
         * that a different partial will precede it be queried inside of it.
         * Example `of button "My Button"`
         */
        QueriedSpecifier_prefixed: function(partialSpecifier, ofLiteral){
            return partialSpecifier.interpret();
        },

        /**
         * A nested queried specifier is one that has two
         * or more prefixed specifiers. The simplest would be
         * something like:
         *     `of card "My Card" of stack "Another named stack"`
         */
        QueriedSpecifier_nested: function(firstQuery, secondQuery){
            return function(contextPart){
                let inner = secondQuery.interpret()(contextPart);
                let outer = firstQuery.interpret()(inner);
                return outer;
            };
        },

        /**
         * A Compound with terminal specifier is a QueriedSpecifier
         * that finishes with a Terminal specifier.
         * Example: `of button 3 of card "Some named card" of current stack`
         */
        ObjectSpecifier_compoundQueryWithTerminal: function(queriedSpecifier, terminalSpecifier){
            // The terminal here is the ultimate part context
            let finalPart = terminalSpecifier.interpret()();
            let result = queriedSpecifier.interpret()(finalPart);
            return result.id;
        },

        /**
         * A single non-terminal ObjectSpecifier is just a Partial
         * specifier by itself. When present outside of a QueriedSpecifier,
         * it will be interpreted in the current context and treated
         * as terminal/final. For example:
         *     button 4
         * by itself as a whole specifier will be interpreted as
         * `button 4 of this card`
         */
        ObjectSpecifier_singleNonTerminal: function(partialSpecifier){
            // A single non-terminal object specifier is one
            // whose terminal object is implicitly assumed to
            // be the card in which the current context part
            // exists.
            let finalPart;
            if(partContext.type == 'card'){
                finalPart = partContext;
            } else {
                finalPart = findNearestParentOfKind(partContext, 'card');
            }
            let result = partialSpecifier.interpret()(finalPart);
            return result.id;
        },

        anyLiteral: function(theLiteral){
            return theLiteral.interpret();
        },

        stringLiteral: function(openQuote, text, closeQuote){
            return text.sourceString;
        },

        booleanLiteral: function(text){
            if(text.sourceString == 'true'){
                return true;
            }
            if(text.sourceString == 'false'){
                return false;
            }
            throw new Error(`Invalid boolean literal: ${text}`);
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

        numericalKeyword: function(numeralName){
            switch(numeralName.sourceString){
            case 'first':
                return 1;
            case 'second':
                return 2;
            case 'third':
                return 3;
            case 'fourth':
                return 4;
            case 'fifth':
                return 5;
            case 'sixth':
                return 6;
            case 'seventh':
                return 7;
            case 'eighth':
                return 8;
            case 'ninth':
                return 9;
            case 'tenth':
                return 10;
            }

            return -1;
        },

        variableName: function(letterPlus, optionalDigits){
            // Lookup the variable in the part's
            // current execution context
            // If the variable is not a key on the object,
            // we throw an error: this means the variable has not yet
            // been defined but is being looked up.
            let value = partContext._executionContext.get(this.sourceString);
            if(value == undefined){
                throw new Error(`Variable ${this.sourceString} has not been defined`);
            }
            return value;
        },

        _terminal(){

        }
    };
};


export {
    createInterpreterSemantics,
    createInterpreterSemantics as default
};
