#!/bin/bash

for file in ./js/objects/tests/test-*
do
    if [[ $file == *"-preload.js" ]];
       then
           ./node_modules/mocha/bin/mocha $file --require esm --require ./js/objects/tests/preload.js
    else
        ./node_modules/mocha/bin/mocha $file --require esm
    fi
done
