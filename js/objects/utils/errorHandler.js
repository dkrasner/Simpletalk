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
        textLines[errorLineNum] += ` <<<[Expected:${expectedText}; ruleName: "${ruleName}"]`;
        textContent = textLines.join("\n");
        scriptEditor.setTextValue(textContent);
        // open the grammar
        this._openGrammar(aMessage.partId, ruleName);
    },

    _openScriptEditor: function(partId){
        let targetView = window.System.findViewById(partId);
        let msg = {
            type: "command",
            "commandName": "openScriptEditor",
            args: [partId]
        };
        targetView.model.sendMessage(msg, targetView.model);
    },

    _openGrammar: function(partId, ruleName){
        let targetView = window.System.findViewById(partId);
        let msg = {
            type: "command",
            "commandName": "openSimpletalkGrammar",
            args: [ruleName]
        };
        targetView.model.sendMessage(msg, targetView.model);
    }
};

export {
    errorHandler,
    errorHandler as default
};
