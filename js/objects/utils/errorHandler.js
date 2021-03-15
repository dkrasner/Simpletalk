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
        // first locate the script editor in question
        let scriptEditor = window.System.findScriptEditorByTargetId(aMessage.partId);
        if(!scriptEditor){
            this._openScriptEditor(aMessage.partId);
            scriptEditor = window.System.findScriptEditorByTargetId(aMessage.partId);
        }
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
        let textContent = scriptEditor.model.partProperties.getPropertyNamed(scriptEditor, "textContent");
        let textLines = textContent.split("\n");
        // replace said text line with an error marker
        textLines[errorLineNum] += ` --<<<[Expected:${expectedText}; ruleName: "${ruleName}"]`;
        textContent = textLines.join("\n");
        scriptEditor.model.partProperties.setPropertyNamed(scriptEditor.model, "textContent", textContent);
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
            let scriptEditor = window.System.findScriptEditorByTargetId(originalSender.id);
            if(!scriptEditor){
                this._openScriptEditor(originalSender.id);
                scriptEditor = window.System.findScriptEditorByTargetId(originalSender.id);
            }
            let textContent = scriptEditor.model.partProperties.getPropertyNamed(scriptEditor, "textContent");
            let textLines = textContent.split("\n");
            // offending command text line with an error marker
            let regex = new RegExp(`\\s*${commandName}(\s|$)`, 'g');
            for(let i = 0; i < textLines.length; i++){
                let line = textLines[i];
                if(line.match(regex)){
                    textLines[i] = line += ` --<<<[MessageNotUnderstood: command; commandName: "${commandName}"]`;
                }
            }
            textLines.forEach((line) => {
            });
            textContent = textLines.join("\n");
            scriptEditor.model.partProperties.setPropertyNamed(scriptEditor.model, "textContent", textContent);

            // finally open the debugger (or current version thereof)
            // NOTE: this is a bit dangerous, b/c if the System doesn't
            // handle the `openDebugger` command anywhere it will throw
            // a MNU error, which will then invoke this handler cuasing
            // an infinite loop!
            this._openDebugger(originalSender.id);
        }
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
        let msg = {
            type: "command",
            "commandName": "openSimpletalkGrammar",
            args: [ruleName]
        };
        target.sendMessage(msg, target);
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
