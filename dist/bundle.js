(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var HeatTiles = require('./src/index');

// Globally expose HeatTiles in the browser
if (typeof window !== 'undefined') {
  window.HeatTiles = HeatTiles;
}

// AMD Support
if (typeof define === 'function' && define.amd) {
  define([], function () {
    return HeatTiles;
  });
}

// CommonJS Support
module.exports = HeatTiles;

},{"./src/index":4}],2:[function(require,module,exports){
exports.fromLatLngToPoint = fromLatLngToPoint;
exports.fromPointToLatLng = fromPointToLatLng;

var TILE_SIZE = 256;
var pixelOrigin_ = {x: TILE_SIZE / 2, y: TILE_SIZE / 2};
var pixelsPerLonDegree_ = TILE_SIZE / 360;
var pixelsPerLonRadian_ = TILE_SIZE / (2 * Math.PI);
	
function _bound(value, opt_min, opt_max) {
	if (opt_min != null) value = Math.max(value, opt_min);
	if (opt_max != null) value = Math.min(value, opt_max);
	return value;
}

function _degreesToRadians(deg) {
	return deg * (Math.PI / 180);
}

function _radiansToDegrees(rad) {
	return rad / (Math.PI / 180);
}

function fromLatLngToPoint(latLng, opt_point) {
	var point = {x: null, y: null};
	var origin = pixelOrigin_;
	
	point.x = origin.x + latLng.lng * pixelsPerLonDegree_;
	
	// Truncating to 0.9999 effectively limits latitude to 89.189. This is
	// about a third of a tile past the edge of the world tile.
	var siny = _bound(Math.sin(_degreesToRadians(latLng.lat)), -0.9999, 0.9999);
	point.y = origin.y + 0.5 * Math.log((1 + siny) / (1 - siny)) * -pixelsPerLonRadian_;
	
	return point;
};

function fromPointToLatLng(point) {
	var origin = pixelOrigin_;
	var lng = (point.x - origin.x) / pixelsPerLonDegree_;
	var latRadians = (point.y - origin.y) / -pixelsPerLonRadian_;
	var lat = _radiansToDegrees(2 * Math.atan(Math.exp(latRadians)) - Math.PI / 2);
	
	return {lat: lat, lng: lng};
};
},{}],3:[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
  value: true
});

var CoordMapType = (function () {
  function CoordMapType(tileSize, heatTiles) {
    _classCallCheck(this, CoordMapType);

    this.tileSize = tileSize;
    this.heatTiles = heatTiles;
  }

  _createClass(CoordMapType, [{
    key: 'getTile',
    value: function getTile(coord, zoom, ownerDocument) {
      var div = ownerDocument.createElement('div');
      var coordKey = coord.x + '_' + coord.y;
      var tileData = this.heatTiles.getTileData();
      var opacity = this.heatTiles.getOpacity();

      div.innerHTML = coord;
      div.style.width = this.tileSize.width + 'px';
      div.style.height = this.tileSize.height + 'px';
      div.style.fontSize = '10';
      div.style.borderStyle = 'dashed';
      div.style.borderWidth = '1px';
      div.style.borderColor = '#AAAAAA';

      if (tileData[coordKey]) {
        div.style.background = 'rgba(255, ' + tileData[coordKey].green + ', 0, ' + opacity + ')';
      }

      return div;
    }
  }]);

  return CoordMapType;
})();

exports['default'] = CoordMapType;
module.exports = exports['default'];

},{}],4:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _CoordMapType = require('./coord.js');

var _CoordMapType2 = _interopRequireWildcard(_CoordMapType);

var _projection = require('mercator-projection');

var _projection2 = _interopRequireWildcard(_projection);

var HeatTiles = function HeatTiles(map, options) {
  var defaults = {};
  var i;
  this.map = map;
  this._data = [];
  this._tileData = {};

  defaults = {
    tileSize: 256,
    opacity: 0.3
  };

  this.options = defaults;
  for (i in options) {
    this.options[i] = options[i];
  }

  this.initialize();
};

HeatTiles.prototype.initialize = function () {
  var that = this;
  this._size = new google.maps.Size(this.options.tileSize, this.options.tileSize);

  google.maps.event.addListener(this.map, 'zoom_changed', function () {
    //if(that.showHeatMap()) {
    that._processData();
    that.update();
    //}
  });
};

HeatTiles.prototype.show = function () {
  this.map.overlayMapTypes.insertAt(0, new _CoordMapType2['default'](this._size, this));
  return this;
};

HeatTiles.prototype.hide = function () {
  this.map.overlayMapTypes.removeAt(0);
  return this;
};

HeatTiles.prototype.update = function () {
  this.map.overlayMapTypes.setAt(0, new _CoordMapType2['default'](this._size, this));
  return this;
};

HeatTiles.prototype.setData = function (data) {
  this._data = data;
  this._processData();
  return this;
};

HeatTiles.prototype.setOpacity = function (opacity) {
  this.options.opacity = opacity;
};

HeatTiles.prototype.getTileData = function () {
  return this._tileData;
};

HeatTiles.prototype.getOpacity = function () {
  return this.options.opacity;
};

/**
 * Generates a tileData object with the amount of points in each tile.
 *
 * @param {array} data - Array of LatLng Points
 */
HeatTiles.prototype._processData = function (data) {
  var coords = '';
  var tile = {};
  var tileArray = [];
  var index = 0;
  var i;

  if (typeof data !== 'undefined') {
    this._data = data;
  }

  this._tileData = {};

  for (i in this._data) {
    tile = this._fromPointToTileCoord(this._data[i]);
    coords = tile.x + '_' + tile.y;
    if (!this._tileData.hasOwnProperty(coords)) {
      this._tileData[coords] = { q: 0, index: index };
      index += 1;
    }
    this._tileData[coords].q += 1;
    tileArray[this._tileData[coords].index] = this._tileData[coords].q;
  }

  this._maxPoints = Math.max.apply(null, tileArray);
  this._minPoints = Math.min.apply(null, tileArray);

  this._setHeat();
};

HeatTiles.prototype._setHeat = function () {
  var difference = this._maxPoints - this._minPoints || 1;
  var greenBalance = 0;
  var percent = 0;
  var i;

  for (i in this._tileData) {
    percent = (this._tileData[i].q - this._minPoints) * 100 / difference;
    greenBalance = Math.round(255 - percent * 2.55);
    this._tileData[i].green = greenBalance;
  }
};

HeatTiles.prototype._fromPointToTileCoord = function (point) {
  var latlng = typeof point.lat === 'function' ? { lat: point.lat(), lng: point.lng() } : point;
  console.log(latlng);
  var numTiles = 1 << this.map.getZoom();
  var worldCoordinate = _projection2['default'].fromLatLngToPoint(latlng);

  var pixelCoordinate = new google.maps.Point(worldCoordinate.x * numTiles, worldCoordinate.y * numTiles);
  var tileCoordinate = new google.maps.Point(Math.floor(pixelCoordinate.x / this.options.tileSize), Math.floor(pixelCoordinate.y / this.options.tileSize));

  return tileCoordinate;
};

module.exports = HeatTiles;

},{"./coord.js":3,"mercator-projection":2}]},{},[1]);
