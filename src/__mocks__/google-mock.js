var google = {
  maps: {
    event: {
      addListener: function() {}
    },
    LatLng: function() {},
    MapTypeId: {
      SATELLITE: '',
      HYBRID: ''
    },
    Map: function() {
      return {
        setTilt: function() {},
        mapTypes: {
          set: function() {}
        },
        overlayMapTypes: {
          insertAt: function() {},
          removeAt: function() {}
        }
      };
    },
    Marker: function() {},
    MaxZoomService: function() {
      return {
        getMaxZoomAtLatLng: function() {}
      };
    },
    ImageMapType: function() {},
    Size: function() {},
    Point: function() {},
    places: {
      AutocompleteService: function() {
        return {
          getPlacePredictions: function() {}
        };
      }
    }
  }
};

module.exports = google;