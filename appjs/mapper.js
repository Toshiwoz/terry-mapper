let fs = require('fs');
var path = require('path');
let app = require('electron');
let $ = require('./lib/jquery/jquery-3.2.1.js')
let osmtjsn = require('./lib/osmtogeojson/osmtogeojson.js')

var stl_json = require('./styles/json-custom/json-style.json')
var map_overlay = require('./maps_overlay/santa_teresa_c.json')
var data = null;

// need to remove source from style file
// there should be a better way to design style files
delete stl_json.sources["mapbox"];

// console.log(app.resolve());
// var map_overlay = fs.readFileSync('../desktop-electron/maps/santa_teresa_c.geojson', 'utf8');
// map_overlay = JSON.parse(map_overlay);

// Read the maps directory and search for OSM files
// for each OSM file we proceed to convert it, and if it succeeds
// we remove the original OSM file and leave the converted GEOJSON file
const mapsFolder = './maps/';
var geojsonData = null;

fs.readdirSync(mapsFolder).forEach(file => {
    var fileExt = path.extname(mapsFolder + file);
    var fileNoExt = path.basename(file, fileExt);
    // If we find and OSM file we convert that into GEOJSON
    if (fileExt == '.osm') {
        osmContent = fs.readFileSync(mapsFolder + file, 'utf-8');
        var osmData = null;
        try {
            osmData = $.parseXML(osmContent);
            geojsonData = osmtjsn(osmData, { flatProperties: true });
        } catch (e) {
            console.log(e);
            geojsonData = JSON.parse(osmContent);
        }
        console.log(geojsonData);
        fs.writeFile(mapsFolder + fileNoExt + ".json", JSON.stringify(geojsonData, null, 4), function(err) {
            if (err) {
                return console.log(err);
            }
            else {
              console.log("The file '" + fileNoExt + "' was converted!");
              fs.unlinkSync(mapsFolder + file);
            }
        });
    }
    if (fileExt == '.json') {
        var geojsonData = require(mapsFolder + file);
        stl_json.sources['jsonsource'] = {
            type: 'geojson',
            data: geojsonData
        };
    }
});

// console.log(stl_json.sources);
// document.getElementById('geojson').value = JSON.stringify(geojson, null, 4);
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

map.on('load', function() {
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
    // // Insert the layer beneath any symbol layer.
    //  var layers = map.getStyle().layers.reverse();
    //  var labelLayerIdx = layers.findIndex(function (layer) {
    //      return layer.type !== 'symbol';
    //  });
    //  var labelLayerId = labelLayerIdx !== -1 ? layers[labelLayerIdx].id : undefined;
    //  map.addLayer({
    //      'id': '3d-buildings',
    //      'source': 'jsonsource',
    //      'filter': ['has', 'building'],
    //      'type': 'fill-extrusion',
    //      'minzoom': 15,
    //      'paint': {
    //          'fill-extrusion-color': '#aaa',
    //          'fill-extrusion-height': {
    //              'type': 'identity',
    //              'property': 'building:levels'
    //          },
    //          'fill-extrusion-base': 3,
    //          'fill-extrusion-opacity': .6
    //      }
    //  }, labelLayerId);
});


