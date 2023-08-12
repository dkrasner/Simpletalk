![](images/ww_logo.svg)
# Overview
Behond _WYSIWYG_ the next-gen system to create and share just about anything and everything in the browser! Here you can seamlessly translate your design and functional intent into running applications. 

Ideas behind _WYWISYG_ and v0 of the underlying language, interpreter and environment were developed as part of an R&D project. You can read more about it [here](https://github.com/dkrasner/Simpletalk).

[More documentation is coming soon, but if you eager to contribute simply open an issue, PR and go from there.]

## Installation and Building

Create a node environment like so `nodeenv --node=14.5.0 --prebuilt  .nenv` (replace 14.5.0 with whatever current version you want, and .nenv with the directory you prefer), and source `source .nenv/bin/activate`. Then run `npm install`.

To build run `npm run build-dev` which will create a webpack bundle used by the examples.

## Running Examples
  
Boot up a web server, for example python one  (`python -m http.server`) and head to `localhost:8000` for some freewheelin'.

## Tests

We use [mocha](https://mochajs.org/) for testing and [chai](https://www.npmjs.com/package/chai) for assertions. To run all tests simply do `npm test` in the root directory.
