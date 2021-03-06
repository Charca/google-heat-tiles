import CoordMapType from './coord.js';
import projection from 'mercator-projection';

class HeatTiles {
  constructor(map, options, google) {
    let defaults = {};
    let i;
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
    for(i in options) {
      this.options[i] = options[i];
    }

    this.initialize();
  }

  initialize() {
    this._size = new this.google.maps.Size(this.options.tileSize, this.options.tileSize);

    this.google.maps.event.addListener(this.map, 'zoom_changed', f => {
      this._processData();
      if(this.isVisible()) {
        this.update();
      }
    });
  }

  show() {
    this.map.overlayMapTypes.insertAt(0, new CoordMapType(this._size, this));
    this._visible = true;
    return this;
  }

  hide() {
    this.map.overlayMapTypes.removeAt(0);
    this._visible = false;
    return this;
  }

  update() {
    this.map.overlayMapTypes.setAt(0, new CoordMapType(this._size, this));
    return this;
  }

  isVisible() {
    return this._visible;
  }

  isDebug() {
    return this.options.debug;
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
    let coords = '';
    let tile = {};
    let tileArray = [];
    let index = 0;
    let i;

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

  /**
   * Sets the green balance property for each tileData object
   */
  _setHeat() {
    const difference = this._maxPoints - this._minPoints || 1;
    let greenBalance = 0;
    let percent = 0;
    let i;

    for(i in this._tileData) {
      percent = (this._tileData[i].q - this._minPoints) * 100 / difference;
      greenBalance = Math.round(255 - (percent * 2.55));
      this._tileData[i].green = greenBalance;
    }
  }

  /**
   * Converts a LatLng object to a tile coordinate object
   *
   * @param {object} point - LatLng or LatLngLiteral object to convert
   * @return {object} - Point object with the tile coord
   */
  _fromPointToTileCoord(point) {
    const latlng = (typeof point.lat === 'function') ? {lat: point.lat(), lng: point.lng()} : point;
    const numTiles = 1 << this.map.getZoom();
    const worldCoordinate = projection.fromLatLngToPoint(latlng);

    let pixelCoordinate = new this.google.maps.Point(
        worldCoordinate.x * numTiles,
        worldCoordinate.y * numTiles);
    let tileCoordinate = new this.google.maps.Point(
        Math.floor(pixelCoordinate.x / this.options.tileSize),
        Math.floor(pixelCoordinate.y / this.options.tileSize));

    return tileCoordinate;
  }
}

export default HeatTiles;
