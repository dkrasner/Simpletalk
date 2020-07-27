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

/*import { Window } from 'happy-dom';
const window = new Window();
const document = window.document;
global.window = window;
global.document = document;
global.HTMLElement = window.HTMLElement;*/
