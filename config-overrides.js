const path = require('path');

module.exports = function override(config) {
  config.resolve.fallback = {
    fs: false, // disables fs
    path: require.resolve('path-browserify'), // uses browser-compatible path
  };
  return config;
};
