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
        _setOrNot(styleObj, "backgroundColor",  propertyValue);
        break;

    case "text-color":
        _setOrNot(styleObj, "color",  propertyValue);
        break;

    case "font":
        _setOrNot(styleObj, "fontFamily",  propertyValue);
        break;

    case "text-size":
        _setOrNot(styleObj, "fontSize", propertyValue);
        break;

    case "text-align":
        _setOrNot(styleObj, "textAlign",  propertyValue);
        break;

    case "text-style":
        _setOrNot(styleObj, "textStyle",  propertyValue);
        break;

    case "name-visible":
        if(propertyValue === false){
            styleObj["color"] = "transparent";
        } else {
            styleObj["color"] = "initial";
        }
        break;

    case "visible":
        // TODO should this really be using the 'display' css prop
        if(propertyValue === false){
            styleObj["visibility"] = "hidden";
        } else if(propertyValue === true){
            styleObj["visibility"] = "visible";
        }
        break;

    default:
        // for the default we simply allow ST style names to map 1-1
        // to CSS/JS style names. This is only somewhat safe, since the DOM
        // will simply ignore nonsense names without throwing an error. But it
        // does allow us to avoid writing a rule for every term (example: width,
        // height, top, left etc)
        _setOrNot(styleObj, propertyName,  propertyValue);
    }
    return styleObj;

};

// In order to avoid clashing with views interacting
// the style attribute directly we ignore everything that
// is either null or undefined
// TODO review this decision!
const _setOrNot = (styleObj, name, value) => {
    if(value !== null && value !== undefined){
        styleObj[name] = value;
    }
}

export {
    cssStyler,
    cssStyler as default
};
