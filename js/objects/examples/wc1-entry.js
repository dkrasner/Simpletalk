/**
 * Entrypoint for WC1 Example for Webpack
 */
import Part from '../parts/Part.js';
import PartView from '../views/PartView.js';
import WorldStack from '../parts/WorldStack.js';
import WorldView from '../views/WorldView.js';

document.addEventListener('DOMContentLoaded', () => {
    // Register the custom elements
    window.customElements.define('world-view', WorldView);
});
