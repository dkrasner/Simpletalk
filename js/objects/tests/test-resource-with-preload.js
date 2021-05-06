/**
 * Resource Part and Related Tests
 * --------------------------------------
 * These are integration tests that ensure
 * proper functioning of the Resource part, view,
 * and its various methods, functions and dependencies.
 */
import chai from 'chai';
const assert = chai.assert;
const expect = chai.expect;

const response = {
    id: 1,
    name: "the name"
};

const test = {
    name: "TestAPI",
    load: function(url){
        this.src = url;
        return true;
    },
    response: null,
    src: null,
    get: async function(key){
        if(key){
            if(!this.response){
                throw Error("No result has been fetched");
            }
            return this.response[key];
        }
        this.response = response;
        return JSON.stringify(response);
    },
};

describe('Resource', () => {
    let currentCardModel = System.getCurrentCardModel();
    let resource;
    before('', () => {
        System.availableResources["testAPI"] = test;
    });
    it('Can add resource (with name).', () => {
        let msg = {
            type: "command",
            commandName: "newModel",
            args: ["resource", currentCardModel.id, "testResource"]
        };
        currentCardModel.sendMessage(msg, currentCardModel);
        assert.equal(1, currentCardModel.subparts.length);
        resource = currentCardModel.subparts[0];
        assert.equal(resource.type, "resource");
    });
    it('Can load resource', () => {
        let msg = {
            type: "command",
            commandName: "loadResource",
            args: ["testAPI"]
        };
        resource.sendMessage(msg, resource);
        let resourceProp = resource.partProperties.getPropertyNamed(resource, "resourceName");
        assert.equal(resourceProp, "testAPI");
    });
    it('Can load resource source (url)', () => {
        let msg = {
            type: "command",
            commandName: "setSourceTo",
            args: ["someurl.com"]
        };
        resource.sendMessage(msg, resource);
        let sourceProp = resource.partProperties.getPropertyNamed(resource, "src");
        assert.equal(sourceProp, "someurl.com");
        assert.equal(test.src, "someurl.com");
    });
    it('Can get from resource', (done) => {
        // NOTE: the use of "done" since .get is async
        // see more here: https://mochajs.org/#asynchronous-code
        let msg = {
            type: "command",
            commandName: "get",
            args: []
        };
        let msgFunc = () => {
            resource.sendMessage(msg, resource);
            done();
        };
        expect(msgFunc).to.not.throw();
        assert.equal(response, test.response);
        let responseProp = resource.partProperties.getPropertyNamed(resource, "response");
        assert.equal(responseProp, JSON.stringify(response));
    });
    it('Can get with argument from resource', (done) => {
        // NOTE: the use of "done" since .get is async
        // see more here: https://mochajs.org/#asynchronous-code
        let msg = {
            type: "command",
            commandName: "get",
            args: ["name"]
        };
        let msgFunc = () => {
            resource.sendMessage(msg, resource);
            done();
        };
        expect(msgFunc).to.not.throw();
        let responseProp = resource.partProperties.getPropertyNamed(resource, "response");
        assert.equal(response["name"], responseProp);
    });
});
