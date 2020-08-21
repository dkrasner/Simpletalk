const assert = require("assert");
const ohm = require("ohm-js");
const fs = require("fs");

const grammar = ohm.grammar(fs.readFileSync("./simpletalk.ohm"));

// This fails (presumably because the "do" in "doSomething" is disallowed due
// to being interpreted as a keyword.
const bad_script1 = 'on doSomething\n\tanswer "it worked"\nend doSomething';
assert(grammar.match(bad_script1).failed())

// This succeeds (and supports the keyword idea from the previous example).
const good_script1 = 'on daSomething\n\tanswer "it worked"\nend daSomething';
assert(grammar.match(good_script1).succeeded())

// This fails (presumably because messages won't parse).
const bad_script2 = 'on mouseUp\n\tdaSomething\nend mouseUp\n\non daSomething\n\tanswer "it worked"\nend daSomething';
assert(grammar.match(bad_script2).failed())
