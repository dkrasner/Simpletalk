// ID related utilities

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
    count: -1, // Will be incremented to 0 on first use
    new: function(){
        this.count = this.count + 1;
        return this.count;
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
    if(Number.isInteger(id) && id >= 0){
        return id;
    }
    id = id.toString();
    // check to see if the id has any non [0-9]
    // characters
    if(id.match(/(?!\d)/g).length > 1){
        return false;

    }
    return id;
};

export {
    idMaker,
    isValidId,
    idMaker as default
};
