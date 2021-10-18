![](images/simpletalk-calligraphy1.svg)
# Overview
This repository hosts a project, currently named "SimpleTalk," begun at the initiation of the UnitedLex computing lab. A general overview of our goals and approach to computing can be found in the [manifesto](ComputingManifesto.pdf). __Simpletalk__ represents a single component of this larger story.

# SimpleTalk
A project inspired by the ideas from [HyperCard](https://en.wikipedia.org/wiki/HyperCard) and [Smalltalk](https://en.wikipedia.org/wiki/Smalltalk). The project is very early stages and represents our desire to think about 'authoring' environments. The goal is not so much to create a working system, although that is one, but to begin thinking about research in personal computing moving forward.

No official release at the moment but you can find an early draft of the documentation [here](https://simpletalk.systems/). The documentation lives in the environment and the environment documents itself - it's a computer after all. (**Note**: this is not a product so we didn't go down the cross-browser support rabbit hole; please use Firefox - otherwise we can't guarantee how things will work or look - and plenty of screen-space will make the experience more enjoyable.) 

## Installation

Create a node environment like so `nodeenv --node=14.5.0 --prebuilt  .nenv` (replace 14.5.0 with whatever current version you want, and .nenv with the directory you prefer), and source `source .nenv/bin/activate`. Then run `npm install`.
  
## Running Examples
  
Serialized collections of Simpletalk Stacks are called "snapshots" and are just plain HTML documents. There are [several examples available in this repository](https://github.com/dkrasner/Simpletalk/tree/master/js/objects/examples). The "bootstrap.html" example is what we normally use to start building new stacks.
  
In order to properly load them you will have to host them rather than opening a local file. Using Python 3, for example, you can run `python -m http.server` at the root of this repository and the files will be available on `localhost:8000`.


## Tests

We use [mocha](https://mochajs.org/) for testing and [chai](https://www.npmjs.com/package/chai) for assertions. To run all tests simply do `npm test` in the root directory.
