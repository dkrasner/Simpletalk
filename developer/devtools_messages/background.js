/*
browser.runtime.onMessage.addListener(handleMessage);

function handleMessage(request, sender, sendResponse) {
    console.log(message);
}
*/

var portFromCS;

function connected(p) {
    portFromCS = p;
    portFromCS.postMessage({greeting: "hi there content script!"});
    portFromCS.onMessage.addListener(function(m) {
        console.log("In background script, received message from content script")
        console.log(m.greeting);
    });
}

browser.runtime.onConnect.addListener(connected);
browser.browserAction.onClicked.addListener(function() {
    portFromCS.postMessage({greeting: "they clicked the button!"});
});

