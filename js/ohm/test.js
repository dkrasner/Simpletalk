const assert = require("assert");
const ohm = require("ohm-js");
const fs = require("fs");

const grammar = ohm.grammar(fs.readFileSync("./simpletalk.ohm"));
const semantics = require("./semantics.js");

// This fails (presumably because the "do" in "doSomething" is disallowed due
var testCases = [
    'on dosomething\n\tanswer "it worked"\nend dosomething',
    'on dasomething\n\tanswer "it worked"\nend dasomething',
    'on mouseup\n\tdasomething\nend mouseup\n\non dasomething\n\tanswer "it worked"\nend dasomething'];
for (key in testCases) {
    assert(grammar.match(testCases[key]).succeeded());
}

testCases = [
    "doSomething",
    "daSomething"
];
for (key in testCases) {
    assert(grammar.match(testCases[key], "messageName").succeeded());
}

let script = 'on mouseUp\n\tdoSomething\nend mouseUp\n\non doSomething\n\tanswer "it worked"\nend doSomething';
let match = grammar.match(script);
let languageSemantics = grammar.createSemantics().addOperation('parse', semantics);
languageSemantics(match).parse();
