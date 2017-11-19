# terry-mapper
A tool to display, edit, and print maps and overlays

## Features

- offiline maps using [Mapbox GL JS](https://github.com/mapbox/mapbox-gl-js) and [Electron](https://github.com/electron)
- converts OSM files to geojson (using [osmtogeojson](https://github.com/tyrasd/osmtogeojson))
- uses geojson files as only source of a custom mapbox style
- it is now automatically converting .osm files that are pasted into ```src/maps/``` folder.
- ´´´maps_overlay´´´ is instead used to store pois and areas for the territories


## TODOs

- have several files imported and displyed (WIP)
- interface to draw polygons nad pois and save them (WIP)
- interface to modify and locally save styles
- printing maps
