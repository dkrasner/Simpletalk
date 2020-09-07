
/*
window.addEventListener("message", function(event) {
    // console.log("message")
    if(event.source == window && event.data && event.data.direction == "from-System"){
        console.log("sending runtime message to background");
        browser.runtime.sendMessage({
            tabId: browser.devtools.inspectedWindow.tabId,
            data: event});
    }
}, false);
*/

var myPort = browser.runtime.connect({name:"port-from-cs"});
console.log("port runtime connection defined in content script:")
console.log("my port");
// myPort.postMessage({greeting: "hello from content script"});

myPort.onMessage.addListener(function(m) {
    console.log("In content script, received message from background script: ");
    console.log(m.greeting);
});

window.addEventListener("message", (event) => {
    myPort.postMessage({greeting: event.data});
}, false);

// document.body.addEventListener("click", () => {
//    myPort.postMessage({greeting: "they clicked the page!"});
// });
// myPort.postMessage({greeting: "ok this is a message from content"});
