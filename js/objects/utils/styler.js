/**
 * Styler
 * ------------------------------------
 * I am responsible for converting
 * SimpleTalk visual styling to a dict
 * Object of CSS JavaScript type key-value pairs
 */

/** I style the styleObj
 * styleObj: css JavaScript key:value pairs
 * propertyName: (SimpleTalk) styling property name
 * propertyValue: (SimpleTalk) styling property value
 */
const cssStyler = (styleObj, propertyName, propertyValue) => {
    switch(propertyName){

    case "background-color":
        styleObj["backgroundColor"] = propertyValue;

    case "text-color":
        styleObj["color"] = propertyValue;

    case "font":
        styleObj["fontFamily"] = propertyValue;

    case "text-size":
        styleObj["fontSize"] = propertyValue;

    case "text-align":
        styleObj["textAlign"] = propertyValue;

    case "text-style":
        styleObj["textStyle"] = propertyValue;

    case "name-visible":
        if(propertyValue === false){
            styleObj["color"] = "transparent";
        }

    case "visible":
        // TODO should this really be using the 'display' css prop
        if(propertyValue === false){
            styleObj["visibility"] = "hidden";
        } else if(propertyValue === true){
            styleObj["visibility"] = "visible";
        }
    }
    return styleObj;

};

export {
    cssStyler,
    cssStyler as default
};
