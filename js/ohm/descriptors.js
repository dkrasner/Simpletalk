/**
 * Evaluation Descriptors
 * -----------------------------------
 * This module contains the base "descriptors" for
 * different types of objects whose evaluation will be
 * delayed and evlauated with the compiler's `evaluate()`
 * function at command function *call time*.
 * These descriptors are completely serializable as JSON,
 * and should always be used in combination with Object.assign.
 */
const STVariable = {
    isVariable: true,
    name: undefined
};

const STPartReference = {
    isPartReference: true,
    objectType: undefined,
    objectId: undefined,
    name: undefined,
    context: 'this'
};

export {
    STVariable,
    STPartReference
};
