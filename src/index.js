import CoordMapType from './coord.js';
import projection from 'mercator-projection';

class HeatTiles {
  constructor(map, options) {
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
  }

  initialize() {
    var that = this;
    this._size = new google.maps.Size(this.options.tileSize, this.options.tileSize);

    google.maps.event.addListener(this.map, 'zoom_changed', function() {
      //if(that.showHeatMap()) {
        that._processData();
        that.update();
      //}
    });
  }

  show() {
    this.map.overlayMapTypes.insertAt(0, new CoordMapType(this._size, this));
    return this;
  }

  hide() {
    this.map.overlayMapTypes.removeAt(0);
    return this;
  }

  update() {
    this.map.overlayMapTypes.setAt(0, new CoordMapType(this._size, this));
    return this;
  }

  setData(data) {
    this._data = data;
    this._processData();
    return this;
  }

  setOpacity(opacity) {
    this.options.opacity = opacity;
  }

  getTileData() {
    return this._tileData;
  }

  getOpacity() {
    return this.options.opacity;
  }

  /**
   * Generates a tileData object with the amount of points in each tile.
   *
   * @param {array} data - Array of LatLng Points
   */
  _processData(data) {
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
  }

  _setHeat() {
    var difference = this._maxPoints - this._minPoints || 1;
    var greenBalance = 0;
    var percent = 0;
    var i;

    for(i in this._tileData) {
      percent = (this._tileData[i].q - this._minPoints) * 100 / difference;
      greenBalance = Math.round(255 - (percent * 2.55));
      this._tileData[i].green = greenBalance;
    }
  }

  _fromPointToTileCoord(point) {
    var latlng = (typeof point.lat === 'function') ? {lat: point.lat(), lng: point.lng()} : point;
    var numTiles = 1 << this.map.getZoom();
    var worldCoordinate = projection.fromLatLngToPoint(latlng);

    var pixelCoordinate = new google.maps.Point(
        worldCoordinate.x * numTiles,
        worldCoordinate.y * numTiles);
    var tileCoordinate = new google.maps.Point(
        Math.floor(pixelCoordinate.x / this.options.tileSize),
        Math.floor(pixelCoordinate.y / this.options.tileSize));

    return tileCoordinate;
  }
}

export default HeatTiles;
