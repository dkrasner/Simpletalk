/**
 * Audio Part Model + View Tests
 * -----------------------------------------------
 */
import chai from 'chai';
const assert = chai.assert;

/* JSDOM does not support much of the HTMLMediaElement API */
window.HTMLMediaElement.prototype.load = () => { /* do nothing */ };
window.HTMLMediaElement.prototype.play = () => { /* do nothing */ };
window.HTMLMediaElement.prototype.pause = () => { /* do nothing */ };

describe('Audio Part & View Tests', () => {
    describe('System initialialization', () => {
        before('Has loaded set to true', () => {
            assert.isTrue(System.isLoaded);
            let World = document.querySelector('st-world');
            assert.exists(World);
            let currentStack = document.querySelector('.current-stack');
            assert.exists(currentStack);
            assert.exists(currentStack.model);
            let currentCard = document.querySelector('st-card.current-card');
            assert.exists(currentCard);
            assert.exists(currentCard.model);
        });
        it('Can add audio model+view to current card (via message)', () => {
            let currentCard = document.querySelector('st-world st-card.current-card');
            assert.exists(currentCard.model);
            let msg = {
                type: "command",
                commandName: "newModel",
                args: ["audio", currentCard.model.id]
            };
            currentCard.sendMessage(msg, currentCard.model);
            let audio = currentCard.querySelector('st-audio');
            assert.exists(audio);
            assert.exists(audio.model);
        });
        it('Can tell audio to loadFromSource (via message)', () => {
            let audio = document.querySelector('st-card.current-card > st-audio');
            let url = "https://ia801506.us.archive.org/31/items/lp_harlem-new-world-acoming-the-golden-broo_duke-ellington-cincinnati-symphony-orchest/disc1/01.01.%20New%20World%20A%27Coming.mp3";
            let msg = {
                type: "command",
                commandName: "loadAudioFromSource",
                args: [url]
            };
            audio.sendMessage(msg, audio.model);
            assert.equal(audio.model.partProperties.getPropertyNamed(audio.model, "src"), url);
        });
        it('Can tell audio to play (via message)', () => {
            let audio = document.querySelector('st-card.current-card > st-audio');
            let msg = {
                type: "command",
                commandName: "play",
                args: []
            };
            audio.sendMessage(msg, audio.model);
            assert.isTrue(audio.model.partProperties.getPropertyNamed(audio.model, "play"));
            assert.isFalse(audio.model.partProperties.getPropertyNamed(audio.model, "stop"));
        });
        it('Can tell audio to pause (via message)', () => {
            let audio = document.querySelector('st-card.current-card > st-audio');
            let msg = {
                type: "command",
                commandName: "pause",
                args: []
            };
            audio.sendMessage(msg, audio.model);
            assert.isFalse(audio.model.partProperties.getPropertyNamed(audio.model, "play"));
        });
        it('Can tell audio to stop i.e. load (via message)', () => {
            let audio = document.querySelector('st-card.current-card > st-audio');
            // first start playing
            let msg = {
                type: "command",
                commandName: "play",
                args: []
            };
            audio.sendMessage(msg, audio.model);
            assert.isTrue(audio.model.partProperties.getPropertyNamed(audio.model, "play"));
            msg = {
                type: "command",
                commandName: "stop",
                args: []
            };
            audio.sendMessage(msg, audio.model);
            assert.isTrue(audio.model.partProperties.getPropertyNamed(audio.model, "stop"));
            assert.isFalse(audio.model.partProperties.getPropertyNamed(audio.model, "play"));
        });
    });
});
