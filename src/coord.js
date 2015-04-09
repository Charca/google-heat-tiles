class CoordMapType {
  constructor(tileSize, heatTiles) {
    this.tileSize = tileSize;
    this.heatTiles = heatTiles;
  }

  getTile(coord, zoom, ownerDocument) {
    let div = ownerDocument.createElement('div');
    let coordKey = coord.x + '_' + coord.y;
    let tileData = this.heatTiles.getTileData();
    let opacity = this.heatTiles.getOpacity();

    if(this.heatTiles.isDebug()) {
      div.innerHTML = coord;
    }

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
  }
}

export default CoordMapType;
