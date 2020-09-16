/*
 * The background script handles communication to and from
 * the content script, embedded in the document, and
 * the panel scripts, living in devtools.
 * These communiccation are handled by browser.runtime connection
 * ports.
 * The connections are initialized int he content and panel scripts,
 * respectively. Here we listen for these connection and create
 * connection/port specific handlers.
 */
var portFromCS;
var portFromPanel;

function connected(port) {
    // handle all communication to and from the panel
    if (port.name === "port-from-panel"){
        portFromPanel = port;
        // at the moment we don't do anything with messages coming
        // from the panels
        portFromPanel.onMessage.addListener(function(msg) {
            console.log("recieved message from panel", msg);
        });
    };
    // handle all communication to and from the content script
    if (port.name === "port-from-cs"){
        portFromCS = port;
        portFromCS.onMessage.addListener(function(msg) {
            // Having received a message from the content script, i.e.
            // from the target window we forward this message to the panels
            // if the connection is not alive we log this in the devtools's
            // debugger console
            notifyDevtoolsPabel(msg.data);
        });
    }
    // notify if the port has disconnected
    port.onDisconnect.addListener(function(port) {
        if (port.name === "port-from-panel" || port.name === "port-from-cs"){
            console.log(`${port.name}} has disconnected`);
        };
    });
}

browser.runtime.onConnect.addListener(connected);

function notifyDevtoolsPabel(msg){
    if (portFromPanel){
        portFromPanel.postMessage(msg);
    } else {
        console.log("failed to send message to devtools panel: port disconnected");
    }
}

// browser.browserAction.onClicked.addListener(function() {
//     portFromCS.postMessage({greeting: "they clicked the button!"});
// });
