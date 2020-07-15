/**
 * Entrypoint for WC1 Example for Webpack
 */
import Part from '../parts/Part.js';
import PartView from '../views/PartView.js';

document.addEventListener('DOMContentLoaded', () => {
    window.PartView = PartView;
    window.Part = Part;

    window.customElements.define('part-view', PartView);

    // Do some initial action, ie make a Part instance
    // and then set it as the model for the existing
    // PartView element.
    let main = document.getElementById('main-view');
    let myModel = new Part();
    myModel._owner = myModel; // For now all parts need owners
    main.setModel(myModel);
    window.myModel = myModel;
});
