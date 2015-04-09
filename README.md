# google-heat-tiles [![Build Status](https://travis-ci.org/Charca/google-heat-tiles.svg)](https://travis-ci.org/Charca/google-heat-tiles)
Heatmap tiles for Google Maps

Visualize your map data in tiles. HeatTiles will show you a heatmap-like representation of your collection of LatLng points, and update it as you zoom in or out. It uses the [Mercator Projection](http://en.wikipedia.org/wiki/Mercator_projection) and Google's OverlayMapTypes to create and show the tiles.

![HeatTiles Screenshot](http://i.imgur.com/zzWBM2N.png)

## Instalation

You can simple download the latest release of HeatTiles from [here](https://github.com/Charca/google-heat-tiles/archive/v0.1.0.zip), or just download one of the following files:

- [google-heat-tiles.js](https://raw.githubusercontent.com/Charca/google-heat-tiles/v0.1.0/dist/google-heat-tiles.js)
- [google-heat-tiles.min.js](https://raw.githubusercontent.com/Charca/google-heat-tiles/v0.1.0/dist/google-heat-tiles.min.js)

NPM and Bower versions comming soon.

## Usage & API

To use HeatTiles, you have to include it to your project using one of the following methods:

### Standard script tag

```html
<script type="text/javascript" src="path/to/google-heat-tiles.js"></script>
```

### CommonJS

```javascript
var HeatTiles = require('path/to/google-heat-tiles');
```

### AMD
```javascript
define(['path/to/google-heat-tiles'], function(HeatTiles) {});
```

And then create a new HeatTiles instance passing your `map` object and an optional `options` object.

After that you can use the `setData()` method with your array of LatLng or LatLngLiteral objects, and call the `show()` method to show the tiles in your map.

### Full example:

```javascript
var mapOptions = {
  center: { lat: 37.774546, lng: -122.433523 },
  zoom: 14
};

var map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);

var heatTilesOptions = {
  opacity: 0.6
};

var data = [
  new google.maps.LatLng(37.782551, -122.445368),
  new google.maps.LatLng(37.782745, -122.444586)
];

var heatTiles = new HeatTiles(map, heatTilesOptions);
heatTiles.setData(data);
heatTiles.show();
```

### Options

#### tileSize (int)
The size in pixels of the tiles on top of your map.
**Default: 256**

#### opacity (float between 0 and 1)
Level of opacity of your tiles so they don't cover the map.
**Default: 0.3**

#### debug (boolean)
Enable or disable debug mode to show the tile coordinates on your map.
**Default: false**


### API

#### .setData(data)
Recieves an array of LatLng or LatLngLiteral objects and processes the data

```javascript
var data = [
  new google.maps.LatLng(37.782551, -122.445368),
  new google.maps.LatLng(37.782745, -122.444586)
];

// or

var data = [
  {lat: 37.782551, lng: -122.445368},
  {lat: 37.782745, lng: -122.444586}
];

heatTiles.setData(data);
```

#### .show()
Shows the tiles in your map

```javascript
heatTiles.setData(data);
heatTiles.show();
```

#### .hide()
Hides the tiles in your map

```javascript
heatTiles.setData(data);
heatTiles.show();

// ...later...
heatTiles.hide();
```

#### .update()
Updates your tiles. Useful when you change your data or a HeatTile option such as opacity and want to update your map without having to hide().show();

```javascript
heatTiles.setData(data);
heatTiles.show();

// ...later...
heatTiles.setData(newData);
heatTiles.update();
```

#### .setOpacity(opacity)
Receives the opacity level (between 0 and 1) and updates the options object. You have to call `.update()` for the map to chage.

```javascript
heatTiles.setData(data);
heatTiles.show();

// ...later...
heatTiles.setOpacity(0.88);
heatTiles.update();
```

## Dependencies

- Google Maps JavaScript API

## Contributing
Feel free to fork this repo and add magic to HeatTiles. Just clone it and install its dependencies with:

```
npm install
```

You can run the gulp build with:

```
npm run build
```

And the Jest unit tests with:

```
npm test
```

Thanks for reading (:

By [@Charca](http://www.twitter.com/charca)