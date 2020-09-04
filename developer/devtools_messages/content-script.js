window.addEventListener("message", function(event) {
    // console.log("message")
    if(event.source == window && event.data && event.data.direction == "from-System"){
        console.log("sending runtime message to background");
        browser.runtime.sendMessage({
            tabId: browser.devtools.inspectedWindow.tabId,
            data: event});
    }
}, false);
