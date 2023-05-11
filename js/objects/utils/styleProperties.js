/**
 * Helpers for setting up various
 * style properties
 */


/**
 * Basic style properties are those
 * common to all (visual) Parts
 */
const sides = ["top", "bottom", "left", "right"];

const addBasicStyleProps = (target) => {
    target.partProperties.newStyleProp(
        'background-transparency',
        1,
    );
    target.partProperties.newStyleProp(
        'background-color',
        "rgb(255, 255, 255)", // white 
    );
    target.partProperties.newStyleProp(
        'transparency',
        1.0,
    );
    sides.forEach((s) => {
        target.partProperties.newStyleProp(
            `border-${s}-style`,
            'solid'
        );
    });
    sides.forEach((s) => {
        target.partProperties.newStyleProp(
            `border-${s}-width`,
            0,
        );
    });
    sides.forEach((s) => {
        target.partProperties.newStyleProp(
            `border-${s}-color`,
            "rgb(0, 0, 0)", // black
        );
    });
    sides.forEach((s) => {
        target.partProperties.newStyleProp(
            `border-${s}-transparency`,
            1
        );
    });
    target.partProperties.newStyleProp(
        'shadow-left',
        0
    );
    target.partProperties.newStyleProp(
        'shadow-top',
        0
    );
    target.partProperties.newStyleProp(
        'shadow-blur',
        0
    );
    target.partProperties.newStyleProp(
        'shadow-spread',
        0
    );
    target.partProperties.newStyleProp(
        'shadow-color',
        "rgb(238, 238, 238)", // grey
    );
    target.partProperties.newStyleProp(
        'shadow-transparency',
        1
    );
    target.partProperties.newStyleProp(
        'corner-top-left-round',
        0
    );
    target.partProperties.newStyleProp(
        'corner-top-right-round',
        0
    );
    target.partProperties.newStyleProp(
        'corner-bottom-left-round',
        0
    );
    target.partProperties.newStyleProp(
        'corner-bottom-right-round',
        0
    );
};

/**
 * Style properties for Parts that can
 * be moved and that can have explicit
 * dimensions. Examples: buttons, fields.
 * Examples of those that can't: Cards, Stacks
 */
