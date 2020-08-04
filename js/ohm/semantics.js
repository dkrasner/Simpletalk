/* I am dictionary that represent semantics actions
 * associated with the SimpleTalk grammar. For every
 * node-rule in the grammar I offer and action, or a
 * function that takes as it's argument the string values
 * at the corresponding node.
 */

let simpleTalkSemantics = {
    command_arrowCardNavigation: function(arrowKey, space, direction){
        let d = direction.source.sourceString;
        switch(d.split(" ")[1]){
            case "up":
                return "up";
            case "down":
                return "down";
            case "left":
                return "left";
            case "right":
                return "right";

        }
    },

    direction: function(d){
        return this.sourceString;
    }
}

export {simpleTalkSemantics as default}
