/**
    * Handle errors from the injected script.
    * Errors may come from evaluating the JavaScript itself
    * or from the devtools framework.
    * See https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/devtools.inspectedWindow/eval#Return_value
    * */
function handleError(error) {
    if (error.isError) {
        console.log(`Devtools error: ${error.code}`);
    } else {
        console.log(`JavaScript error: ${error.value}`);
    }
}

/**
 * Handle the result of evaluating the script.
 * If there was an error, call handleError.
 * */
function handleResult(result) {
    console.log("result");
    console.log(result);
    if (result[1]) {
        handleError(result[1]);
    }
}

const inspectString = "System.messageLog[System.messageLog.length - 1]";
document.getElementById("button_1").addEventListener("click", () => {
    browser.devtools.inspectedWindow.eval(inspectString)
    .then(handleResult);
});

