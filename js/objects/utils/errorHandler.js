/**
 * Error Handler
 * ------------------------------------
 * I am responsible for handler all
 * System-wide errors
 */

const errorHandler = {

    handle: function(aMessage){
        switch(aMessage.name){
            case 'GrammarMatchError':
                return this.handleGrammarMatchError(aMessage);
            case 'MessageNotUnderstood':
                return this.handleMessageNotUnderstood(aMessage);
            default:
                // if I don't know what to do with this message
                // I send it along to the System
                return window.System.receiveMessage(aMessage);
        }
    },

    handleGrammarMatchError: function(aMessage){
        // TODO is there a more structured way to get this out of ohm?
        let regex = /Line (?<line>\d), col (?<column>\d)/;
        let match = aMessage.parsedScript.message.match(regex);
        let errorLineNum = parseInt(match.groups["line"]) - 1; // ohm lines start with 1 
        // see if the grammar rule has been identified
        let ruleName;
        let rightMostFailures = aMessage.parsedScript.getRightmostFailures();
        if(rightMostFailures[1]){
            ruleName = rightMostFailures[1].pexpr.ruleName;
        }
        // get some more info about what the parser expected
        let expectedText = aMessage.parsedScript.getExpectedText();
        // get the original script
        let text = aMessage.parsedScript.input;
        let textLines = text.split("\n");
        // replace said text line with an error marker
        textLines[errorLineNum] += ` --<<<[Expected:${expectedText}; ruleName: "${ruleName}"]`;
        text = textLines.join("\n");
        // if the first message in the parsed script is "doIt" then the statementLines are
        // located in the corresponding field text, not the script, property and
        // we want the error to be marked up in the field textarea
        if(aMessage.parsedScript.input.startsWith("on doIt")){
            let originalSenderModel = window.System.partsById[aMessage.partId];
            // we need to get the original text so as not to completely replace it
            // then insert the markup in the appropriate line
            let fieldText = originalSenderModel.partProperties.getPropertyNamed(originalSenderModel, "text");
            let script = aMessage.parsedScript.input;
            script = this._cleanDoItSCript(script);
            // we don't want the "doIt" handler inserted back in, since it's just a hidden wrapper for the
            // statement lines
            text = this._cleanDoItSCript(text);
            fieldText = fieldText.replace(script, text);
            originalSenderModel.partProperties.setPropertyNamed(originalSenderModel, "text", fieldText);
        } else {
            // first locate the script editor in question
            let scriptEditor = window.System.findScriptEditorByTargetId(aMessage.partId);
            if(!scriptEditor){
                this._openScriptEditor(aMessage.partId);
                scriptEditor = window.System.findScriptEditorByTargetId(aMessage.partId);
            }
            scriptEditor.model.partProperties.setPropertyNamed(scriptEditor.model, "text", text);
        }
        // open the grammar
        this._openGrammar(aMessage.partId, ruleName);
    },

    handleMessageNotUnderstood(aMessage){
        let offendingMessage = aMessage.message;
        let originalSender = offendingMessage.senders[0];
        // Are we ever going to have MNU errors on messages that
        // are not type: command?
        if(offendingMessage.type === "command"){
            let commandName = offendingMessage.commandName;
            let originalSenderModel = window.System.partsById[originalSender.id];
            let regex = new RegExp(`\\s*${commandName}(\s|\n|$)`, 'g');
            let text;
            let target;
            let executionStack = window.System.executionStack._stack;
            // if the first message in the execution stack is "doIt" then the statementLines are
            // located in the corresponding field text, not the script, property and
            // we want the error to be marked up in the field textarea
            if(executionStack[0] && executionStack[0].messageName == "doIt"){
                text = originalSenderModel.partProperties.getPropertyNamed(originalSenderModel, 'text');
                target = originalSenderModel;
            } else {
                text = originalSenderModel.partProperties.getPropertyNamed(originalSenderModel, 'script');
                let scriptEditor = window.System.findScriptEditorByTargetId(originalSender.id);
                if(!scriptEditor){
                    this._openScriptEditor(originalSender.id);
                    scriptEditor = window.System.findScriptEditorByTargetId(originalSender.id);
                }
                target = scriptEditor.model;
            }
            let textLines = text.split("\n");
            // offending command text line with an error marker
            for(let i = 0; i < textLines.length; i++){
                let line = textLines[i];
                if(line.match(regex)){
                    textLines[i] = line += ` --<<<[MessageNotUnderstood: command; commandName: "${commandName}"]`;
                }
            }
            text = textLines.join("\n");
            target.partProperties.setPropertyNamed(target, "text", text);

            // finally open the debugger (or current version thereof)
            // NOTE: this is a bit dangerous, b/c if the System doesn't
            // handle the `openDebugger` command anywhere it will throw
            // a MNU error, which will then invoke this handler cuasing
            // an infinite loop!
            this._openDebugger(originalSender.id);
        }
    },

    _cleanDoItSCript(script){
        // clean up the DoIt script by removing the handler
        // newlines, tabs and spaces
        script = script.replace("on doIt", "");
        script = script.replace("end doIt", "");
        script = script.replace(/^[\n\t ]+/, "");
        script = script.replace(/[\n\t ]+$/, "");
        return script;
    },

    _openScriptEditor: function(partId){
        let target = window.System.partsById[partId];
        let msg = {
            type: "command",
            "commandName": "openScriptEditor",
            args: [partId]
        };
        target.sendMessage(msg, target);
    },

    _openGrammar: function(partId, ruleName){
        let target = window.System.partsById[partId];
        let statementLines = [
            'add field "SimpleTalk" to current card',
            'tell field "SimpleTalk" of current card to set "editable" to false',
            'SimpleTalk',
            'tell field "SimpleTalk"of current card to set "text" to it'
        ];
        let script = `on doIt\n   ${statementLines.join('\n')}\nend doIt`;
        target.sendMessage(
            {
                type: "compile",
                codeString: script,
                targetId: target.id
            },
            target
        );
        target.sendMessage(
            {
                type: "command",
                commandName: "doIt",
                args: [],
                shouldIgnore: true // Should ignore if System DNU
            },
            target
        );
    },

    // At the moment this simply opens a st-window st-field with
    // information about the available commands for said parts
    _openDebugger: function(partId){
        let target = window.System.partsById[partId];
        let msg = {
            type: "command",
            "commandName": "openDebugger",
            args: [partId]
        };
        target.sendMessage(msg, target);
    }
};

export {
    errorHandler,
    errorHandler as default
};
