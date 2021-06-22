// ID related utilities

import { v4 as uuidv4 } from 'uuid';

/**
 * ID Maker
 * ------------------------------------
 * I am responsible for creating globally
 * unique ID values for Parts in the SimpleTalk
 * world.
 * HC requires that all Parts have unique ids and
 * that these should not be repeated in any given
 * "application" instance.
 * We need to determine what an "application" is
 * in our context, but regardless we can use this
 * module as a drop in replacement, implementing
 * UUIDs or URLs or whatever we want.
 * For now we just increment an integer.
 */
const idMaker = {
    new: function(){
        let id = uuidv4();
        return id.replace(/-/g, '');
    }
};

/* ID checker
 * --------------------------------------
 * I am responsible for checking whether an id is
 * is valid and returning it if so
 */
const isValidId = function(id) {
    if(id === null || id === undefined || id === ""){
        return false;
    }
    if(id.length != 32 || id.match('[a-z0-9]*')[0].length != 32) {
        return false;
    }
    return id;
};

export {
    idMaker,
    isValidId,
    idMaker as default
};
