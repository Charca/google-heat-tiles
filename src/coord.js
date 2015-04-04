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
