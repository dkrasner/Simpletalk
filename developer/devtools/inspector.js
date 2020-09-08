/*
 * I am run whenever the devtools are open and am responsible
 * for creating panels and setting up communiction (ports)
 * between them and the background script.
 *
/**
Create a panel, and add listeners for panel show/hide events.
*/
browser.devtools.panels.create(
    "Message Inspector Panel",
    "/icons/distill-48.jpg",
    "/panels/panel.html"
).then((panel) => {
    var _window; // hold a reference to panel.html

    // if the panel window is undefined, i.e. the panel is closed
    // we need to store the data coming through the port
    var data = [];
    // create a connection/port which will handle all communication
    // between the panel and the background script
    var portFromPanel = browser.runtime.connect({name: "port-from-panel"});
    portFromPanel.onMessage.addListener(function(msg) {
        if (_window){
            // handleMessageFromBackground() is defined in panel.js
            _window.handleMessageFromBackground(msg);
        } else {
            // if the panel's window is undefined store the data for now
            data.push(msg);
        }
    });

    // when the panel button is clicked
    panel.onShown.addListener(function tmp(panelWindow) {
        console.log("panel is being shown");
        // clean up any stale listeners
        panel.onShown.removeListener(tmp);

        // set the _window var to panelWindow which allows handling
        // of messages by the panel, i.e. in the panel's window context
        _window = panelWindow;
        var msg;
        // if any data was logged while the panel was not available
        // send it along now
        while (msg = data.shift()){
            _window.handleMessageFromBackground(msg);
        };
        // If we ever need to send messages back via the port
        // we can do that as below
        _window.respond = function(msg) {
             portFromPanel.postMessage(msg);
        }
    });
    panel.onHidden.addListener(function() {console.log("panel is being hidden")});
});
