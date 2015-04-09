jest.dontMock('../__mocks__/google-mock');
jest.dontMock('../index');

var google = require('../__mocks__/google-mock');
var HeatTiles = require('../index');
var map;
var options;
var ht;

describe('HeatTiles', () => {

  beforeEach(() => {
    map = new google.maps.Map();
    options = {};
  });

  it('should create an instance of HeatTiles', () => {
    ht = new HeatTiles(map, options, google);
    expect(ht instanceof HeatTiles).toBe(true);
  });

  it('should set tiles as visible on show', () => {
    ht = new HeatTiles(map, options, google);
    expect(ht.isVisible()).toBe(false);
    ht.show();
    expect(ht.isVisible()).toBe(true);
  });

  it('should set tiles as non-visible on hide', () => {
    ht = new HeatTiles(map, options, google);
    ht.show().hide();
    expect(ht.isVisible()).toBe(false);
  });

  it('should overwrite default opacity with the provided one', () => {
    options.opacity = '.88';
    ht = new HeatTiles(map, options, google);
    expect(ht.getOpacity()).toEqual(options.opacity);

    ht.setOpacity('.2');
    expect(ht.getOpacity()).toEqual('.2');
  });
});