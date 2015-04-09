jest.dontMock('../index');

var google = require('../__mocks__/google-mock');
var HeatTiles = require('../index');
var map;
var options;

describe('HeatTiles', function() {

  beforeEach(function() {
    map = new google.maps.Map();
    options = {};
  });

  it('creates an instance of HeatTiles', function() {
    var ht = new HeatTiles(map, options, google);
    expect(ht).not.toBe(undefined);
  })
});