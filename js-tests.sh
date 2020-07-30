#!/bin/bash

for file in ./js/objects/tests/test-*
do
    ./node_modules/mocha/bin/mocha $file --require esm --require ./js/objects/tests/preload.js
done
