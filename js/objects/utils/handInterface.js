const video = document.createElement('video');
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

const scaleDim = (dim) => {
    const scale = 0.7;
    const stride = 16;
    const evenRes = dim * scale - 1;
    return evenRes - (evenRes % stride) + 1;
};

const detectHands = async () => {
    if (!handInterface.handDetectionRunning) {
        return;
    }
    const scaledWidth = scaleDim(canvas.width);
    const scaledHeight = scaleDim(canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const image = tf.tidy(() => {
        return tf.fromPixels(canvas).resizeBilinear([scaledHeight, scaledWidth]).expandDims(0);
    });
    const [scores, tboxes] = await handInterface.handDetectionModel.executeAsync(image);
    image.dispose();
    const handsDetected = tf.tidy(() => {
        const indices = tf.image.nonMaxSuppression(
            tboxes.reshape([tboxes.shape[1], tboxes.shape[3]]),
            scores.reshape([scores.shape[1]]),
            20,
            0.5,
            0.85).dataSync();
        var boxes = [];
        var idx;
        for (let i = 0; i < indices.length; i++) {
            idx = indices[i];
            var score = scores.get(0, idx, 0);
            // Original order is [minY, minX, maxY, maxX] so we reorder.
            var box = {
                upperLeft: [tboxes.get(0, idx, 0, 1), tboxes.get(0, idx, 0, 0)],
                lowerRight: [tboxes.get(0, idx, 0, 3), tboxes.get(0, idx, 0, 2)]
            };
            boxes.push({score: score, box: box});
        }
        return {boxes: boxes, timestamp: Date.now()};
    });
    scores.dispose();
    tboxes.dispose();
    if (handsDetected.boxes.length !== 1) {
        if (handInterface.handDetectionRunning) {
            window.requestAnimationFrame(detectHands);
        }
        return;
    }
    const box = handsDetected.boxes[0].box;
    const [x1, y1] = box.upperLeft;
    const [x2, y2] = box.lowerRight;
    const area = {area: (x2 - x1) * (y2 - y1), timestamp: Date.now()};
    handInterface.handDetectionAreas = [].concat(handInterface.handDetectionAreas.slice(-2), [area]);
    // Update hand location
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
    const p = [0.5 * (x1 + x2) * vw, 0.5 * (y1 + y2) * vh];
    handInterface.positions = [].concat(handInterface.positions.slice(-2), [p]);
    var target = handInterface.targetElement;
    if (target === null) {
        target = handInterface.leninHand;
    }
    // Compute average position
    const [p1, p2, p3] = handInterface.positions;
    const [ap1, ap2] = [(1/3)*(p1[0] + p2[0] + p3[0]), (1/3)*(p1[1] + p2[1] + p3[1])];
    target.partProperties.setPropertyNamed(target, "left", ap1);
    target.partProperties.setPropertyNamed(target, "top", ap2);
    // Extract area information without any timestamps
    var justAreas = [];
    for (var i = 0; i < handInterface.handDetectionAreas.length; ++i) {
        justAreas.push(handInterface.handDetectionAreas[i].area);
    }
    var justAreas = [].concat(Array(3 - justAreas.length).fill(0), justAreas);
    // Check if hand is pushing in
    const [a1, a2, a3] = justAreas;
    const aveArea = (1/3) * (a1 + a2 + a3);
    if (aveArea > 0.25) {
        if (!handInterface.handMasked) {
            handInterface.handMasked = true;
            setTimeout(() => { handInterface.handMasked = false; }, 3000);
            if (handInterface.targetElement === null) {
                let closestView = findClosestView([p1, p2]);
                if (closestView !== null) {
                    handInterface.leninHand.partProperties.setPropertyNamed(handInterface.leninHand, "hide", true);
                    handInterface.targetElement = closestView.model;
                }
            } else {
                handInterface.leninHand.partProperties.setPropertyNamed(handInterface.leninHand, "hide", false);
                handInterface.targetElement = null;
            }
        }
    }
    if (handInterface.handDetectionRunning) {
        window.requestAnimationFrame(detectHands);
    }
};

const findClosestView = (point) => {
    let views = [];
    window.System.getCurrentCardModel().subparts.forEach((part) => {
        let partViews = window.System.findViewsById(part.id);
        partViews.forEach((view) => {
            views.push(view);
        })
    });
    var [closestDist, closestView] = [Infinity, null];
    views.forEach((view) => {
        let viewDist = dist(point, getVertices(view));
        if (viewDist < closestDist) {
            closestDist = viewDist;
            closestView = view;
        }
    });
    return closestView;
}

// https://aaronsmith.online/easily-load-an-external-script-using-javascript/
const loadScript = src => {
    return new Promise((resolve, reject) => {
        if (typeof window.tf !== 'undefined') {
            console.log("tensorflowjs already loaded");
            resolve();
            return;
        }
        console.log("loading tensorflowjs");
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.onload = resolve;
        script.onerror = reject;
        script.src = src;
        document.head.append(script);
    });
};

const loadHandDetectionModel = () => {
    handInterface.handDetectionAreas = [];
    loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@0.13.5/dist/tf.js").then(() => {
        window.tf.loadFrozenModel(
            "https://cdn.jsdelivr.net/npm/handtrackjs/models/web/ssdlitemobilenetv2/tensorflowjs_model.pb",
            "https://cdn.jsdelivr.net/npm/handtrackjs/models/web/ssdlitemobilenetv2/weights_manifest.json"
        ).then(model => {
            console.log("hand detection model loaded");
            handInterface.handDetectionModel = model;
        }).then(() => {
            return navigator.mediaDevices.getUserMedia({ video: true });
        }).then(stream => {
            video.srcObject = stream;
            return video.play();
        }).then(() => {
            console.log("video started");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.setTransform(-1, 0, 0, 1, canvas.width, 0); // Mirror incoming video
            handInterface.handDetectionRunning = true;
            handInterface.leninHand = window.System.newModel('image', window.System.getCurrentStackModel().id, "/images/leninHand.png");
            handInterface.targetElement = null;
            window.requestAnimationFrame(detectHands);
        }).catch(err => {
            console.log("error loading hand detection model");
            console.log(err);
        });
    });
}