const addPositioningStyleProps = (target) => {
    target.partProperties.newStyleProp(
        'hide',
        false,
    );
    // setting width and height to null
    // effectively forces to the default size
    // of the button to fit the button name
    target.partProperties.newStyleProp(
        'width',
        100,
    );
    target.partProperties.newStyleProp(
        'height',
        null,
    );
    target.partProperties.newStyleProp(
        'top',
        0,
    );
    target.partProperties.newStyleProp(
        'left',
        0,
    );
    target.partProperties.newStyleProp(
        'rotate',
        null,
    );
    // column and row represent the part's
    // coordinate within a grid (applicable only
    // if the parent part layout is 'grid')
    target.partProperties.newStyleProp(
        'grid-column',
        null,
    );
    target.partProperties.newStyleProp(
        'grid-row',
        null,
    );

    // horizontal-resizing specifies a strategy
    // for how this Part should adjust its
    // horizontal axis relative to the parent.
    // Possible values are:
    // * rigid - Stick to the top, left, width
    // and height properties as they are explicitly
    // set;
    // * shrink-wrap - Become large enough on the hori-
    // zontal axis only to fit any child contents;
    // * space-fill - Fill as much as we can in the
    // horizontal axis in the parent Part.
    target.partProperties.newStyleProp(
        'horizontal-resizing',
        'rigid'
    );

    // vertical-resizing specifies a strategy
    // for how this Part should adjust its
    // vertical axis relative to the parent.
    // Possible values are:
    // * rigid - Stick to the top, left, width
    // and height properties as they are explicitly
    // set;
    // * shrink-wrap - Become large enough on the hori-
    // zontal axis only to fit any child contents;
    // * space-fill - Fill as much as we can in the
    // vertical axis in the parent Part.
    target.partProperties.newStyleProp(
        'vertical-resizing',
        'rigid'
    );

    // Margin specifies some space between the
    // target Part and any other Parts that might
    // be adjacent to it in a common Owner. It will
    // not be in effect when the owner is using a
    // strict layout.
    target.partProperties.newStyleProp(
        'top-margin',
        null
    );
    target.partProperties.newStyleProp(
        'right-margin',
        null
    );
    target.partProperties.newStyleProp(
        'bottom-margin',
        null
    );
    target.partProperties.newStyleProp(
        'left-margin',
        null
    );

    // Pinning specifies whether or not
    // a given part should "stick" to a
    // particular side of its owner Part.
    // Pinning properties only have effect
    // inside of Parts with a strict layout
    target.partProperties.newDynamicProp(
        'pinning-top',
        pinningSetter,
        function(propOwner, propObject){
            return propObject._value;
        },
        false, // not read only
        false // default value

    );
    target.partProperties.newDynamicProp(
        'pinning-left',
        pinningSetter,
        function(propOwner, propObject){
            return propObject._value;
        },
        false, // not read only
        false // default value

    );
    target.partProperties.newDynamicProp(
        'pinning-bottom',
        pinningSetter,
        function(propOwner, propObject){
            return propObject._value;
        },
        false, // not read only
        false // default value
    );
    target.partProperties.newDynamicProp(
        'pinning-right',
        pinningSetter,
        function(propOwner, propObject){
            return propObject._value;
        },
        false, // not read only
        false // default value
    );
    target.partProperties.newDynamicProp(
        // Possible values for the compound
        // 'pinning' property are:
        // *"none" or null
        // *top
        // *top-right
        // *top-left
        // *bottom
        // *bottom-right
        // *bottom-left
        // *left
        // *right
        'pinning',
        // Setter
        function(propOwner, propObject, value){
            if(!value || value == "none"){
                ['top', 'left', 'right', 'bottom'].forEach(side => {
                    let pin = `pinning-${side}`;
                    propOwner.partProperties.setPropertyNamed(
                        propOwner,
                        pin,
                        false
                    );
                });
                return;
            }
            pinningAdjust(propOwner, value);
        },

        // Getter
        function(propOwner, propObject){
            let top = propOwner.partProperties.getPropertyNamed(
                propOwner,
                'pinning-top'
            );
            let bottom = propOwner.partProperties.getPropertyNamed(
                propOwner,
                'pinning-bottom'
            );
            let left = propOwner.partProperties.getPropertyNamed(
                propOwner,
                'pinning-left'
            );
            let right = propOwner.partProperties.getPropertyNamed(
                propOwner,
                'pinning-right'
            );
            let result = [];
            if(top){
                result.push('top');
            } else if(bottom){
                result.push('bottom');
            }
            if(left){
                result.push('left');
            } else if(right){
                result.push('right');
            }

            return result.join('-');
        }
    );
};

/**
 * Style properties for Parts that display
 * text
 */
const addTextStyleProps = (target) => {
    target.partProperties.newStyleProp(
        'text-align',
        'left',
        'cssTextStyle'
    );
    target.partProperties.newStyleProp(
        'text-font',
        'default',
        'cssTextStyle'
    );
    target.partProperties.newStyleProp(
        'text-color',
        "rgb(0, 0, 0)", // black
        'cssTextStyle'
    );
    target.partProperties.newStyleProp(
        'text-transparency',
        1,
        'cssTextStyle'
    );
    target.partProperties.newStyleProp(
        'text-style',
        'plain',
        'cssTextStyle'
    );
    target.partProperties.newStyleProp(
        'text-bold',
        false,
        'cssTextStyle'
    );
    target.partProperties.newStyleProp(
        'text-italic',
        false,
        'cssTextStyle'
    );
    target.partProperties.newStyleProp(
        'text-size',
        15,
        'cssTextStyle'
    );
};

/**
 * Basic layout styles are those pertaining
 * to the positioning and resizing of subparts.
 * Examples include Cards and Area
 */
