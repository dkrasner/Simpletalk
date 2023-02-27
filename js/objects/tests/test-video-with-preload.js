/**
 * Video Part Model + View Tests
 * -----------------------------------------------
 */
import chai from 'chai';
const assert = chai.assert;

/* JSDOM does not support much of the HTMLMediaElement API */
window.HTMLMediaElement.prototype.load = () => { /* do nothing */ };
window.HTMLMediaElement.prototype.play = () => { /* do nothing */ };
window.HTMLMediaElement.prototype.pause = () => { /* do nothing */ };

describe('Video Part & View Tests', () => {
    describe('System initialialization', () => {
        before('Has loaded set to true', () => {
            assert.isTrue(System.isLoaded);
            let World = document.querySelector('st-world');
            assert.exists(World);
            let currentStack = document.querySelector('st-stack.current-stack');
            assert.exists(currentStack);
            assert.exists(currentStack.model);
            let currentCard = document.querySelector('st-card.current-card');
            assert.exists(currentCard);
            assert.exists(currentCard.model);
        });
        it('Can add video model+view to current card (via message)', () => {
            let currentCard = document.querySelector('st-world st-card.current-card');
            assert.exists(currentCard.model);
            let msg = {
                type: "command",
                commandName: "newModel",
                args: ["video", currentCard.model.id]
            };
            currentCard.sendMessage(msg, currentCard.model);
            let video = currentCard.querySelector('st-video');
            assert.exists(video);
            assert.exists(video.model);
        });
        it('Can tell video to loadFromSource (via message)', () => {
            let video;
            document.querySelectorAll('st-card.current-card > st-video').forEach((el) => {
                if (!el.isLensed) {video = el;}
            });
            const url = "https://download.samplelib.com/mp4/sample-5s.mp4";
            let msg = {
                type: "command",
                commandName: "loadFromSource",
                args: [url]
            };
            video.sendMessage(msg, video.model);
            assert.equal(video.model.partProperties.getPropertyNamed(video.model, "src"), url);
        });
        it('Can tell video to play (via message)', () => {
            let video;
            document.querySelectorAll('st-card.current-card > st-video').forEach((el) => {
                if (!el.isLensed) { video = el; }
            });
            let msg = {
                type: "command",
                commandName: "play",
                args: []
            };
            video.sendMessage(msg, video.model);
            assert.isTrue(video.model.partProperties.getPropertyNamed(video.model, "play"));
            assert.isFalse(video.model.partProperties.getPropertyNamed(video.model, "stop"));
        });
        it('Can tell video to pause (via message)', () => {
            let video;
            document.querySelectorAll('st-card.current-card > st-video').forEach((el) => {
                if (!el.isLensed) { video = el; }
            });
            let msg = {
                type: "command",
                commandName: "pause",
                args: []
            };
            video.sendMessage(msg, video.model);
            assert.isFalse(video.model.partProperties.getPropertyNamed(video.model, "play"));
        });
        it('Can tell video to mute/unmute (via message)', () => {
            let video;
            document.querySelectorAll('st-card.current-card > st-video').forEach((el) => {
                if (!el.isLensed) { video = el; }
            });
            let msg = {
                type: "command",
                commandName: "mute",
                args: []
            };
            video.sendMessage(msg, video.model);
            assert.isTrue(video.model.partProperties.getPropertyNamed(video.model, "muted"));
            msg = {
                type: "command",
                commandName: "unmute",
                args: []
            };
            video.sendMessage(msg, video.model);
            assert.isFalse(video.model.partProperties.getPropertyNamed(video.model, "muted"));
        });
        it('Can tell video to stop i.e. load (via message)', () => {
            let video;
            document.querySelectorAll('st-card.current-card > st-video').forEach((el) => {
                if (!el.isLensed) { video = el; }
            });
            // first start playing
            let msg = {
                type: "command",
                commandName: "play",
                args: []
            };
            video.sendMessage(msg, video.model);
            assert.isTrue(video.model.partProperties.getPropertyNamed(video.model, "play"));
            msg = {
                type: "command",
                commandName: "stop",
                args: []
            };
            video.sendMessage(msg, video.model);
            assert.isTrue(video.model.partProperties.getPropertyNamed(video.model, "stop"));
            assert.isFalse(video.model.partProperties.getPropertyNamed(video.model, "play"));
        });
    });
});
