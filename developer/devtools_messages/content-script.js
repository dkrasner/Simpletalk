/*
 * I am the conect script which is injected into the target
 * document window when devtools is open.
 *
 * I create connection port to handle communication between myself
 * and the devtools browser script (which then passes these messages
 * onto the devtools panel scripts).
 *
 * In addition, I handle incoming window level messaging (
 * window.postMessage() API) and routing these application
 * originating messaged to the devtools background.
 */

var portFromCS = browser.runtime.connect({name:"port-from-cs"});

// at the moment nothing much is done with messages going
// to the content-script port
portFromCS.onMessage.addListener(function(msg) {
    console.log("recieved message from background", msg);
});

window.addEventListener("message", (event) => {
    // filter on the target windows url
    // TODO this origin url should defined at runtime
    if(event.origin === "http://localhost:8000"){
        // reoute the message to the background script
        portFromCS.postMessage({data: event.data});
    }
}, false);
