var HeatTiles = require('./src/index');

// Globally expose HeatTiles in the browser
if(typeof window !== 'undefined') {
  window.HeatTiles = HeatTiles;
}

// AMD Support
if(typeof define === 'function' && define.amd) {
  define([], function() {
    return HeatTiles;
  });
}

// CommonJS Support
module.exports = HeatTiles;
