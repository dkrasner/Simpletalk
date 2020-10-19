/**
 * PartView Lifecycle Tests
 * -------------------------------------
 * Here we test the desired ability of PartView
 * descendants to make use of the various lifecycle
 * methods we've built into the base PartView
 *
 */
import 'jsdom-global/register';
import chai from 'chai';
const assert = chai.assert;

import Part from '../parts/Part.js';
import PartView from '../views/PartView.js';

class TestView extends PartView {
    constructor(){
        super();
        this.afterModelSetCalled = false;
        this.afterConnectedCalled = false;
        this.afterDisconnectedCalled = false;
    }

    afterConnected(){
        this.afterConnectedCalled = true;
    }

    afterDisconnected(){
        this.afterDisconnectedCalled = true;
    }

    afterModelSet(){
        this.afterModelSetCalled = true;
    }
};

class TestPart extends Part {
    constructor(){
        super();
        this.partProperties.newBasicProp(
            'test-property',
            false
        );
    }
};

window.customElements.define('test-view', TestView);

describe('Basic View Lifecycle Methods', () => {
    describe('#afterModelSet', () => {
        after(() => {
            document.body.innerHTML = "";
        });
        it('Not called when first attached', () => {
            let testView = document.createElement('test-view');
            document.body.append(testView);
            assert.isFalse(testView.afterModelSetCalled);
        });
        it('Called after setting the model', () => {
            let dummyModel = new TestPart();
            let testView = document.body.querySelector('test-view');
            testView.setModel(dummyModel);
            assert.isTrue(testView.afterModelSetCalled);
        });
    });

    describe('#afterConnected', () => {
        let testView;
        after(() => {
            document.body.innerHTML = "";
        });
        it('Not called upon element creation', () => {
            testView = document.createElement('test-view');
            assert.isFalse(testView.afterConnectedCalled);
        });
        it('Called after being connected to a parent element', () => {
            document.body.append(testView);
            assert.isTrue(testView.afterConnectedCalled);
        });
        it.skip('Has correctly called PartView connectedCallback inits first', () => {
            // TODO: When we have initializations in #connectedCallback
            // of PartView, make sure we check for them here
            assert(true);
        });
    });

    describe('#afterDisconnected', () => {
        let testView;
        after(() => {
            document.body.innerHTML = "";
        });
        it('Not called when element created', () => {
            testView = document.createElement('test-view');
            assert.isFalse(testView.afterDisconnectedCalled);
        });
        it('Not called when element is attached to parent', () => {
            document.body.append(testView);
            assert.isFalse(testView.afterDisconnectedCalled);
        });
        it('Called after being removed from parent', () => {
            testView.remove();
            assert.isTrue(testView.afterDisconnectedCalled);
        });
    });
});
