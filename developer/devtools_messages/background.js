/*
browser.runtime.onMessage.addListener(handleMessage);

function handleMessage(request, sender, sendResponse) {
    console.log(message);
}
*/

console.log("this is our backround");
console.log(window);

var portFromCS;

function connected(p) {
    console.log("connected to the runtime port");
    console.log(p);
    portFromCS = p;
    // portFromCS.postMessage({greeting: "hi there content script!"});
    portFromCS.onMessage.addListener(function(m) {
         console.log("In background script, received message from content script")
         console.log(m.greeting);
    });
}

browser.runtime.onConnect.addListener(connected);

// browser.browserAction.onClicked.addListener(function() {
//     portFromCS.postMessage({greeting: "they clicked the button!"});
// });
