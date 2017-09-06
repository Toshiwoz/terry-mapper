let fs = require('fs')
let app = require('electron');
let $ = require('./lib/js/jquery-1.12.4.js')
let osmtjsn = require('./lib/js/osmtogeojson.js')

// var stl = require('./styles/basic-v9/basic-v9.json')
var stl = require('./styles/outdoors/style.json')
var map_overlay = require('./maps/santa_teresa_c.json')
var data = fs.readFileSync('../desktop-electron/maps/map_small.osm', 'utf-8')
// console.log(app.resolve());
// var map_overlay = fs.readFileSync('../desktop-electron/maps/santa_teresa_c.geojson', 'utf8');
// map_overlay = JSON.parse(map_overlay);

console.log(map_overlay);

try {
    jsondata = $.parseXML(data);
} catch (e) {
    jsondata = JSON.parse(data);
}
geojson = osmtjsn(jsondata);

// delete stl.sources.composite;
// stl.sources['composite'] = {
//     type: 'geojson',
//     data: geojson
// };
console.log(stl.sources);
document.getElementById('geojson').value = JSON.stringify(geojson, null, 4);
console.log(geojson);
mapboxgl.accessToken = 'pk.eyJ1IjoiZGlnaXRhbGtpIiwiYSI6ImNqNXh1MDdibTA4bTMycnAweDBxYXBpYncifQ.daSatfva2eG-95QHWC9Mig';
var map = new mapboxgl.Map({
    container: 'map', // container id
    style: stl, //'mapbox://styles/mapbox/streets-v9', // stylesheet location
    center: [-78.3816748, -0.3498079], // starting position [lng, lat]
    zoom: 12 // starting zoom
});
// map.addSource('data', {
//     type: 'geojson',
//     data: geojson
// });

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
});
