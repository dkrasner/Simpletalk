/**
 * Part
 * -------------------------------
 * I represent the prototype object for all
 * SimpleTalk parts.
 */

import './PartCollection';
import '../utils/idMaker';

class Part(){
    contructor(anOwnerPart){
        this.partsCollection = new PartCollection(this);
        this._owner = anOwnerPart;
        this._id = idMaker.next();

        // Bind methods
        this.getStack = this.getStack.bind(this)
    }

    // Return the Stack in which this part is
    // embedded. Involves a recursive lookup.
    // If this part is itself a Stack, just
    // return itself.
    getStack(){
        if(this.isStack){
            return this;
        }
        if(this._owner == null){
            return null;
        }
        return this._owner.getStack();
    }
}
