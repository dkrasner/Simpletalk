/**
 * WC Testing Preload
 * ----------------------------------
 * This preload file creates a JSDOM instance
 * and sets some global variables that other
 * modules (like System) will expect at the global scope,
 * like window or HTMLElement.
 * This file is not a test but should be required when
 * launching mocha via the require flag
 */
var jsdom = require('jsdom');

global.window = new jsdom.JSDOM().window;
global.document = window.document;
global.HTMLElement = window.HTMLElement;
global.fetch = require("node-fetch");
global.DOMParser = window.DOMParser;
document.execCommand = function execCommandMock() { };

// add the grammar in
var fs = require('fs');
window.grammar = fs.readFileSync('./js/ohm/simpletalk.ohm');

// Initialize the system
const System = require('../System.js').System;
global.System = System;
global.window.System = System;
// NOTE: do not call initialLoad() or
// registerCustomElements() here.
// Because System attaches a listener
// for DOMContentLoaded to the document
// object -- which here is already defined
// in jsdom -- it will call those automatically.
// Calling them twice will produce errors!

/*import { Window } from 'happy-dom';
const window = new Window();
const document = window.document;
global.window = window;
global.document = document;
global.HTMLElement = window.HTMLElement;*/
