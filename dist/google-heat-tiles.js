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

      if (this.heatTiles.isDebug()) {
        div.innerHTML = coord;
      }

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

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _CoordMapType = require('./coord.js');

var _CoordMapType2 = _interopRequireWildcard(_CoordMapType);

var _projection = require('mercator-projection');

var _projection2 = _interopRequireWildcard(_projection);

var HeatTiles = (function () {
  function HeatTiles(map, options, google) {
    _classCallCheck(this, HeatTiles);

    var defaults = {};
    var i = undefined;
    this.map = map;
    this.google = google || window.google;
    this._data = [];
    this._tileData = {};
    this._visible = false;

    defaults = {
      tileSize: 256,
      opacity: 0.3,
      debug: false
    };

    this.options = defaults;
    for (i in options) {
      this.options[i] = options[i];
    }

    this.initialize();
  }

  _createClass(HeatTiles, [{
    key: 'initialize',
    value: function initialize() {
      var _this = this;

      this._size = new this.google.maps.Size(this.options.tileSize, this.options.tileSize);

      this.google.maps.event.addListener(this.map, 'zoom_changed', function (f) {
        _this._processData();
        if (_this.isVisible()) {
          _this.update();
        }
      });
    }
  }, {
    key: 'show',
    value: function show() {
      this.map.overlayMapTypes.insertAt(0, new _CoordMapType2['default'](this._size, this));
      this._visible = true;
      return this;
    }
  }, {
    key: 'hide',
    value: function hide() {
      this.map.overlayMapTypes.removeAt(0);
      this._visible = false;
      return this;
    }
  }, {
    key: 'update',
    value: function update() {
      this.map.overlayMapTypes.setAt(0, new _CoordMapType2['default'](this._size, this));
      return this;
    }
  }, {
    key: 'isVisible',
    value: function isVisible() {
      return this._visible;
    }
  }, {
    key: 'isDebug',
    value: function isDebug() {
      return this.options.debug;
    }
  }, {
    key: 'setData',
    value: function setData(data) {
      this._data = data;
      this._processData();
      return this;
    }
  }, {
    key: 'setOpacity',
    value: function setOpacity(opacity) {
      this.options.opacity = opacity;
    }
  }, {
    key: 'getTileData',
    value: function getTileData() {
      return this._tileData;
    }
  }, {
    key: 'getOpacity',
    value: function getOpacity() {
      return this.options.opacity;
    }
  }, {
    key: '_processData',

    /**
     * Generates a tileData object with the amount of points in each tile.
     *
     * @param {array} data - Array of LatLng Points
     */
    value: function _processData(data) {
      var coords = '';
      var tile = {};
      var tileArray = [];
      var index = 0;
      var i = undefined;

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
    }
  }, {
    key: '_setHeat',

    /**
     * Sets the green balance property for each tileData object
     */
    value: function _setHeat() {
      var difference = this._maxPoints - this._minPoints || 1;
      var greenBalance = 0;
      var percent = 0;
      var i = undefined;

      for (i in this._tileData) {
        percent = (this._tileData[i].q - this._minPoints) * 100 / difference;
        greenBalance = Math.round(255 - percent * 2.55);
        this._tileData[i].green = greenBalance;
      }
    }
  }, {
    key: '_fromPointToTileCoord',

    /**
     * Converts a LatLng object to a tile coordinate object
     *
     * @param {object} point - LatLng or LatLngLiteral object to convert
     * @return {object} - Point object with the tile coord
     */
    value: function _fromPointToTileCoord(point) {
      var latlng = typeof point.lat === 'function' ? { lat: point.lat(), lng: point.lng() } : point;
      var numTiles = 1 << this.map.getZoom();
      var worldCoordinate = _projection2['default'].fromLatLngToPoint(latlng);

      var pixelCoordinate = new this.google.maps.Point(worldCoordinate.x * numTiles, worldCoordinate.y * numTiles);
      var tileCoordinate = new this.google.maps.Point(Math.floor(pixelCoordinate.x / this.options.tileSize), Math.floor(pixelCoordinate.y / this.options.tileSize));

      return tileCoordinate;
    }
  }]);

  return HeatTiles;
})();

exports['default'] = HeatTiles;
module.exports = exports['default'];

},{"./coord.js":3,"mercator-projection":2}]},{},[1]);
