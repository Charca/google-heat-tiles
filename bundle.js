(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var HeatTiles = require('./src/index');

if(typeof window !== 'undefined') {
  window.HeatTiles = HeatTiles;
}

if(typeof define === 'function' && define.amd) {
  define([], function() {
    return HeatTiles;
  })
}

module.exports = HeatTiles;

},{"./src/index":3}],2:[function(require,module,exports){
function CoordMapType(tileSize, heatTiles) {
  this.tileSize = tileSize;
  this.heatTiles = heatTiles;
}

CoordMapType.prototype.getTile = function(coord, zoom, ownerDocument) {
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

  if(tileData[coordKey]) {
    div.style.background = 'rgba(255, ' + tileData[coordKey].green + ', 0, ' + opacity + ')';
  }

  return div;
};

module.exports = CoordMapType;

},{}],3:[function(require,module,exports){
var CoordMapType = require('./coord.js');
var MercatorProjection = require('./mercator.js');

var HeatTiles = function(map, options) {
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
  for(i in options) {
    this.options[i] = options[i];
  }

  this.initialize();
};

HeatTiles.prototype.initialize = function() {
  var that = this;
  this._size = new google.maps.Size(this.options.tileSize, this.options.tileSize);

  google.maps.event.addListener(this.map, 'zoom_changed', function() {
    //if(that.showHeatMap()) {
      that._processData();
      that.update();
    //}
  });
};

HeatTiles.prototype.show = function() {
  this.map.overlayMapTypes.insertAt(0, new CoordMapType(this._size, this));
  return this;
};

HeatTiles.prototype.hide = function() {
  this.map.overlayMapTypes.removeAt(0);
  return this;
};

HeatTiles.prototype.update = function() {
  this.map.overlayMapTypes.setAt(0, new CoordMapType(this._size, this));
  return this;
};

HeatTiles.prototype.setData = function(data) {
  this._data = data;
  this._processData();
  return this;
};

HeatTiles.prototype.setOpacity = function(opacity) {
  this.options.opacity = opacity;
};

HeatTiles.prototype.getTileData = function() {
  return this._tileData;
};

HeatTiles.prototype.getOpacity = function() {
  return this.options.opacity;
};

/**
 * Generates a tileData object with the amount of points in each tile.
 *
 * @param {array} data - Array of LatLng Points
 */
HeatTiles.prototype._processData = function(data) {
  var coords = '';
  var tile = {};
  var tileArray = [];
  var index = 0;
  var i;

  if(typeof data !== 'undefined') {
    this._data = data;
  }

  this._tileData = {};

  for(i in this._data) {
    tile = this._fromPointToTileCoord(this._data[i]);
    coords = tile.x + '_' + tile.y;
    if(!this._tileData.hasOwnProperty(coords)) {
      this._tileData[coords] = {q: 0, index: index};
      index += 1;
    }
    this._tileData[coords].q += 1;
    tileArray[this._tileData[coords].index] = this._tileData[coords].q;
  }

  this._maxPoints = Math.max.apply(null, tileArray);
  this._minPoints = Math.min.apply(null, tileArray);

  this._setHeat();
};

HeatTiles.prototype._setHeat = function() {
  var difference = this._maxPoints - this._minPoints || 1;
  var greenBalance = 0;
  var percent = 0;
  var i;

  for(i in this._tileData) {
    percent = (this._tileData[i].q - this._minPoints) * 100 / difference;
    greenBalance = Math.round(255 - (percent * 2.55));
    this._tileData[i].green = greenBalance;
  }
};

HeatTiles.prototype._fromPointToTileCoord = function(point) {
  var numTiles = 1 << this.map.getZoom();
  var projection = new MercatorProjection(this.options.tileSize);
  var worldCoordinate = projection.fromLatLngToPoint(point);
  var pixelCoordinate = new google.maps.Point(
      worldCoordinate.x * numTiles,
      worldCoordinate.y * numTiles);
  var tileCoordinate = new google.maps.Point(
      Math.floor(pixelCoordinate.x / this.options.tileSize),
      Math.floor(pixelCoordinate.y / this.options.tileSize));

  return tileCoordinate;
};

module.exports = HeatTiles;

},{"./coord.js":2,"./mercator.js":4}],4:[function(require,module,exports){
function bound(value, opt_min, opt_max) {
  if (opt_min != null) value = Math.max(value, opt_min);
  if (opt_max != null) value = Math.min(value, opt_max);
  return value;
}

function degreesToRadians(deg) {
  return deg * (Math.PI / 180);
}

function radiansToDegrees(rad) {
  return rad / (Math.PI / 180);
}

/** @constructor */
function MercatorProjection(tileSize) {
  this.pixelOrigin_ = new google.maps.Point(tileSize / 2,
    tileSize / 2);
  this.pixelsPerLonDegree_ = tileSize / 360;
  this.pixelsPerLonRadian_ = tileSize / (2 * Math.PI);
}

MercatorProjection.prototype.fromLatLngToPoint = function(latLng,
    opt_point) {
  var me = this;
  var point = opt_point || new google.maps.Point(0, 0);
  var origin = me.pixelOrigin_;

  point.x = origin.x + latLng.lng() * me.pixelsPerLonDegree_;

  // Truncating to 0.9999 effectively limits latitude to 89.189. This is
  // about a third of a tile past the edge of the world tile.
  var siny = bound(Math.sin(degreesToRadians(latLng.lat())), -0.9999,
      0.9999);
  point.y = origin.y + 0.5 * Math.log((1 + siny) / (1 - siny)) *
      -me.pixelsPerLonRadian_;
  return point;
};

MercatorProjection.prototype.fromPointToLatLng = function(point) {
  var me = this;
  var origin = me.pixelOrigin_;
  var lng = (point.x - origin.x) / me.pixelsPerLonDegree_;
  var latRadians = (point.y - origin.y) / -me.pixelsPerLonRadian_;
  var lat = radiansToDegrees(2 * Math.atan(Math.exp(latRadians)) -
      Math.PI / 2);
  return new google.maps.LatLng(lat, lng);
};

module.exports = MercatorProjection;

},{}]},{},[1]);
