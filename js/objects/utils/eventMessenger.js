/**
 * Event messenger
 * ------------------------------------
 * I am responsible for sending a 'standard'
 * message for web-like event handling.
 */

function eventMessenger(eventName, part){
    let message = {
        type: "command",
        commandName: eventName,
        args: [],
        shouldIgnore: true
    }
    part.sendMessage(message, part);
    return message;
};

export {
    eventMessenger,
    eventMessenger as default
};
