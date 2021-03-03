/**
 * Helpers for setting up various
 * style properties
 */


/**
 * Basic style properties are those
 * common to all (visual) Parts
 */
const addBasicStyleProps = (target) => {
    target.partProperties.newStyleProp(
        'background-transparency',
        1,
    );
    target.partProperties.newStyleProp(
        'background-color',
        null
    );
    target.partProperties.newStyleProp(
        'transparency',
        1.0,
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
        null,
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
};

/**
 * Style properties for Parts that display
 * text
 */
const addTextStyleProps = (target) => {
    target.partProperties.newStyleProp(
        'text-align',
        'left',
    );
    target.partProperties.newStyleProp(
        'text-font',
        'default',
    );
    target.partProperties.newStyleProp(
        'text-color',
        "rgba(0, 0, 0, 1)", // black
    );
    target.partProperties.newStyleProp(
        'text-transparency',
        1,
    );
    target.partProperties.newStyleProp(
        'text-style',
        'plain',
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
    target.partProperties.newStyleProp(
        'layout',
        'strict'
    );
    
    // list-direction specifies row or column
    // and will only have an effect whent the
    // layout property is set to 'list'
    target.partProperties.newStyleProp(
        'list-direction',
        'row'
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
};

export {
    addBasicStyleProps,
    addPositioningStyleProps,
    addTextStyleProps,
    addLayoutStyleProps
};
