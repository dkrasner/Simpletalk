# SimpleTalk
A project inspired by the ideas from [HyperCard](https://en.wikipedia.org/wiki/HyperCard) and [Smalltalk](https://en.wikipedia.org/wiki/Smalltalk). The project is very early stages and represents our desire to think about 'authoring' environments. The goal is not so much to create a working system, although that is one, but to begin thinking about research in personal computing moving forward.

No official release at the moment and documentation to follow.

## Installation

Create a node environment like so `nodeenv --node=14.5.0 --prebuilt  .nenv` (replace 14.5.0 with whatever current version you want, and .nenv with the directory you prefer), and source `source .nenv/bin/activate`. Then run `npm install`.


## Tests

We use [mocha](https://mochajs.org/) for testing and [chai](https://www.npmjs.com/package/chai) for assertions. To run all tests simply do `npm test` in the root directory.
