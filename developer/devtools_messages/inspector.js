/**
This script is run whenever the devtools are open.
In here, we can create our panel.
*/

alert("hello from debug");
function handleShown() {
  console.log("panel is being shown");
}

function handleHidden() {
  console.log("panel is being hidden");
}

/**
Create a panel, and add listeners for panel show/hide events.
*/
browser.devtools.panels.create(
  "Message Inspector Panel",
  "/icons/distill-48.jpg",
  "/panel.html"
).then((newPanel) => {
  newPanel.onShown.addListener(handleShown);
  newPanel.onHidden.addListener(handleHidden);
});


window.addEventListener("message", function(event) {
    alert("message");
    if(event.source == window && event.data && event.data.direction == "from-System"){
        console.log("got a message from System");
        console.log(event);
    }
}, false);
