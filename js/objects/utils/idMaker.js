i/**
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

export {
    idMaker,
    idMaker as default
};