const unloadHandDetectionModel = () => {
    handInterface.handDetectionRunning = false;
    window.System.deleteModel(handInterface.leninHand.id)
    handInterface.leninHand = null;
    video.pause();
    const tracks = video.srcObject.getTracks();
    for (var i = 0; i < tracks.length; i++) {
        tracks[i].stop();
    }
    video.srcObject = null;
    console.log("video stopped");
    handInterface.handDetectionModel = null;
    console.log("unloading hand detection model");
}

const getVertices = (element) => {
    const rect = element.getBoundingClientRect();
    const upperLeft = [rect.x, rect.y];
    const upperRight = [rect.x + rect.width, rect.y];
    const lowerLeft = [rect.x, rect.y + rect.height];
    const lowerRight = [rect.x + rect.width, rect.y + rect.height];
    return {
        upperLeft: upperLeft,
        upperRight: upperRight,
        lowerLeft: lowerLeft,
        lowerRight: lowerRight
    };
}

const dist = (point, vertices) => {
    const [p1, p2] = point;
    const [ul1, ul2] = vertices.upperLeft;
    const [ll1, ll2] = vertices.lowerLeft;
    const [ur1, ur2] = vertices.upperRight;
    const [lr1, lr2] = vertices.lowerRight;
    // First check if the point is inside the rectangle
    // Next we compute the vector pointing from the point to the closest point
    // on the rectangle. There are 9 cases. The first is when the poinst is
    // inside the rectangle. The next four cases are if the point in one of
    // the four corners and the final four cases are when the point is on one
    // of the four sides.
    var [v1, v2] = [null, null];
    if ((ul1 <= p1) && (p1 <= lr1) && (ul2 <= p2) && (p2 <= lr2)) {
        // Case 0: inside the rectangle
        [v1, v2] = [0, 0];
    } else if ((p1 <= ul1) && (p2 <= ul2)) {
        // Case 1: upper left
        [v1, v2] = [ul1 - p1, ul2 - p2];
    } else if ((p1 >= ur1) && (p2 <= ur2)) {
        // Case 2: upper right
        [v1, v2] = [ur1 - p1, ur2 - p2];
    } else if ((p1 <= ll1) && (p2 >= ll2)) {
        // Case 3: lower left
        [v1, v2] = [ll1 - p1, ll2 - p2];
    } else if ((p1 >= lr1) && (p2 >= lr2)) {
        // Case 4: lower right
        [v1, v2] = [lr1 - p1, lr2 - p2];
    } else if (p1 <= ul1) {
        // Case 5: side left
        [v1, v2] = [ul1 - p1, 0];
    } else if (p1 >= lr1) {
        // Case 6: side right
        [v1, v2] = [lr1 - p1, 0];
    } else if (p2 <= ul2) {
        // Case 7: side top
        [v1, v2] = [0, ul2 - p2];
    } else if (p2 >= lr2) {
        // Case 8: side bottom
        [v1, v2] = [0, lr2 - p2];
    } else {
        // Case 9: inside
        [v1, v2] = [0, 0];
    }
    return Math.sqrt(v1*v1 + v2*v2);
}

class HandInterface {
    constructor() {
        this.handDetectionModel = null;
        this.handDetectionRunning = false;
        this.leninHand = null;
        this.handMasked = false;
        this.targetElement = null;
        this.handDetectionAreas = [];
        this.positions = [[0, 0], [0, 0], [0, 0]];
        // XXX - Only here to ignore the tensorflow warnings
        console.warn = () => {};
    }

    start() {
        loadHandDetectionModel();
    }

    stop() {
        unloadHandDetectionModel();
    }
}

const Testables = {
    dist: dist
}

const handInterface = new HandInterface();

export {
    Testables,
    handInterface,
    handInterface as default
};
