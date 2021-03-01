import chai from 'chai';

import {
    Testables
} from '../utils/handInterface.js';

describe("Hand Interface Tests", () => {
    const vertices = {
        upperLeft: [1, 1],
        lowerLeft: [1, 2],
        upperRight: [2, 1],
        lowerRight: [2, 2]
    };

    it("Distance Function: Upper Left", () => {
        const point = [0, 0];
        chai.assert.equal(Testables.dist(point, vertices), Math.sqrt(1*1 + 1*1));
    });
    it("Distance Function: Upper Right", () => {
        const point = [4, 0];
        chai.assert.equal(Testables.dist(point, vertices), Math.sqrt(2*2 + 1*1));
    });
    it("Distance Function: Lower Left", () => {
        const point = [0, 5];
        chai.assert.equal(Testables.dist(point, vertices), Math.sqrt(1*1 + 3*3));
    });
    it("Distance Function: Lower Right", () => {
        const point = [5, 5];
        chai.assert.equal(Testables.dist(point, vertices), Math.sqrt(3*3 + 3*3));
    });

    it("Distance Function: Left Side", () => {
        const point = [0, 1];
        chai.assert.equal(Testables.dist(point, vertices), 1-0);
    });
    it("Distance Function: Right Side", () => {
        const point = [5, 1];
        chai.assert.equal(Testables.dist(point, vertices), 5-2);
    });
    it("Distance Function: Top Side", () => {
        const point = [2, 0];
        chai.assert.equal(Testables.dist(point, vertices), 2-1);
    });
    it("Distance Function: Bottom Side", () => {
        const point = [2, 4];
        chai.assert.equal(Testables.dist(point, vertices), 4-2);
    });

    it("Distance Function: Upper Left Vertex", () => {
        chai.assert.equal(Testables.dist(vertices.upperLeft, vertices), 0);
    });
    it("Distance Function: Upper Right Vertex", () => {
        chai.assert.equal(Testables.dist(vertices.upperRight, vertices), 0);
    });
    it("Distance Function: Lower Left Vertex", () => {
        chai.assert.equal(Testables.dist(vertices.lowerLeft, vertices), 0);
    });
    it("Distance Function: Lower Right Vertex", () => {
        chai.assert.equal(Testables.dist(vertices.lowerRight, vertices), 0);
    });

    it("Distance Function: On Left Side", () => {
        const point = [1, 1.5];
        chai.assert.equal(Testables.dist(point, vertices), 0);
    });
    it("Distance Function: On Right Side", () => {
        const point = [2, 1.5];
        chai.assert.equal(Testables.dist(point, vertices), 0);
    });
    it("Distance Function: On Top Side", () => {
        const point = [1.5, 1];
        chai.assert.equal(Testables.dist(point, vertices), 0);
    });
    it("Distance Function: On Bottom Side", () => {
        const point = [1.5, 2];
        chai.assert.equal(Testables.dist(point, vertices), 0);
    });

    it("Distance Function: Inside", () => {
        const point = [1.5, 1.5];
        chai.assert.equal(Testables.dist(point, vertices), 0);
    });

    it("Distance Function: Scaled", () => {
        const point = [0, 0];
        const scaledVertices = {
            upperLeft: [10, 10],
            lowerLeft: [10, 20],
            upperRight: [20, 10],
            lowerRight: [20, 20]
        };
        chai.assert.equal(Testables.dist(point, scaledVertices), Math.sqrt(10*10 + 10*10));
    });
});
