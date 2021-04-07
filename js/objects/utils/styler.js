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
const sides = ["top", "bottom", "left", "right"];

const cssStyler = (styleObj, propertyName, propertyValue) => {
    switch(propertyName){

    case "background-color":
        _setOrNot(styleObj, "backgroundColor",  _colorToRGBA(styleObj["backgroundColor"], propertyValue));
        break;

    case "background-transparency":
        // here we set the Alpha value of the current styleObj["backgroundColor"] rgba
        _setOrNot(styleObj, "backgroundColor",  _colorTransparencyToRGBA(styleObj["backgroundColor"], propertyValue));
        break;

    case "border-style":
        sides.forEach((s) => {
            _setOrNot(styleObj, `border-${s}-style`,  propertyValue);
        });
        break;

    case "border-top-style":
    case "border-bottom-style":
    case "border-left-style":
    case "border-right-style": {
        let s = propertyName.split("-")[1];
        _setOrNot(styleObj, `border-${s}-style`,  propertyValue);
        break;
    }

    case "border-width":
        sides.forEach((s) => {
            _setOrNot(styleObj, `border-${s}-width`,  _intToPx(propertyValue));
        });
        break;

    case "border-top-width":
    case "border-bottom-width":
    case "border-left-width":
    case "border-right-width": {
        let s = propertyName.split("-")[1];
        _setOrNot(styleObj, `border-${s}-width`,  _intToPx(propertyValue));
        break;
    }

    case "border-color":
        sides.forEach((s) => {
            _setOrNot(styleObj, `border-${s}-color`,  _colorToRGBA(styleObj[`border-${s}-color`], propertyValue));
        });
        break;

    case "border-top-color":
    case "border-bottom-color":
    case "border-top-color":
    case "border-right-color": {
        let s = propertyName.split("-")[1];
        _setOrNot(styleObj, `border-${s}-color`,  _colorToRGBA(styleObj[`border-${s}-color`], propertyValue));
        break;
    }

    case "border-transparency":
        sides.forEach((s) => {
            _setOrNot(styleObj, `border-${s}-color`,  _colorTransparencyToRGBA(styleObj[`border-${s}-color`], propertyValue));
        });
        break;

    case "border-top-transparency":
    case "border-bottom-transparency":
    case "border-top-transparency":
    case "border-right-transparency": {
        let s = propertyName.split("-")[1];
        _setOrNot(styleObj, `border-${s}-color`,  _colorTransparencyToRGBA(styleObj[`border-${s}-color`], propertyValue));
        break;
    }

    case "corner-round":
        _setOrNot(styleObj, 'border-top-left-radius',  _intToPx(propertyValue));
        _setOrNot(styleObj, 'border-top-right-radius',  _intToPx(propertyValue));
        _setOrNot(styleObj, 'border-bottom-left-radius',  _intToPx(propertyValue));
        _setOrNot(styleObj, 'border-bottom-right-radius',  _intToPx(propertyValue));
        break;


    case "corner-top-left-round":
    case "corner-top-right-round":
    case "corner-bottom-left-round":
    case "corner-bottom-right-round":{
        let c1 = propertyName.split("-")[1];
        let c2 = propertyName.split("-")[2];
        _setOrNot(styleObj, `border-${c1}-${c2}-radius`,  _intToPx(propertyValue));
        break;
    }

    case "shadow-left":
    case "shadow-top":
    case "shadow-blur":
    case "shadow-spread":
    case "shadow-color":
    case "shadow-transparency":
        let shadowProp = propertyName.split("-")[1];
        let [left, top, blur, spread, color] = _cssBoxShadow(styleObj["box-shadow"]);
        switch(shadowProp){
        case "color":
            color = _colorToRGBA(color, propertyValue);
            break;
        case "transparency":
            color = _colorTransparencyToRGBA(color, propertyValue);
            break;
        case "left":
            left = _intToPx(propertyValue);
            break;
        case "top":
            top = _intToPx(propertyValue);
            break;
        case "blur":
            blur = _intToPx(propertyValue);
            break;
        case "spread":
            spread = _intToPx(propertyValue);
            break;
        }
        _setOrNot(styleObj, "box-shadow", `${left} ${top} ${blur} ${spread} ${color}`);
        break;

    case "text-color":
        _setOrNot(styleObj, "color",  _colorToRGBA(styleObj["color"], propertyValue));
        break;

    case "text-font":
        _setOrNot(styleObj, "fontFamily",  propertyValue);
        break;

    case "text-size":
        _setOrNot(styleObj, "fontSize", propertyValue);
        break;

    case "text-align":
        _setOrNot(styleObj, "textAlign",  propertyValue);
        break;

    case "text-bold":
        if(propertyValue === true){
            _setOrNot(styleObj, "font-weight",  "bold");
        } else if(propertyValue === false){
            _setOrNot(styleObj, "font-weight",  "normal");
        }
        break;

    case "text-italic":
        if(propertyValue === true){
            _setOrNot(styleObj, "font-style",  "italic");
        } else if(propertyValue === false){
            _setOrNot(styleObj, "font-style",  "normal");
        }
        break;

    case "text-underline":
        if(propertyValue === true){
            _setOrNot(styleObj, "textDecoration",  "underline");
        }
        break;

    case "text-strikethrough":
        if(propertyValue === true){
            _setOrNot(styleObj, "textDecoration",  "line-through");
        }
        break;

    case "text-transparency":
        // here we set the Alpha value of the current styleObj["color"] rgba
        _setOrNot(styleObj, "color",  _colorTransparencyToRGBA(styleObj["color"], propertyValue));
        break;

    case "top":
        _setOrNot(styleObj, "top",  _intToPx(propertyValue));
        break;

    case "left":
        _setOrNot(styleObj, "left",  _intToPx(propertyValue));
        break;

    case "width":
        _setOrNot(styleObj, "width",  _intToPx(propertyValue));
        break;

    case "height":
        _setOrNot(styleObj, "height",  _intToPx(propertyValue));
        break;

    case "text-style":
        _setOrNot(styleObj, "textStyle",  propertyValue);
        break;

    case "rotate":
        _setOrNot(styleObj, "transform",  _intToRotateDeg(propertyValue));
        break;

    case "transparency":
        _setOrNot(styleObj, "opacity",  propertyValue);
        break;

    case "hide":
        if(propertyValue === true){
            styleObj["display"] = "none";
        } else if(propertyValue === false){
            styleObj["display"] = null;
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
};

const _intToRotateDeg = (n) => {
    if(n !== null && n !== undefined){
        if(typeof(n) === "string"){
            n = n.split("deg")[0];
        }
        return `rotate(${n}deg)`;
    }
};


const _intToPx = (n) => {
    if(n !== null && n !== undefined){
        if(typeof(n) === "string"){
            if(n == "fill"){
                return "100%";
            } else if(["thin", "medium", "thick"].indexOf(n) > -1){
                return n;
            }
            n = n.split("px")[0];
        }
        return `${n}px`;
    }
};

// Convert colors to rgba
// change a css color RGB values, preserving the A(lpha) value
const _colorToRGBA = (cssColor, STColor) => {
    if(!STColor){
        return;
    }
    let r, g, b, a, _;
    // ST colors are RGB
    if(STColor.startsWith("rgb")){
        [r, g, b] = STColor.match(/\d+/g);
    } else {
        let colorInfo = basicCSSColors[STColor];
        if(colorInfo){
            r = colorInfo["r"];
            g = colorInfo["g"];
            b = colorInfo["b"];
        } else {
            return;
        }
    }
    if(cssColor){
        [_, _, _, a] = cssColor.match(/[\d\.]+/g);
        // if Alpha is not defined then we set it to 1
        // default for browsers
    }
    if(!a){
        a = 1;
    }
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// change the A(alpha) value, preserving the RGB values
const _colorTransparencyToRGBA = (cssColor, tValue) => {
    if(!cssColor){
        return;
    }
    let r, g, b;
    [r, g, b] = cssColor.match(/\d+/g);
    return `rgba(${r}, ${g}, ${b}, ${tValue})`;
}

// Add more colors as needed
const basicCSSColors = {
    black: {hex: "#000000", r: 0, g: 0, b: 0},
		silver: {hex: "#C0C0C0", r: 192, g: 192, b: 192},
		gray: {hex: "#808080", r: 128, g: 128, b: 128},
		white: {hex: "#FFFFFF", r: 255, g: 255, b: 255},
		maroon: {hex: "#800000", r: 128, g: 0, b: 0},
		red: {hex: "#FF0000", r: 255, g: 0, b: 0},
		purple: {hex: "#800080", r: 128, g: 0, b: 128},
		fuchsia: {hex: "#FF00FF", r: 255, g: 0, b: 255},
		green: {hex: "#008000", r: 0, g: 128, b: 0},
		lime: {hex: "#00FF00", r: 0, g: 255, b: 0},
		olive: {hex: "#808000", r: 128, g: 128, b: 0},
		yellow: {hex: "#FFFF00", r: 255, g: 255, b: 0},
		navy: {hex: "#000080", r: 0, g: 0, b: 128},
		blue: {hex: "#0000FF", r: 0, g: 0, b: 255},
		teal: {hex: "#008080", r: 0, g: 128, b: 128},
		aqua: {hex: "#00FFFF", r: 0, g: 255, b: 255},
};

// take the css box-shadow property and return its
// components (offset-y, offset-x, blur, spread and color)
// if the value is not defined return a default
const _cssBoxShadow = (cssPropValue) =>{
    if(!cssPropValue){
        return ["0px", "0px", "0px", "0px", "rgba(0, 0, 0, 1)"];
    }
    let [intValues, rgba] = cssPropValue.split(" rgba");
    let [left, top, blur, spread] = intValues.split(" ");
    return [left, top, blur, spread, `rgba${rgba}`];
}

export {
    cssStyler,
    cssStyler as default
};
