let fs = require('fs')
let app = require('electron');
let $ = require('./lib/jquery/jquery-3.2.1.js')
let osmtjsn = require('./lib/osmtogeojson/osmtogeojson.js')

// var stl = require('./styles/basic-v9/basic-v9.json')
var stl_mapzen_simple = require('./styles/mapzen-tiles-simple/simple-style.json')
var stl_json = require('./styles/json-custom/json-style.json')
var stl = require('./styles/outdoors/style.json')
var map_overlay = require('./maps/santa_teresa_c.json')
var data = fs.readFileSync('./maps/santa_teresa_map.osm', 'utf-8')
// console.log(app.resolve());
// var map_overlay = fs.readFileSync('../desktop-electron/maps/santa_teresa_c.geojson', 'utf8');
// map_overlay = JSON.parse(map_overlay);

// console.log(map_overlay);

try {
    jsondata = $.parseXML(data);
} catch (e) {
    jsondata = JSON.parse(data);
}
geojson = osmtjsn(jsondata, {flatProperties: true});

fs.writeFile("./maps/santa_teresa_map.json", JSON.stringify(geojson, null, 4), function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});

delete stl_json.sources["mapbox"];
stl_json.sources['jsonsource'] = {
    type: 'geojson',
    data: geojson
};
// console.log(stl_json.sources);
// document.getElementById('geojson').value = JSON.stringify(geojson, null, 4);
console.log(geojson);
mapboxgl.accessToken = 'pk.eyJ1IjoiZGlnaXRhbGtpIiwiYSI6ImNqNXh1MDdibTA4bTMycnAweDBxYXBpYncifQ.daSatfva2eG-95QHWC9Mig';
var map = new mapboxgl.Map({
    container: 'map', // container id
    style: stl_json,
    // style: 'mapbox://styles/mapbox/streets-v9', // stylesheet location
    center: [-78.3816748, -0.3498079], // starting position [lng, lat]
    zoom: 14, // starting zoom
    pitch: 45,
    bearing: -17.6,
    hash: true,
    container: 'map'
});

map.on('load', function () {
  console.log('loaded');
  map.addSource('santa', {
      type: 'geojson',
      data: map_overlay
  });
   map.addLayer({
      "id": "points",
      "type": "fill",
      "source": "santa",
       "paint": {
            "fill-color": "#888888",
            "fill-opacity": 0.4
        },
        "filter": ["==", "$type", "Polygon"]
  });
   map.addLayer({
      "id": "lines",
      "type": "circle",
      "source": "santa",
       "paint": {
            "circle-radius": 6,
            "circle-color": "#B42222"
        },
        "filter": ["==", "$type", "Point"],
  });
   // Insert the layer beneath any symbol layer.
    var layers = map.getStyle().layers.reverse();
    var labelLayerIdx = layers.findIndex(function (layer) {
        return layer.type !== 'symbol';
    });
    var labelLayerId = labelLayerIdx !== -1 ? layers[labelLayerIdx].id : undefined;
    // map.addLayer({
    //     'id': '3d-buildings',
    //     'source': 'composite',
    //     'source-layer': 'building',
    //     'filter': ['==', 'extrude', 'true'],
    //     'type': 'fill-extrusion',
    //     'minzoom': 15,
    //     'paint': {
    //         'fill-extrusion-color': '#aaa',
    //         'fill-extrusion-height': {
    //             'type': 'identity',
    //             'property': 'height'
    //         },
    //         'fill-extrusion-base': {
    //             'type': 'identity',
    //             'property': 'min_height'
    //         },
    //         'fill-extrusion-opacity': .6
    //     }
    // }, labelLayerId);
});
