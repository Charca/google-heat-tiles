jest.dontMock('../coord');

var CoordMapType = require('../coord');
var tileSize;
var heatTiles;
var cmt;
var coord;
var div;

describe('CoordMapType', () => {
  beforeEach(() => {
    coord = {x: '123', y: '456'};
    tileSize = {width: 512, height: 512};
    heatTiles = {
      debug: true,
      getTileData: function() { return {} },
      getOpacity: function() { return '0.5' },
      isDebug: function() { return this.debug; }
    };
  });

  it('should create an object with tileSize and heatTiles attributes', () => {
    cmt = new CoordMapType(tileSize, heatTiles);

    expect(cmt.tileSize).toEqual(tileSize);
    expect(cmt.heatTiles).toEqual(heatTiles);
  });

  it('should generate a div element based on the given data', () => {
    cmt = new CoordMapType(tileSize, heatTiles);
    div = cmt.getTile(coord, 1, document);

    expect(div.style.width).toEqual(tileSize.width + 'px');
    expect(div.style.height).toEqual(tileSize.height + 'px');
  });

  it('should generate empty tile content when not in debug mode', () => {
    heatTiles.debug = false;

    cmt = new CoordMapType(tileSize, heatTiles);
    div = cmt.getTile(coord, 1, document);

    expect(div.innerHTML).toBe('');
  });
});