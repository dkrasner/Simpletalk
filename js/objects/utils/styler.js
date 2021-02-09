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
const styler = (styleObj, propertyName, propertyValue) => {
    switch(propertyName){
    case "background-color":
        styleObj["backgroundColor"] = propertyValue;
    case "font-color":
        styleObj["color"] = propertyValue;
    }

};

export {
    styler,
    styler as default
};
