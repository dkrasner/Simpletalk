/*
 * I am the inspector panel.
 * I handle incoming messages from background and
 * send sometimes inject scripts directly into the target
 * window.
 *
 * I also handle how the information is displayed.
 */


var messageTableBody = document.getElementById("message-tbody");

function handleMessageFromBackground(msg) {
    console.log("getting message from background");
    let tr = document.createElement("tr");
    let td;
    for (let i = 0; i < msg.length; i++){
        td = document.createElement("td");
        td.textContent = JSON.stringify(msg[i]);
        tr.appendChild(td);
    }
    messageTableBody.appendChild(tr);
    // document.body.textContent += '\n' + msg;
}


/*
const inspectString = "System.messageLog[System.messageLog.length - 1]";
document.getElementById("button_1").addEventListener("click", () => {
    browser.devtools.inspectedWindow.eval(inspectString)
    .then(handleResult);
});
function handleError(error) {
    if (error.isError) {
        console.log(`Devtools error: ${error.code}`);
    } else {
        console.log(`JavaScript error: ${error.value}`);
    }
}

function handleResult(result) {
    console.log("result");
    console.log(result);
    if (result[1]) {
        handleError(result[1]);
    }
}

*/
