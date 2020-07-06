/**
 * Part
 * -------------------------------
 * I represent the prototype object for all
 * SimpleTalk parts.
 */

import './PartCollection';
import '../utils/idMaker';
import '../properties/PropertyCollection';

class Part(){
    contructor(anOwnerPart){
        this.partsCollection = new PartCollection(this);
        this.partProperties = new PropertyCollection(this);
        this._owner = anOwnerPart;

        // Bind methods
        this.setupProperties = this.setupProperties.bind(this);
        this.getStack = this.getStack.bind(this);

        // Finally, we finish initialization
        this.setupProperties();
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

    // Configures the specific properties that the
    // given part can expect, along with any default
    // values.
    // Descendant Parts should override this method
    // in their own constructor after calling super,
    // so that they get the parent's general properties
    // too.
    setupProperties(){
        // Here, we set up properties common
        // to ALL Parts in the system.
        let myProperties = [
            // Use the external module
            // to generate a unique id
            ['id', idMaker.next()],

            // Returns or sets the bottom of the part
            ['bottom', 0],

            // Returns or sets the 'contents' of this
            // part. Mostly for fields and similar
            ['contents', null],

            // Returns or sets whether or not this part
            // is enabled.
            ['enabled', true],

            // Returns or sets the height of the part
            // in pixels
            ['height', 0],

            // Returns or sets the center point
            // of the part. Alias 'loc'
            [
                ['location', 'loc'],
                0
            ],

            // Returns or sets the script-addressable
            // name for the part.
            ['name', ''],


        ]
}
