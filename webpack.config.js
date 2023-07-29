const path = require('path');

module.exports = {
    devtool: 'inline-source-map',
    mode: 'development',
    entry: {
        devSystem: './js/objects/System.js',
    },
    watch: false,
    output: {
        path: path.resolve(__dirname, 'js', 'objects', 'build'),
        filename: '[name].bundle.js'
    },
};
