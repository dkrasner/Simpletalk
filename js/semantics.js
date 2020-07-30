var ohm = require('ohm-js');
// Instantiate the grammar.
var fs = require('fs');
var g = ohm.grammar(fs.readFileSync('./js/ohm/simpletalk.ohm'));


// Create an operation that evaluates the expression. An operation always belongs to a Semantics,
// which is a family of related operations and attributes for a particular grammar.
var semantics = g.createSemantics().addOperation('eval', {
      Exp: function(e) {
              return e.eval();
            },
      AddExp: function(e) {
              return e.eval();
            },
      AddExp_plus: function(left, op, right) {
              return left.eval() + right.eval();
            },
      AddExp_minus: function(left, op, right) {
              return left.eval() - right.eval();
            },
      PriExp: function(e) {
              return e.eval();
            },
      PriExp_paren: function(open, exp, close) {
              return exp.eval();
            },
      number: function(chars) {
              return parseInt(this.sourceString, 10);
            },
});
var match = g.match('1 + (2 - 3) + 4');

export {g, g as default};