const addLayoutStyleProps = (target) => {
    // The 'layout' property is
    // one of two strings:
    // strict - Equivalent to the absolute
    // layout based strictly on coordinates
    // list - Will force items into either a row
    // or column list, based on the pairing with
    // the 'listDirection' property
    target.partProperties.newBasicProp(
        'layout',
        'strict'
    );

    // grid size determines the number of
    // columns and rows for the grid.
    // Example: N,M for N columns and M rows 
    target.partProperties.newStyleProp(
        'grid-size',
        null
    );

    // list-direction specifies row or column
    // and will only have an effect whent the
    // layout property is set to 'list'
    target.partProperties.newBasicProp(
        'list-direction',
        'row'
    );

    // Wrapping specifies whether a list should
    // wrap along its dominant dimension (row or column)
    target.partProperties.newBasicProp(
        'list-wrapping',
        false
    );

    // Padding specifies some space from the
    // border of the target Part to the beginning
    // of the layout of any subparts.
    target.partProperties.newStyleProp(
        'top-padding',
        null
    );
    target.partProperties.newStyleProp(
        'right-padding',
        null
    );
    target.partProperties.newStyleProp(
        'bottom-padding',
        null
    );
    target.partProperties.newStyleProp(
        'left-padding',
        null
    );

    // List alignment describes how elements in
    // a list layout should align themselves along
    // the dominant dimension (row or column)
    // They are essentially proxies for align-items
    target.partProperties.newBasicProp(
        'list-alignment',
        null
    );

    // List distribution describes how elements
    // in a list layout should distribute themselves
    // across or along the dominant dimension
    // (row or column)
    // This is essentially a wrapper for justify-content
    target.partProperties.newBasicProp(
        'list-distribution',
        null
    );
};

/**
  * HELPERS
 **/

const pinningSetter = (propOwner, propObject, value) => {
    let side = propObject.name.split("-")[1];
    let topLeft;
    switch (side){
    case "right":
        topLeft = "left";
        break;
    case "bottom":
        topLeft = "top";
        break;
    default:
        topLeft = side;
    }
    // we'll need to fix and un-fix the corresponding top or left property depending
    // on whether value is true of false, respectively
    let prop = propOwner.partProperties.findPropertyNamed(
        topLeft 
    );
    let oppositeSide;
    switch (side){
    case "left":
        oppositeSide = "right";
        break;
    case "right":
        oppositeSide = "left";
        break;
    case "top":
        oppositeSide = "bottom";
        break;
    case "bottom":
        oppositeSide = "top";
        break;
    }
    if(value){
        // first make sure that pinning-bottom is false
        propOwner.partProperties.setPropertyNamed(
            propOwner,
            `pinning-${oppositeSide}`,
            false
        );
        prop.readOnly = true;
    } else {
        // reset the value back to trigger a notification
        prop.setValue(propOwner, prop._value);
        prop.readOnly = false;
    }
    propObject._value = value;
};

const pinningAdjust = (owner, value) => {
    let sides = ['top', 'left', 'right', 'bottom'];
    sides.forEach(side => {
        if(value.startsWith(side)){
            owner.partProperties.setPropertyNamed(
                owner,
                `pinning-${side}`,
                true
            );
        } else {
            owner.partProperties.setPropertyNamed(
                owner,
                `pinning-${side}`,
                false
            );
        }
    });

    if(value.includes("-")){
        if(value.endsWith('left')){
            owner.partProperties.setPropertyNamed(
                owner,
                'pinning-left',
                true
            );
            owner.partProperties.setPropertyNamed(
                owner,
                'pinning-right',
                false
            );
        } else if(value.endsWith('right')){
            owner.partProperties.setPropertyNamed(
                owner,
                'pinning-left',
                false
            );
            owner.partProperties.setPropertyNamed(
                owner,
                'pinning-right',
                true
            );
        }
    }
};

export {
    addBasicStyleProps,
    addPositioningStyleProps,
    addTextStyleProps,
    addLayoutStyleProps
};
