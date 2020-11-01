/**
 * Stack
 * ----------------------------
 * I am the Stack Part.
 * I represent a collection of Card parts,
 * along with some extra configurability.
 */
import Part from './Part.js';
import Card from './Card.js';
import {
    BasicProperty
} from '../properties/PartProperties.js';
import {
    addLayoutProperties
} from '../properties/LayoutProperties.js';

class Stack extends Part {
    constructor(owner, name, deserializing=false){
        super(owner);
        this.acceptedSubpartTypes = ["card", "background", "window", "button", "container"];

        // Set up Stack specific
        // PartProperties
        this.partProperties.newBasicProp(
            'cantPeek',
            false
        );
        this.partProperties.newBasicProp(
            'resizable',
            false
        );

        // If we are initializing with a name,
        // set the name property
        if(name){
            this.partProperties.setPropertyNamed(
                this,
                'name',
                name
            );
        }

        // Stacks have the layout set
        // of properties, so we add
        // those
        addLayoutProperties(this);

        // if we are deserializing, we don't need to
        // instantiate any default children
        if (!deserializing) {
            // We construct with an initial Card part,
            // since there needs to be at least one
            let initCard = new Card(this);
            this.addPart(initCard);
        }
    }

    get type(){
        return 'stack';
    }
};

export {
    Stack,
    Stack as default
};
