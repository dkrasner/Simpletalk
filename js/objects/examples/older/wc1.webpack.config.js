const path = require('path');

module.exports = {
    mode: 'development',
  entry: './wc1-entry.js',
  output: {
    filename: 'wc1-bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
