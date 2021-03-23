/**
 * ID Utility tests  Tests
 * ---------------------------
 */
import chai from 'chai';
const assert = chai.assert;
import {
    idMaker,
    isValidId
} from '../utils/id.js';


describe('Id Utilities tests', () => {
    describe('Id Maker tests', () => {
        before(() => {
        });

        it('First Id is proper', () => {
            let newId = idMaker.new();
            assert.equal(0, newId);
        });
        it('Next is proper', () => {
            let newId = idMaker.new();
            assert.equal(1, newId);
        });
    });
    describe('Id Checker tests', () => {
        before(() => {
        });

        it('Id Maker Checks Out', () => {
            let newId = idMaker.new();
            let id = isValidId(newId);
            assert.equal(2, id);
        });
        it('Any natural number is an Id', () => {
            let id = isValidId(123);
            assert.equal(123, id);
        });
        it('Any string "[natural number]" is an Id', () => {
            let id = isValidId("123");
            assert.equal(123, id);
        });
        it('Negative integers are not Ids', () => {
            let id = isValidId(-123);
            assert.isFalse(id);
            id = isValidId("-123");
            assert.isFalse(id);
        });
        it('Non integer strings are not Ids', () => {
            let id = isValidId("123abc");
            assert.isFalse(id);
        });
        it('Null, undefined and empty string are not Ids', () => {
            let id = isValidId(null);
            assert.isFalse(id);
            id = isValidId(undefined);
            assert.isFalse(id);
            id = isValidId("");
            assert.isFalse(id);
        });
    });

});
