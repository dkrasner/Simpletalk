const assert = require("assert");
const ohm = require("ohm-js");
const fs = require("fs");

const grammar = ohm.grammar(fs.readFileSync("./simpletalk.ohm"));

const script = 'on mouseUp\n\tdoSomething\nend mouseUp\n\non doSomething\n\tanswer "it worked"\nend doSomething';
assert(grammar.match(script).succeeded())
