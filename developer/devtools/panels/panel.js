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
    if (msg.length !== 3){
        console.error("message is not length 3!: " + msg);
    }
    let tr = document.createElement("tr");
    let td;
    let messageEl = _prepMessage(msg[0]);
    let senderEl = _prepObject(msg[1][0], msg[1][1]);
    let receiverEl = _prepObject(msg[2][0], msg[2][1]);
    tr.appendChild(messageEl);
    tr.appendChild(senderEl);
    tr.appendChild(receiverEl);
    messageTableBody.appendChild(tr);
}

function _prepMessage(msg){
    let td = document.createElement("td");
    let pre = document.createElement("pre");
    pre.textContent = JSON.stringify(msg, null, '\t');
    td.appendChild(pre);
    return td;
}

function _prepObject(name, id){
    let td = document.createElement("td");
    let objectStr = `${name} (id=${id})`;
    td.textContent = objectStr;
    return td;
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
