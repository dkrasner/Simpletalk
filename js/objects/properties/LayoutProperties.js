/**
 * Part LayoutProperties
 * ------------------------------
 * I am a 'mixin' to be used on Part instances
 * that will supply them with the needed Part
 * Properties relevant to Layouts.
 */
const addLayoutProperties = (aPart, kind='absolute') => {
    // The kind of layout. For now
    // only 'absolute' and 'list' are possible.
    // absolute is the default position
    // layout. It is also the default
    aPart.partProperties.newBasicProp(
        'layout',
        kind
    );

    // If the layout is 'list', this
    // property determines the list direction.
    // Valid values are 'colmn' and 'row'.
    // Defaults to 'column'
    aPart.partProperties.newBasicProp(
        'listDirection',
        'column'
    );

    // If the layout is 'list', this
    // property determines the spacing
    // between list items.
    aPart.partProperties.newBasicProp(
        'listItemSpacing',
        null
    );

};

export {
    addLayoutProperties
};
