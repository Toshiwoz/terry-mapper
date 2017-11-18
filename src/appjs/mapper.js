let app = require('electron');
let canvasBuffer = require('electron-canvas-to-buffer');
let $ = require('jquery');
let fs = require('fs');
let path = require('path');
let osmtjsn = require('osmtogeojson');
let turf = require('@turf/turf');
let mapboxgl = require('mapbox-gl');
let MapboxDraw = require('@mapbox/mapbox-gl-draw');

var stl_json = require('./styles/json-custom/json-style.json');
var map_overlay = require('./maps_overlay/santa_teresa_c.json');

const mapsFolder = path.resolve(__dirname, 'maps/');
const mapsOVerlayFolder = './src/maps_overlay/';

// need to remove source from style file
// there should be a better way to design style files
delete stl_json.sources['mapbox'];

// console.log(app.resolve());
// var map_overlay = fs.readFileSync('../desktop-electron/maps/santa_teresa_c.geojson', 'utf8');
// map_overlay = JSON.parse(map_overlay);

// Read the maps directory and search for OSM files
// for each OSM file we proceed to convert it, and if it succeeds
// we remove the original OSM file and leave the converted GEOJSON file
var geojsonData = null;

fs.readdirSync(mapsFolder).forEach(file => {
    var fileExt = path.extname(path.resolve(mapsFolder, file));
    var fileNoExt = path.basename(file, fileExt);
    // If we find and OSM file we convert that into GEOJSON
    if (fileExt === '.osm') {
        var osmContent = fs.readFileSync(path.resolve(mapsFolder, file), 'utf-8');
        var osmData = null;
        try {
            osmData = $.parseXML(osmContent);
            geojsonData = osmtjsn(osmData, {
                flatProperties: true
            });
        } catch (e) {
            console.log(e);
            geojsonData = JSON.parse(osmContent);
        }
        console.log(geojsonData);
        fs.writeFile(path.resolve(mapsFolder, fileNoExt + ".json"), JSON.stringify(geojsonData, null, 4), function (err) {
            if (err) {
                return console.log(err);
            } else {
                console.log("The file '" + fileNoExt + "' was converted!");
                fs.unlinkSync(path.resolve(mapsFolder, file));
            }
        });
    }
    if (fileExt == '.json') {
        var geojsonData = require(path.resolve(mapsFolder, file));
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
    hash: true
});

var draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
        point: true,
        polygon: true,
        trash: true
    }
});

map.addControl(draw);

// your canvas drawing
var canvas = map.getCanvas();
var context = canvas.getContext('2d');
// as a buffer
var buffer = canvasBuffer(canvas, 'image/png');

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
            "fill-color": "#aaaaaa",
            "fill-opacity": 0.6
        },
        "filter": ["==", "$type", "Polygon"]
    }, "landuse-residential");
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
    map.addLayer({
        "id": "pois_labels",
        "type": "symbol",
        "source": "santa",
        "filter": [
            "all", ["==", "$type", "Point"],
            ["has", "poi"]
        ],
        "layout": {
            "symbol-placement": "point",
            "text-field": "{name}",
            "text-font": [
                "Open Sans Semibold",
                "Arial Unicode MS Bold"
            ],
            "text-max-width": 6,
            "text-offset": [0, -1],
            "text-size": {
                "stops": [
                    [
                        6,
                        12
                    ],
                    [
                        12,
                        16
                    ]
                ]
            }
        },
        "paint": {
            "text-color": "#666",
            "text-halo-color": "rgba(255,255,255,0.75)",
            "text-halo-width": 1,
            "text-halo-blur": 1
        }
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
    // exportToImage();

    for (var k in map_overlay.features) {
        if (map_overlay.features[k].geometry.type === 'Polygon' || map_overlay.features[k].geometry.type === 'Point') {
            var geom = map_overlay.features[k].geometry;
            console.log(geom);
            var id = draw.add(geom);
        }
    }


    map.on('draw.create', updateArea);
    map.on('draw.delete', updateArea);
    map.on('draw.update', updateArea);

    function updateArea(e) {
        var data = draw.getAll();
        if (data.features.length > 0) {
            fs.writeFile(mapsOVerlayFolder + "terr.json", JSON.stringify(data, null, 4), function (err) {
                if (err) {
                    return console.log(err);
                } else {
                    console.log("The Map overlay was saved!");
                }
            });
            console.log(data);
        } else {
            if (e.type !== 'draw.delete') alert("Use the draw tools to draw a polygon!");
        }
    }
});

document.getElementById('export').onclick = exportToImage;

function exportToImage() {
    console.log('exportToImage');
    console.log(buffer);
    // write canvas to file
    fs.writeFile('image.png', buffer, function (err) {
        if (err) throw err;
        else console.log('Write of image was successful');
    })
    // var mapCanvas = map.getCanvas();
    // oImg = new Image();
    // oImg.src = mapCanvas.toDataURL();
    // document.body.appendChild(oImg);
    // mapCanvas.toBlob(function(blob) {
    //   var newImg = document.createElement('img'),
    //   url = URL.createObjectURL(blob);
    //   console.log(url);

    //   newImg.onload = function() {
    //     // no longer need to read the blob so it's revoked
    //     URL.revokeObjectURL(url);
    //   };

    //   newImg.src = url;
    //   document.body.appendChild(newImg);
    // });
};